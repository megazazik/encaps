import { 
	IAction, 
	Reducer, 
	ACTIONS_DELIMITER, 
	IActionCreator,
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
}

export interface IBuilder<
	S extends Dictionary = {},
	Actions extends Dictionary = {},
	Children extends Dictionary<IController> = {},
> extends IController<S, Actions, Children> {

	readonly controller: IController<S, Actions, Children>;

	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @returns новый строитель
	 */
	setInitState<NS extends S>(f: (state: S) => NS):  IBuilder<NS, Actions, Children>;

	/**
	 * Добавляет действия
	 * @returns новый строитель
	 */
	action<AS extends Dictionary>(
		/** ассоциативный массив обработчиков действия */
		handlers: {[K in keyof AS]: (state: S, action: IAction<AS[K]>) => S}
	): IBuilder<S, Actions & AS, Children>;

	/**
	 * Добавляет дочерний контроллер
	 * @returns новый строитель
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
	constructor(private _controller?: IController<S, Actions, Children>) {}

	setInitState<NS extends S>(f: (s: S) => NS): IBuilder<NS, Actions, Children> {
		const initState = f(this._controller.reducer());
		return new Builder<NS, Actions, Children>({
			...this._controller,
			reducer: (state = initState, action?) => this._controller.reducer(state, action),
		} as any);
	}

	action<AS extends {}>(
		handlers: {[K in keyof AS]: Reducer<S, AS[K]>} & {[key: string]: Reducer<any, any>}
	): IBuilder<S, Actions & AS, Children> {
		return new Builder<S, Actions & AS, Children>({
			actions: {
				...this._controller.actions as any,
				...Object.keys(handlers).reduce(
					(actions, key) => ({...actions, [key]: (payload?) => ({ type: key, payload: payload })}),
					{}
				)
			},
			reducer: (state = this._controller.reducer(), action: IAction<any> = {type: ''}) => {
				return handlers.hasOwnProperty(action.type)
					? handlers[action.type](state, action) 
					: this._controller.reducer(state, action);
			},
		} as any);
	}

	child<K extends string, CS, A, C extends Dictionary<IController>>(
		childKey: K,
		controller: IController<CS, A, C>
	): IBuilder<S & {[P in K]: CS}, Actions, Children & {[P in K]: IController<CS, A, C>}> {
		const initState = {
			...this._controller.reducer() as any,
			[childKey]: controller.reducer()
		}

		return new Builder<S & {[P in K]: CS}, Actions, Children & {[P in K]: IController<CS, A, C>}>({
			actions: {
				...this._controller.actions as any,
				[childKey]: wrapChildActions(wrapAction(childKey), controller.actions)
			},
			reducer: (state = initState, baseAction: IAction<any> = {type: ''}) => {
				const { key, action } = unwrapAction(baseAction);

				return childKey === key
					? { ...(state as any), [key]: controller.reducer(state[key], action) }
					: this._controller.reducer(state, baseAction);
			},
		} as any);
	}

	get controller(): IController<S, Actions, Children> {
		return {...this._controller};
	}

	get actions(): IPublicActionCreators<Actions> & {[K in keyof Children]: Children[K]['actions']} {
		return this.controller.actions;
	}

	get reducer(): Reducer<S> {
		return this.controller.reducer;
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

export function build(): IBuilder;
export function build<S, A, Children extends Dictionary<IController>>(
	controller: IController<S, A, Children>
): IBuilder<S, A, Children>;
export function build(
	controller: IController<any, any, any> = {actions: {}, reducer: (s = {}) => ({...s})}
) {
	return new Builder(controller);
}

export const builder = build();
