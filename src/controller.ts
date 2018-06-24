import { 
	IAction, 
	Reducer, 
	// Dispatch, 
	ACTIONS_DELIMITER, 
	IActionCreator,
	// ComponentPath
} from "./types";

export interface Dictionary<T = any> {
	[key: string]: T
}

export type IPublicActionCreators<Actions> = {[K in keyof Actions]: IActionCreator<Actions[K]>};

export interface IController<
	S extends Dictionary = {},
	Actions extends Dictionary = {},
	Children extends Dictionary<IController> = {},
> {
	/**
	 * @returns Функции, которые создают дейтсвия
	 */
	readonly actions: IPublicActionCreators<Actions> & {[K in keyof Children]: Children[K]['actions']};

	/**
	 * @returns Reducer текущего контроллера
	 */
	readonly reducer: Reducer<S>;

	/**
	 * @todo удалить или раскомментировать и написать тесты
	 * 
	 * @returns ассоциативный массив дочерних контроллеров
	 */
	// readonly children: Children;

	/**
	 * @returns начальное состояние
	 */
	getInitState(): S;
}

export interface IBuilder<
	S extends Dictionary = {},
	Actions extends Dictionary = {},
	Children extends Dictionary<IController> = {},
> extends IController<S, Actions, Children> {

	readonly controller: IController<S, Actions, Children>;

	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @returns новый контроллер
	 */
	setInitState<NS extends S>(f: (state: S) => NS):  IBuilder<NS, Actions, Children>;

	/**
	 * Добавляет действия
	 * @returns новый контроллер
	 */
	action<AS extends Dictionary>(
		/** ассоциативный массив обработчиков действия */
		handlers: {[K in keyof AS]: (state: S, action: IAction<AS[K]>) => S}
	): IBuilder<S, Actions & AS, Children>;

	/**
	 * Добавляет дочерний контроллер
	 * @returns новый контроллер
	 */
	child<K extends string, CS, A, C extends Dictionary<IController>>(
		/** идентификатор дочернего контроллера */
		key: K,
		/** дочерний контроллер */
		controller: IController<CS, A, C> | IBuilder<CS, A, C>
	): IBuilder<
		S & {[P in K]: CS},
		Actions,
		Children & {[P in K]: IController<CS, A, C>}
	>;
}

interface IBuilderData<S> {
	initState: () => S;
	handlers: {[id: string]: Reducer<S>};
	children: { [key: string]: IController<any, any, any> };
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 * @type Actions действия компонента
 */
class Builder<
	S extends Dictionary = {},
	Actions extends Dictionary = {},
	Children extends Dictionary<IController> = {},
>
	implements IBuilder<S, Actions, Children> 
{
	private _data: IBuilderData<S>;

	constructor(data?: IBuilderData<S>) {
		this._data = data || {
			initState: () => ({}) as S,
			handlers: {},
			children: {}
		}
	}

	setInitState<NS extends S>(f: (s: S) => NS): IBuilder<NS, Actions, Children> {
		return new Builder<NS, Actions, Children>({
			...this._data,
			initState: () => f(this._data.initState())
		} as any);
	}

	action<AS extends {}>(
		handlers: {[K in keyof AS]: Reducer<S, AS[K]>} & {[key: string]: Reducer<any, any>}
	): IBuilder<S, Actions & AS, Children> {
		return new Builder<S, Actions & AS, Children>({
			...this._data,
			handlers: {...this._data.handlers, ...handlers as any}
		} as any);
	}

	child<K extends string, CS, A, C extends Dictionary<IController>>(
		key: K,
		controller: IController<CS, A, C>
	): IBuilder<S & {[P in K]: CS}, Actions, Children & {[P in K]: IController<CS, A, C>}> {
		return new Builder<S & {[P in K]: CS}, Actions, Children & {[P in K]: IController<CS, A, C>}>({
			...this._data,
			children: {...this._data.children, [key]: controller}
		} as any);
	}

	private _controller: IController<S, Actions, Children>;
	get controller(): IController<S, Actions, Children> {
		if (!this._controller) {
			this._controller = new Controller<S, Actions, Children>(this._data);
		}
		return this._controller;
	}

	get actions(): IPublicActionCreators<Actions> & {[K in keyof Children]: Children[K]['actions']} {
		return this.controller.actions;
	}

	get reducer(): Reducer<S> {
		return this.controller.reducer;
	}

	// get children(): Children {
	// 	return this.controller.children;
	// }

	public getInitState(): S {
		return this.controller.getInitState();
	}
}

class Controller<
	S extends Dictionary = {},
	Actions extends Dictionary = {},
	Children extends Dictionary<IController> = {},
>
	implements IController<S, Actions, Children> 
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
			(actions, action) => ({...actions, [action]: (payload?) => ({ type: action, payload: payload })}),
			Object.keys(this._data.children).reduce(
				/** @todo добавить дополнительную обертку */
				(actions, childKey) => ({
					...actions,
					[childKey]: wrapChildActions(wrapAction(childKey), this._data.children[childKey].actions)
				}),
				{} as any
			)
		);
	}

	public get children(): Children {
		return {...this._data.children} as Children;
	}
}

const unwrapAction = (action: IAction<any>): { action: IAction<any>; key: string } => {
	return {
		key: action.type.substring(0, action.type.indexOf(ACTIONS_DELIMITER)),
		action: {
			payload: action.payload,
			type: action.type.substring(action.type.indexOf(ACTIONS_DELIMITER) + 1)
		}
	};
}

function wrapChildActions(wrap: (action: IAction<any>) => IAction<any>, actions) {
	return Object.keys(actions).reduce(
		(result, actionKey) => {
			if (typeof actions[actionKey] === 'function') {
				return ({...result, [actionKey]: (payload?) => wrap(actions[actionKey](payload))});
			} else {
				return ({...result, [actionKey]: wrapChildActions(wrap, actions[actionKey])});
			}
		},
		{}
	);
}

function wrapAction(key: string) {
	return <A>(action: IAction<A>) => ({
		...action,
		type: joinKeys(key, action.type)
	});
}

const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

/** @todo uncomment or delete */
// const wrapDispatch = (
// 	key: ComponentPath,
// 	dispatch: Dispatch
// ): Dispatch => {
// 	return (action: IAction<any>) => 
// 		dispatch({ type: joinKeys(Array.isArray(key) ? key.join(ACTIONS_DELIMITER) : key, action.type), payload: action.payload });
// };

// function getStatePart(path: ComponentPath, state: any): any {
// 	if (!path) {
// 		return state;
// 	}

// 	let paths: string[];
// 	if (typeof path === 'string') {
// 		paths = path.split(ACTIONS_DELIMITER);
// 	} else {
// 		paths = path;
// 	}

// 	return paths.reduce((state, key) => state[key], state);
// }

// function getChildController(controller: IController<any, any, any>, path: ComponentPath): IController<any, any, any> {
// 	let keys: string[] = typeof path === 'string' ? path.split(ACTIONS_DELIMITER) : path;
// 	return keys.reduce((controller, key) => controller.children[key], controller);
// }

export const builder: IBuilder = new Builder();
