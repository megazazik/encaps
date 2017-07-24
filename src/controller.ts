import { 
	IAction, 
	Reducer, 
	SubReducer, 
	ISubAction, 
	Dispatch, 
	ACTIONS_DELIMITER, 
	IActionCreator, 
	ISubActionCreator,
	ComponentPath
} from "./types";

export interface IActionTypes {
	[key: string]: any
}

export type IPublicActions<Actions, SubActions> = {[K in keyof Actions]: IActionCreator<Actions[K]>} & {[SK in keyof SubActions]: ISubActionCreator<SubActions[SK]>}

export interface IController<S extends object = {}, Actions extends IActionTypes = {}, SubActions extends IActionTypes = {}> {
	/**
	 * Возвращает начальное состояние
	 */
	getInitState(): S;

	/**
	 * Возвращает функции, которые создают дейтсвия
	 */
	getActions(): IPublicActions<Actions, SubActions>;

	/**
	 * Возвращает функцию, обрабатывающую действия
	 * @returns Reducer
	 */
	getReducer(): Reducer<S>;

	/**
	 * Возвращает функцию dispatch для дочернего компонента по заданному идентификатору
	 * @param path идентификатор дочернего компонента, или массив идентификаторов
	 * @param dispatch dispatch текущего компонента
	 */
	// getWrapDispatch(path: ComponentPath): (dispatch: Dispatch) => Dispatch;

	/**
	 * Возвращает состояние дочернего компонента по заданному идентификатору
	 * @param path идентификатор дочернего компонента, или массив идентификаторов
	 * @param state состояние текущего компонента
	 */
	// getStatePart(path: ComponentPath): (state: S) => any;

	/**
	 * Возвращает ассоциативный массив дочерних контроллеров
	 */
	getChildren(): {[key: string]: IController<any, any, any>};
}

export interface IBuilder<S extends object = {}, Actions extends IActionTypes = {}, SubActions extends IActionTypes = {}> {
	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 */
	setInitState<NS extends object>(f: () => NS):  IBuilder<S & NS, Actions, SubActions>;

	/**
	 * Добавляет обработчик действия
	 * @param handlers ассоциативный массив обработчиков действия
	 */
	action<AS extends IActionTypes>(
		handlers: {[K in keyof AS]: Reducer<S, AS[K]>} & {[key: string]: Reducer<any, any>}
	): IBuilder<S, Actions & AS, SubActions>;

	/**
	 * Добавляет обработчик параметризированных действий
	 * @param handlers ассоциативный массив обработчиков действия
	 */
	subAction<AS extends IActionTypes>(
		handlers: {[K in keyof AS]: SubReducer<S, AS[K]>} & {[key: string]: SubReducer<any, any>}
	): IBuilder<S, Actions, SubActions & AS>;

	/**
	 * Добавляет дочерний компонент
	 * @param key индетификатор дочернего компонента
	 * @param controller контроллер дочернего компонента
	 * @param wrapChildDispatch функция, оборачивающая dispatch дочернего компонента
	 */
	addChild(
		key: string,
		controller: IController<any, any>
		// wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch
	): IBuilder<S, Actions, SubActions>;

	/**
	 * Создает контроллер компонента
	 * @returns объект для создани компонента
	 */
	getController(): IController<S, Actions, SubActions>;
}

