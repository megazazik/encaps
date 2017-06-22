import { IAction, Reducer, ISubAction, Dispatch, ACTIONS_DELIMITER } from "./types";

export interface IController<S extends object, PublicState extends object, PublicActions> {
	/**
	 * Возвращает начальное состояние
	 */
	getInitState(): () => S;

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
	 * Возвращает публичное состояние компонента на основе его состояния
	 * @param state текущее состояние
	 */
	getSelectState(): (state: S) => PublicState;

	/**
	 * Возвращает публичные свойства компонента, связанные с генерацией действий
	 * @param dispatch функция для вызова действий
	 */
	getSelectActions(): (dispatch: Dispatch) => PublicActions;


	/**
	 * Возвращает дочерний контроллер
	 * @param id Идентификатор дочернего контроллера
	 */
	getController<CS extends object = any, CPubS extends object = any, CPubD = any>(id: string): IController<CS, CPubS, CPubD> | null;
}

export interface IBuilder<S extends object, PublicState extends object, PublicActions> {
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
		controller: IController<any, any, any>,
		wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch
	): (dispatch: Dispatch) => Dispatch;

	/**
	 * Задает функцию, которая возвращает открытие свойства на основе текущего состояния 
	 * @param state текущее состояние
	 */
	setSelectState(selectState: (state: S) => PublicState): void;

	/**
	 * Задает функцию, которая возвращает открытие методы
	 * @param dispatch функция, возбуждающия действия
	 */
	setSelectActions(selectActions: (dispatch: Dispatch) => PublicActions ): void;

	/**
	 * Создает контроллер копмпонента
	 * @returns объект для создани компонента
	 */
	getController(): IController<S, PublicState, PublicActions>;
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 */
class ComponentBuilder<S extends object, PublicState extends object, PublicActions> implements IBuilder<S, PublicState, PublicActions> {
	private _initState: () => S;
	private _handlers: {
		[id: string]: Reducer<S>
	} = {};
	private _subHandlers: {
		[id: string]: (state: S, action: ISubAction<any>) => S
	} = {};
	private _childDispatchs: { [key: string]: Dispatch } = {};
	private _children: { [key: string]: IController<any, any, any> } = {};
	private _wrapChildDispatch: {
		[id: string]: (origin: Dispatch, child: Dispatch) => Dispatch
	} = {};
	private _selectState: (state: S) => PublicState = (state) => (state as any);
	private _selectActions: (dispatch: Dispatch) => PublicActions;
	

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

	setSelectState(selectState: (state: S) => PublicState): void {
		this._selectState = selectState;
	}
	
	setSelectActions(selectDispatch: (dispatch: Dispatch) => PublicActions): void {
		this._selectActions = selectDispatch;
	}

	addChild(
		key: string,
		controller: IController<any, any, any>,
		wrapChildDispatch: (origin: Dispatch, child: Dispatch) => Dispatch = (origin, child) => child
	): (dispatch: Dispatch) => Dispatch {
		this._children[key] = controller;
		this._wrapChildDispatch[key] = wrapChildDispatch;
		return (dispatch) => wrapChildDispatch(dispatch, wrapDispatch(dispatch, key));
	}

	getController(): IController<S, PublicState, PublicActions> {
		return new Controller<S, PublicState, PublicActions>(
			this._initState,
			this._children,
			this._handlers,
			this._subHandlers,
			this._wrapChildDispatch,
			this._selectState,
			this._selectActions
		);

	}
}

class Controller<S extends object, PublicState extends object, PublicActions> implements IController<S, PublicState, PublicActions>{
	private _builtInitState: () => S;
	private _builtReducer: Reducer<S>;
	// private _builtSelectState: (state: S) => PublicState;
	// private _builtSelectActions: (dispatch: Dispatch) => PublicActions;
	
