import { IAction, Reducer, ISubAction, Dispatch, ACTIONS_DELIMITER } from "./types";

export interface IController<S extends object, PublicActions = {}> {
	/**
	 * Возвращает начальное состояние
	 */
	readonly getInitState: () => S;

	/**
	 * Возвращает функцию, обрабатывающую действия
	 * @returns Reducer
	 */
	getReducer(): Reducer<S>;

	/**
	 * Возвращает функцию, которая принимает функцию dispatch текущего компонента 
	 * и возвращает функцию dispatch для дочернего компонента по заданному идентификатору
	 * @param path идентификатор дочернего компонента, или массив идентификаторов
	 * @param dispatch dispatch текущего компонента
	 */
	getWrapDispatch(path: string | string[]): (dispatch: Dispatch) => Dispatch;

	/**
	 * Возвращает функцию, которая принимает функцию dispatch текущего компонента 
	 * и возвращает функцию dispatch для дочернего компонента по заданному идентификатору
	 * @param path идентификатор дочернего компонента, или массив идентификаторов
	 * @param dispatch dispatch текущего компонента
	 */
	getStatePart(path: string | string[]): (state: S) => any;

	/**
	 * Возвращает функции, которые создают дейтсвия
	 */
	readonly getActions: () => PublicActions;

	/**
	 * Возвращает дочерний контроллер
	 * @param id Идентификатор дочернего контроллера
	 */
	getController<CS extends object = {}, CPubActions = any>(id: string): IController<CS, CPubActions> | null;

	/**
	 * Возвращает ассоциативный массив дочерних контроллеров
	 */
	getChildren(): {[key: string]: IController<any, any>};
}