interface IBuilderState<S, Actions, SubActions> {
	initState: () => S;
	handlers: {[id: string]: Reducer<S>};
	subHandlers: {[id: string]: SubReducer<S>};
	children: { [key: string]: IController<any, any, any> };
	// wrapChildDispatch: {[id: string]: (origin: Dispatch, child: Dispatch) => Dispatch};
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 * @type Actions действия компонента
 * @type SubActions параметризированные действия компонента
 */
class ComponentBuilder<S extends object = {}, Actions extends IActionTypes = {}, SubActions extends IActionTypes = {}>
	implements IBuilder<S, Actions, SubActions> 
{
	private _state: IBuilderState<S, Actions, SubActions>;

	constructor(state?: IBuilderState<S, Actions, SubActions>) {
		this._state = state || {
			initState: () => ({}) as S,
			handlers: {},
			subHandlers: {},
			children: {}
			// wrapChildDispatch: {}
		}
	}

	setInitState<NS extends object>(f: () => NS): IBuilder<S & NS, Actions, SubActions> {
		return new ComponentBuilder<S & NS, Actions, SubActions>({
			...copyBuilderState(this._state),
			initState: f
		} as any);
	}

	action<AS extends IActionTypes>(
		handlers: {[K in keyof AS]: Reducer<S, AS[K]>} & {[key: string]: Reducer<any, any>}
	): IBuilder<S, Actions & AS, SubActions> {
		const copy = copyBuilderState(this._state);
		return new ComponentBuilder<S, Actions & AS, SubActions>({
			...copy,
			handlers: {...copy.handlers, ...handlers as any}
		} as any);
	}

	subAction<AS extends IActionTypes>(
		handlers: {[K in keyof AS]: SubReducer<S, AS[K]>} & {[key: string]: SubReducer<any, any>}
	): IBuilder<S, Actions, SubActions & AS> {
		const copy = copyBuilderState(this._state);
		return new ComponentBuilder<S, Actions, SubActions & AS>({
			...copy,
			subHandlers: {...copy.subHandlers, ...handlers as any}
		} as any);
	}

	addChild(
		key: string,
		controller: IController<any, any>,
		// wrapChildDispatch: (origin: Dispatch, child: Dispatch) => Dispatch = (origin, child) => child
	): IBuilder<S, Actions, SubActions> {
		const copy = copyBuilderState(this._state);
		return new ComponentBuilder<S, Actions, SubActions>({
			...copy,
			children: {...copy.children, [key]: controller}
			// wrapChildDispatch: {...copy.wrapChildDispatch, [key]: wrapChildDispatch}
		} as any);
	}

	getController(): IController<S, Actions, SubActions> {
		return new Controller<S, Actions, SubActions>(copyBuilderState(this._state));
	}
}

class Controller<S extends object = {}, Actions extends IActionTypes = {}, SubActions extends IActionTypes = {}>
	implements IController<S, Actions, SubActions> 
{
	private _builtGetInitState: () => S;
	private _builtReducer: Reducer<S>;
	private _builtActions: any;
	
	constructor(
		private _state: IBuilderState<S, Actions, SubActions>
	) {
		this._init();
	}

	private _init(): void {
		this._builtGetInitState = this._buildInitState();
		this._builtReducer = this._buildReducer();
		this._builtActions = this._buildActions();
	}

	public readonly getInitState = () => this._builtGetInitState();
	public readonly getActions = () => ({...this._builtActions as any});

	// private _getChildDispatch(dispatch: Dispatch, key: string): Dispatch {
	// 	return this._state.wrapChildDispatch[key](dispatch, wrapDispatch(dispatch, key));
	// }

	private _buildInitState(): () => S {
		return () => {
			let initState: any = !!this._state.initState ? this._state.initState() : {};
			for (let builderKey in this._state.children) {
				initState[builderKey] = initState[builderKey] || this._state.children[builderKey].getInitState();
			}

			return initState;
		}
	}

	getReducer(): Reducer<S> {
		return this._builtReducer;
	}

	private _buildReducer(): Reducer<S> {
		return (state: S = this.getInitState(), baseAction: IAction<any> = { type: "", payload: null }): S => {
			const { key, action } = unwrapAction(baseAction);
			return this._state.handlers.hasOwnProperty(key || baseAction.type) ? 
					this._state.handlers[key || baseAction.type](state, action) :
				this._state.subHandlers.hasOwnProperty(key) ? 
					this._state.subHandlers[key](state, getSubAction(action)) :
				this._state.children.hasOwnProperty(key) ? 
					{ ...(state as any), [key]: this._state.children[key].getReducer()(state[key], action) } :
					state;
		};
	}

	// getStatePart(paramPath: ComponentPath) {
	// 	if (!paramPath) {
	// 		throw new Error("The 'path' parameter must be specified.")
	// 	}
	// 	let path: string[] = typeof paramPath === 'string' ? paramPath.split(ACTIONS_DELIMITER) : paramPath;

	// 	return (state) => getStatePart(path, state);
	// }

	// getWrapDispatch(paramPath: ComponentPath) {
	// 	let path: string[] = typeof paramPath === 'string' ? paramPath.split(ACTIONS_DELIMITER) : paramPath;

	// 	return (dispatch: Dispatch): Dispatch => {
	// 		if (!path || !path.length) {
	// 			return dispatch;
	// 		} else if (path.length === 1) {
	// 			return this._getChildDispatch(dispatch, path[0]);
	// 		} else {
	// 			const childController = this._state.children[path[0]];
	// 			if (!childController) {
	// 				return this._getChildDispatch(dispatch, path[0]);
	// 			} else {
	// 				return childController.getWrapDispatch(path.slice(1))(
	// 					this._getChildDispatch(dispatch, path[0])
	// 				);
	// 			}
	// 		}
	// 	};
	// }

	private _buildActions() {
		return Object.keys(this._state.handlers).reduce(
			(actions, action) => ({...actions, [action]: (payload?: any) => ({ type: action, payload: payload })}),
			Object.keys(this._state.subHandlers).reduce(
				(actions, action) => ({
					...actions, 
					[action]: (key: string, payload?: any) => ({ type: joinKeys(action, key), payload: payload })
				}),
				{} as any
			)
		);
	}

	public getChildren(): {[key: string]: IController<any, any>} {
		return {...this._state.children};
	}
}

export const unwrapAction = (action: IAction<any>): { action: IAction<any>; key: string } => {
	return {
		key: action.type.substring(0, action.type.indexOf(ACTIONS_DELIMITER)),
		action: {
			payload: action.payload,
			type: action.type.substring(action.type.indexOf(ACTIONS_DELIMITER) + 1)
		}
	};
}

function copyBuilderState<S, Actions, SubActions>(
	state: IBuilderState<S, Actions, SubActions>
): IBuilderState<S, Actions, SubActions> {
	return {
		initState: state.initState,
		handlers: {...state.handlers},
		subHandlers: {...state.subHandlers},
		children: {...state.children}
		// wrapChildDispatch: {...state.wrapChildDispatch}
	};
}

const getSubAction = <T>(baseAction: IAction<T>): ISubAction<T> => {
	const { key, action } = unwrapAction(baseAction);
	return { ...action, key };
}

export const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

export const wrapDispatch = (
	key: ComponentPath,
	dispatch: Dispatch
): Dispatch => {
	return (action: IAction<any>) => 
		dispatch({ type: joinKeys(Array.isArray(key) ? key.join(ACTIONS_DELIMITER) : key, action.type), payload: action.payload });
};

export function getStatePart(path: ComponentPath, state: any): any {
	if (!path) {
		return state;
	}

	let paths: string[];
	if (typeof path === 'string') {
		paths = path.split(ACTIONS_DELIMITER);
	} else {
		paths = path;
	}

	return paths.reduce((state, key) => state[key], state);
}

export function getChildController(controller: IController<any, any>, path: ComponentPath): IController<any, any> {
	let keys: string[] = typeof path === 'string' ? path.split(ACTIONS_DELIMITER) : path;
	return keys.reduce((controller, key) => controller.getChildren()[key], controller);
}

export function createBuilder(): IBuilder {
	// TODO fix declaration error
	return new ComponentBuilder() as IBuilder;
}