	constructor(
		private _initState: () => S,
		private _children: { [key: string]: IController<any, any, any> } = {},
		private _handlers: {
			[id: string]: Reducer<S>
		} = {},
		private _subHandlers: {
			[id: string]: (state: S, action: ISubAction<any>) => S
		} = {},
		private _wrapChildDispatch: {
			[id: string]: (origin: Dispatch, child: Dispatch) => Dispatch
		} = {},
		private _selectState: (state: S) => PublicState,
		private _selectActions: (dispatch: Dispatch) => PublicActions
	) {
		this._init();
	}

	private _init(): void {
		this._builtInitState = this._buildInitState();
		this._builtReducer = this._buildReducer();
		// this._builtSelectState = this._buildSelectState();
		// this._builtSelectActions = this._buildSelectActions();
	}

	private _getChildDispatch(dispatch: Dispatch, key: string): Dispatch {
		return this._wrapChildDispatch[key](dispatch, wrapDispatch(dispatch, key));
	}

	getInitState(): () => S {
		return this._builtInitState;
	}

	private _buildInitState(): () => S {
		return () => {
			let initState: any = !!this._initState ? this._initState() : {};
			for (let builderKey in this._children) {
				initState[builderKey] = initState[builderKey] || this._children[builderKey].getInitState()();
			}

			return initState;
		}
	}

	getReducer(): Reducer<S> {
		return this._builtReducer;
	}

	private _buildReducer(): Reducer<S> {
		return (state: S = this.getInitState()(), baseAction: IAction<any> = { type: "", payload: null }): S => {
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

	// _buildSelectState() {
	// 	return (state: S): PublicState => 
	// 		Object.keys(this._children).reduce(
	// 			(publicState, builderKey) => ({
	// 				...publicState as any,
	// 				[builderKey]: this._children[builderKey].getSelectState()(state[builderKey])
	// 			}),
	// 			this._selectState(state)
	// 		);
	// }

	getSelectState() {
		// return this._builtSelectState;
		return this._selectState;
	}

	getSelectActions() {
		return this._selectActions || ((dispatch: Dispatch) => 
			Object.keys(this._handlers).reduce(
				(actions, action) => ({...actions, [action]: (payload?: any) => dispatch(({ type: action, payload: payload }))}),
				Object.keys(this._subHandlers).reduce(
					(actions, action) => ({
						...actions, 
						[action]: (key: string, payload?: any) => dispatch(({ type: joinKeys(action, key), payload: payload }))
					}),
					{} as any
				)
			));
		// return this._builtSelectActions;
	}

	// _buildSelectActions() {
	// 	const selectActions = this._selectActions || ((dispatch: Dispatch) => 
	// 		Object.keys(this._children).reduce(
	// 			(actions, action) => actions, // todo implement
	// 			{} as any
	// 		));
	// 	return (dispatch: Dispatch): PublicActions => 
	// 		Object.keys(this._children).reduce(
	// 			(publicActions, builderKey) => ({
	// 				...publicActions as any,
	// 				[builderKey]: this._children[builderKey].getSelectActions()(this._getChildDispatch(dispatch, builderKey))
	// 			}),
	// 			selectActions(dispatch)
	// 		);
	// }

	getController(id: string): IController<any, any, any> | null {
		return this._children[id] || null;
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

const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

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

export function getChildController(controller: IController<any, any, any>, path: string | string[]): IController<any, any, any> {
	let keys: string[] = typeof path === 'string' ? path.split(ACTIONS_DELIMITER) : path;
	return keys.reduce((controller, key) => controller.getController(key), controller);
}

export function createBuilder<S extends object>(): IBuilder<S, S, Dispatch>;
export function createBuilder<S extends object, PublicState extends object, PublicDispatch>(): IBuilder<S, PublicState, PublicDispatch>;
export function createBuilder<S extends object, PublicState extends object, PublicDispatch>(): IBuilder<S, PublicState, PublicDispatch> {
	return new ComponentBuilder<S, PublicState, PublicDispatch>();
}