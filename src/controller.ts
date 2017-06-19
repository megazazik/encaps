import { IAction, Reducer, ISubAction, Dispatch, ACTIONS_DELIMITER } from "./types";

export interface IController<S extends object, PublicState extends object, PublicDispatch> {
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
	 * Возвращает публичное состояние компонента на основе его состояния
	 * @param state текущее состояние
	 */
	getSelectState(): (state: S) => PublicState;

	/**
	 * Возвращает публичные свойства компонента, связанные с генерацией действий
	 * @param dispatch функция для вызова действий
	 */
	getSelectDispatch(): (dispatch: Dispatch) => PublicDispatch;


	/**
	 * Возвращает дочерний контроллер
	 * @param id Идентификатор дочернего контроллера
	 */
	getController<CS extends object = any, CPubS extends object = any, CPubD = any>(id: string): IController<CS, CPubS, CPubD> | null;
}

export interface IBuilder<S extends object, PublicState extends object, PublicDispatch> {
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
	subAction(
		id: string,
		handler: (state: S, action: ISubAction<any>) => S
	): (dispatch: Dispatch, key: string) => Dispatch;

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
	 * Задает функцию, которая возвращает свойства представления на основе текущего состояния 
	 * @param getProps функция, возвращающая свойства
	 */
	setSelectState(selectState: (state: S) => PublicState): void;

	/**
	 * Задает функцию, которая возвращает свойства представления
	 * @param getProps функция, возвращающая свойства
	 */
	setSelectDispatch(selectDispatch: (dispatch: Dispatch) => PublicDispatch ): void;

	/**
	 * Создает контроллер копмпонента
	 * @returns объект для создани компонента
	 */
	getController(): IController<S, PublicState, PublicDispatch>;
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 */
class ComponentBuilder<S extends object, PublicState extends object, PublicDispatch> implements IBuilder<S, PublicState, PublicDispatch> {
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
	private _selectDispatch: (dispatch: Dispatch) => PublicDispatch = (dispatch) => (dispatch as any);
	

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

	subAction(
		id: string,
		handler: (state: S, action: ISubAction<any>) => S
	): (dispatch: Dispatch, key: string) => Dispatch {
		this._subHandlers[id] = handler;
		return (dispatch: Dispatch, key: string) => wrapDispatch(dispatch, joinKeys(id, key));
	}

	setSelectState(selectState: (state: S) => PublicState): void {
		this._selectState = selectState;
	}
	
	setSelectDispatch(selectDispatch: (dispatch: Dispatch) => PublicDispatch): void {
		this._selectDispatch = selectDispatch;
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

	getController(): IController<S, PublicState, PublicDispatch> {
		return new Controller<S, PublicState, PublicDispatch>(
			this._initState,
			this._children,
			this._handlers,
			this._subHandlers,
			this._wrapChildDispatch,
			this._selectState,
			this._selectDispatch
		);

	}
}

class Controller<S extends object, PublicState extends object, PublicDispatch> implements IController<S, PublicState, PublicDispatch>{
	private _builtInitState: () => S;
	private _builtReducer: Reducer<S>;
	private _builtSelectState: (state: S) => PublicState;
	
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
		private _selectDispatch: (dispatch: Dispatch) => PublicDispatch
	) {
		this._init();
	}

	private _init(): void {
		this._builtInitState = this._buildInitState();
		this._builtReducer = this._buildReducer();
		this._builtSelectState = this._buildSelectState();
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

	_buildSelectState() {
		return (state: S): PublicState => {
			return Object.keys(this._children).reduce(
				(publicState, builderKey) => ({
					...publicState as any,
					[builderKey]: this._children[builderKey].getSelectState()(state[builderKey])
				}),
				this._selectState(state)
			);
		}
	}

	getSelectState() {
		return this._builtSelectState;
	}

	getSelectDispatch() {
		return this._selectDispatch;
	}

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

export function createBuilder<S extends object>(): IBuilder<S, S, Dispatch>;
export function createBuilder<S extends object, PublicState extends object, PublicDispatch>(): IBuilder<S, PublicState, PublicDispatch>;
export function createBuilder<S extends object, PublicState extends object, PublicDispatch>(): IBuilder<S, PublicState, PublicDispatch> {
	return new ComponentBuilder<S, PublicState, PublicDispatch>();
}