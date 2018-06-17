import { 
	IAction, 
	Reducer, 
	Dispatch, 
	ACTIONS_DELIMITER, 
	IActionCreator,
	ComponentPath
} from "./types";

/** @todo удалить, если не понадобится */
// export interface Dictionary {
// 	[key: string]: any
// }

export type IPublicActionCreators<Actions> = {[K in keyof Actions]: IActionCreator<Actions[K]>}


export interface IController<S extends {} = {}, Actions extends {} = {}> {
	/**
	 * @returns Функции, которые создают дейтсвия
	 */
	readonly actions: IPublicActionCreators<Actions>;

	/**
	 * @returns Reducer текущего контроллера
	 */
	readonly reducer: Reducer<S>;

	/**
	 * @returns ассоциативный массив дочерних контроллеров
	 * 
	 * @todo добавить нормальное определение типа
	 */
	readonly children: {[key: string]: IController<any, any>};

	/**
	 * @returns начальное состояние
	 */
	getInitState(): S;
}

export interface IBuilder<S extends {} = {}, Actions extends {} = {}> extends IController<S, Actions> {

	readonly controller: IController<S, Actions>;

	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @returns новый контроллер
	 */
	setInitState<NS extends S>(f: (state: S) => NS):  IBuilder<NS, Actions>;

	/**
	 * Добавляет действия
	 * @returns новый контроллер
	 */
	action<AS extends {}>(
		/** ассоциативный массив обработчиков действия */
		handlers: {[K in keyof AS]: Reducer<S, AS[K]>}// & {[key: string]: Reducer<any, any>}
	): IBuilder<S, Actions & AS>;

	/**
	 * Добавляет дочерний контроллер
	 * @returns новый контроллер
	 */
	addChild(
		/** идентификатор дочернего контроллера */
		key: string,
		/** дочерний контроллер */
		controller: IController<any, any>
	): IBuilder<S, Actions>;
}

interface IBuilderData<S> {
	initState: () => S;
	handlers: {[id: string]: Reducer<S>};
	children: { [key: string]: IController<any, any> };
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 * @type Actions действия компонента
 */
class Builder<S extends object = {}, Actions extends {} = {}>
	implements IBuilder<S, Actions> 
{
	private _data: IBuilderData<S>;

	constructor(data?: IBuilderData<S>) {
		this._data = data || {
			initState: () => ({}) as S,
			handlers: {},
			children: {}
		}
	}

	setInitState<NS extends S>(f: (s: S) => NS): IBuilder<NS, Actions> {
		return new Builder<NS, Actions>({
			...this._data,
			initState: () => f(this._data.initState())
		} as any);
	}

	action<AS extends {}>(
		handlers: {[K in keyof AS]: Reducer<S, AS[K]>} & {[key: string]: Reducer<any, any>}
	): IBuilder<S, Actions & AS> {
		return new Builder<S, Actions & AS>({
			...this._data,
			handlers: {...this._data.handlers, ...handlers as any}
		} as any);
	}

	addChild(
		key: string,
		controller: IController<any, any>
	): IBuilder<S, Actions> {
		return new Builder<S, Actions>({
			...this._data,
			children: {...this._data.children, [key]: controller}
		} as any);
	}

	private _controller: IController<S, Actions>;
	get controller(): IController<S, Actions> {
		if (!this._controller) {
			this._controller = new Controller<S, Actions>(this._data);
		}
		return this._controller;
	}

	get actions(): IPublicActionCreators<Actions> {
		return this.controller.actions;
	}

	get reducer(): Reducer<S> {
		return this.controller.reducer;
	}

	get children(): {[key: string]: IController<any, any>} {
		return this.controller.children;
	}

	public getInitState(): S {
		return this.controller.getInitState();
	}
}

class Controller<S extends {} = {}, Actions extends {} = {}>
	implements IController<S, Actions> 
{
	constructor(private _data: IBuilderData<S>) {}

	private _actions: any;
	public get actions() {
		if (!this._actions) {
			this._actions = this._buildActions();
		}
		return ({...this._actions as any});
	};

	public getInitState(): S {
		let initState: any = !!this._data.initState ? this._data.initState() : {};
		for (let builderKey in this._data.children) {
			initState[builderKey] = initState[builderKey] || this._data.children[builderKey].getInitState();
		}

		return initState;
	}

	private _reducer: Reducer<S>;
	get reducer(): Reducer<S> {
		if (!this._reducer) {
			this._reducer = this._buildReducer();
		}
		return this._reducer;
	}

	private _buildReducer(): Reducer<S> {
		return (state: S = this.getInitState(), baseAction: IAction<any> = { type: "", payload: null }): S => {
			const { key, action } = unwrapAction(baseAction);
			return this._data.handlers.hasOwnProperty(key || baseAction.type) ? 
					this._data.handlers[key || baseAction.type](state, action) :
				this._data.children.hasOwnProperty(key) ? 
					{ ...(state as any), [key]: this._data.children[key].reducer(state[key], action) } :
					state;
		};
	}

	private _buildActions() {
		return Object.keys(this._data.handlers).reduce(
			(actions, action) => ({...actions, [action]: (payload?: any) => ({ type: action, payload: payload })}),
			{} as any
		);
	}

	public get children(): {[key: string]: IController<any, any>} {
		return {...this._data.children};
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
	return keys.reduce((controller, key) => controller.children[key], controller);
}

export const builder: IBuilder = new Builder();