export interface IBuilder<S extends object, PublicActions = {}> {
	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @param props свойства переданные элементу при инициализации
	 */
	setInitState(f: () => S):  void;

	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для создания действий
	 */
	action<T>(
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (payload?: T) => IAction<T>;

	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для создания действий
	 */
	subAction<T = any>(
		id: string,
		handler: (state: S, action: ISubAction<T>) => S
	): (key: string, payload?: T) => IAction<T>;

	/**
	 * Добавляет расширяемый компонент
	 * @param key - индетификатор расширяемого компонента
	 * @param builder - объект для построения расширяемого компонента
	 */
	addChild(
		key: string,
		controller: IController<any, any>,
		wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch
	): (dispatch: Dispatch) => Dispatch;

	/**
	 * Создает контроллер копмпонента
	 * @returns объект для создани компонента
	 */
	getController(): IController<S, PublicActions>;
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 */
class ComponentBuilder<S extends object, PublicActions = {}> implements IBuilder<S, PublicActions> {
	private _initState: () => S;
	private _handlers: {
		[id: string]: Reducer<S>
	} = {};
	private _subHandlers: {
		[id: string]: (state: S, action: ISubAction<any>) => S
	} = {};
	private _childDispatchs: { [key: string]: Dispatch } = {};
	private _children: { [key: string]: IController<any, any> } = {};
	private _wrapChildDispatch: {
		[id: string]: (origin: Dispatch, child: Dispatch) => Dispatch
	} = {};
	
	setInitState(f: () => S): void {
		this._initState = f;
	}

	action<T>(
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (payload?: T) => IAction<T> {
		this._handlers[id] = handler;
		return (payload: T) => ({ type: id, payload: payload });
	}

	subAction<T = any>(
		id: string,
		handler: (state: S, action: ISubAction<T>) => S
	): (key: string, payload?: T) => IAction<T> {
		this._subHandlers[id] = handler;
		return (key: string, payload?: T) => ({ type: joinKeys(id, key), payload: payload });
	}

	addChild(
		key: string,
		controller: IController<any, any>,
		wrapChildDispatch: (origin: Dispatch, child: Dispatch) => Dispatch = (origin, child) => child
	): (dispatch: Dispatch) => Dispatch {
		this._children[key] = controller;
		this._wrapChildDispatch[key] = wrapChildDispatch;
		return (dispatch) => wrapChildDispatch(dispatch, wrapDispatch(dispatch, key));
	}

	getController(): IController<S, PublicActions> {
		return new Controller<S, PublicActions>(
			this._initState,
			this._children,
			this._handlers,
			this._subHandlers,
			this._wrapChildDispatch
		);
	}
}

class Controller<S extends object, PublicActions = {}> implements IController<S, PublicActions>{
	private _builtGetInitState: () => S;
	private _builtReducer: Reducer<S>;
	private _builtActions: PublicActions;
	
	constructor(
		private _initState: () => S,
		private _children: { [key: string]: IController<any, any> } = {},
		private _handlers: {
			[id: string]: Reducer<S>
		} = {},
		private _subHandlers: {
			[id: string]: (state: S, action: ISubAction<any>) => S
		} = {},
		private _wrapChildDispatch: {
			[id: string]: (origin: Dispatch, child: Dispatch) => Dispatch
		} = {}
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

	private _getChildDispatch(dispatch: Dispatch, key: string): Dispatch {
		return this._wrapChildDispatch[key](dispatch, wrapDispatch(dispatch, key));
	}

	private _buildInitState(): () => S {
		return () => {
			let initState: any = !!this._initState ? this._initState() : {};
			for (let builderKey in this._children) {
				initState[builderKey] = initState[builderKey] || this._children[builderKey].getInitState();
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
			return this._handlers.hasOwnProperty(key || baseAction.type) ? 
					this._handlers[key || baseAction.type](state, action) :
				this._subHandlers.hasOwnProperty(key) ? 
					this._subHandlers[key](state, getSubAction(action)) :
				this._children.hasOwnProperty(key) ? 
					{ ...(state as any), [key]: this._children[key].getReducer()(state[key], action) } :
					state;
		};
	}

	getStatePart(paramPath: string | string[]) {
		if (!paramPath) {
			throw new Error("The 'path' parameter must be specified.")
		}
		let path: string[] = typeof paramPath === 'string' ? paramPath.split(ACTIONS_DELIMITER) : paramPath;

		return (state) => getStatePart(state, path);
	}

	getWrapDispatch(paramPath: string | string[]) {
		if (!paramPath) {
			throw new Error("The 'path' parameter must be specified.")
		}
		let path: string[] = typeof paramPath === 'string' ? paramPath.split(ACTIONS_DELIMITER) : paramPath;

		return (dispatch: Dispatch): Dispatch => {
			if (!path.length) {
				return dispatch;
			} else if (path.length === 1) {
				return this._getChildDispatch(dispatch, path[0]);
			} else {
				const childController = this._children[path[0]];
				if (!childController) {
					return this._getChildDispatch(dispatch, path[0]);
				} else {
					return childController.getWrapDispatch(path.slice(1))(
						this._getChildDispatch(dispatch, path[0])
					);
				}
			}
		};
	}

	private _buildActions() {
		return Object.keys(this._handlers).reduce(
			(actions, action) => ({...actions, [action]: (payload?: any) => ({ type: action, payload: payload })}),
			Object.keys(this._subHandlers).reduce(
				(actions, action) => ({
					...actions, 
					[action]: (key: string, payload?: any) => ({ type: joinKeys(action, key), payload: payload })
				}),
				{} as any
			)
		);
	}

	public getController(id: string): IController<any, any> | null {
		return this._children[id] || null;
	}

	public getChildren(): {[key: string]: IController<any, any>} {
		return {...this._children};
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

const getSubAction = <T>(baseAction: IAction<T>): ISubAction<T> => {
	const { key, action } = unwrapAction(baseAction);
	return { ...action, key };
}

export const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

export const wrapDispatch = (
	dispatch: Dispatch,
	key: string
): Dispatch => {
	return (action: IAction<any>) => {
		dispatch({ type: joinKeys(key, action.type), payload: action.payload });
	}
};

export function getStatePart(state: any, path: string[]): any {
	return path.reduce((state, key) => state[key], state);
}

export function getChildController(controller: IController<any, any>, path: string | string[]): IController<any, any> {
	let keys: string[] = typeof path === 'string' ? path.split(ACTIONS_DELIMITER) : path;
	return keys.reduce((controller, key) => controller.getController(key), controller);
}

export function createBuilder<S extends object, Actions = {}>(): IBuilder<S, Actions> {
	return new ComponentBuilder<S, Actions>();
}