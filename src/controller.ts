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

interface IActionCreators {
	[key: string]: (IActionCreator<any> | IActionCreators)
}

export interface IController<Actions extends IActionCreators = {}, State = {}> {
	/**
	 * @returns Функции, которые создают дейтсвия
	 */
	readonly actions: Actions;

	/**
	 * @returns Reducer текущего контроллера
	 */
	readonly reducer: Reducer<State>;
}

type AdditionalActionCreators<Creators, BaseCreators = Creators> = {
	[K in keyof Creators]?: Creators[K] extends IActionCreator<infer U>
		? ((payload: U, actions: BaseCreators) => IAction<any>)
		: AdditionalActionCreators<Creators[K], BaseCreators>
}

export interface IBuilder<
	Actions extends IActionCreators = {},
	State = {}
> extends IController<Actions, State> {

	readonly controller: IController<Actions, State>;

	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @returns новый строитель
	 */
	setInitState<NewState extends State>(f: (state: State) => NewState):  IBuilder<Actions, NewState>;

	/**
	 * Добавляет действия
	 * @returns новый строитель
	 */
	action<AS extends Dictionary>(
		/** ассоциативный массив обработчиков действия */
		handlers: {[K in keyof AS]: (state: State, action: IAction<AS[K]>) => State}
	): IBuilder<Actions & IPublicActionCreators<AS>, State>;

	/**
	 * Добавляет дочерний контроллер
	 * @returns новый строитель
	 */
	child<K extends string, CActions extends IActionCreators, CState>(
		/** идентификатор дочернего контроллера */
		key: K,
		/** дочерний контроллер */
		controller: IController<CActions, CState> | IBuilder<CActions, CState>
	): IBuilder<
		Actions & {[P in K]: CActions},
		State & {[P in K]: CState}
	>;

	/**
	 * Оборачивает функции, создающие действия
	 * @returns новый строитель
	 */
	wrapActions(
		/** ассоциативный массив функций, создающих дополнительные действия */
		wrapers: AdditionalActionCreators<Actions>
	): IBuilder<Actions, State>;
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 * @type Actions действия компонента
 */
class Builder<
	Actions extends IActionCreators = {},
	State = {}
>
	implements IBuilder<Actions, State> 
{
	constructor(private _controller: IController<Actions, State>) {}

	setInitState<NewState extends State>(f: (s: State) => NewState): IBuilder<Actions, NewState> {
		/** @todo дополнять текущее состояние, а не перезаписывать */
		const initState = f(this._controller.reducer());
		return new Builder<Actions, NewState>({
			...this._controller,
			reducer: subActionsReducer((state = initState, action?) => this._controller.reducer(state, action)),
		} as any);
	}

	action<AS extends Dictionary>(
		handlers: {[K in keyof AS]: (state: State, action: IAction<AS[K]>) => State}
	): IBuilder<Actions & IPublicActionCreators<AS>, State> {
		/** @todo дополнять текущее состояние, а не перезаписывать */
		return new Builder<Actions & IPublicActionCreators<AS>, State>({
			actions: {
				...this._controller.actions as any,
				...Object.keys(handlers).reduce(
					(actions, key) => ({...actions, [key]: (payload?) => ({ type: key, payload: payload })}),
					{}
				)
			},
			reducer: subActionsReducer((state = this._controller.reducer(), action: IAction<any> = {type: ''}) => {
				return handlers.hasOwnProperty(action.type)
					? handlers[action.type](state, action) 
					: this._controller.reducer(state, action);
			}),
		} as any);
	}

	child<K extends string, CActions extends IActionCreators, CState>(
		/** идентификатор дочернего контроллера */
		key: K,
		/** дочерний контроллер */
		controller: IController<CActions, CState> | IBuilder<CActions, CState>
	): IBuilder<Actions & {[P in K]: CActions}, State & {[P in K]: CState}>;

	child<K extends string, CActions extends IActionCreators, CState>(
		childKey: K,
		controller: IController<CActions, CState> | IBuilder<CActions, CState>
	): IBuilder<Actions & {[P in K]: CActions}, State & {[P in K]: CState}> {
		/** @todo дополнять текущее состояние, а не перезаписывать? */
		const initState = {
			...this._controller.reducer() as any,
			[childKey]: controller.reducer()
		}

		return new Builder<Actions & {[P in K]: CActions}, State & {[P in K]: CState}>({
			actions: {
				...this._controller.actions as any,
				[childKey]: wrapChildActionCreators(wrapAction(childKey), controller.actions)
			},
			reducer: subActionsReducer((state = initState, baseAction: IAction<any> = {type: ''}) => {
				const { key, action } = unwrapAction(baseAction);

				return childKey === key
					? { ...(state as any), [key]: controller.reducer(state[key], action) }
					: this._controller.reducer(state, baseAction);
			}),
		} as any);
	}

	wrapActions(wrappers: AdditionalActionCreators<Actions>): IBuilder<Actions, State> {
		return new Builder<Actions, State>({
			...this.controller,
			actions: addSubActions(this._controller.actions, wrappers) as any
		});
	}

	get controller(): IController<Actions, State> {
		return {...this._controller};
	}

	get actions(): Actions {
		return this.controller.actions;
	}

	get reducer(): Reducer<State> {
		return this.controller.reducer;
	}
}

function subActionsReducer<T = any>(reducer: Reducer<T>): Reducer<T> {
	return (state?, action = {type: ''}) => {
		return getSubActions(action).reduce(
			(prevState, action) => reducer(prevState, action),
			state
		);
	}
}

export function getSubActions(action: IAction<any>): IAction<any>[] {
	const {actions = [], ...baseAction} = action;
	return [baseAction].concat(...(actions.map(getSubActions)));
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

function wrapChildActionCreators(wrap: (action: IAction<any>) => IAction<any>, actions) {
	return Object.keys(actions).reduce(
		(result, actionKey) => {
			if (typeof actions[actionKey] === 'function') {
				return ({...result, [actionKey]: (payload?) => wrap(actions[actionKey](payload))});
			} else {
				return ({...result, [actionKey]: wrapChildActionCreators(wrap, actions[actionKey])});
			}
		},
		{}
	);
}

function wrapAction(key: string) {
	const wrap = <A>(action: IAction<A>) => {
		const newAction = {
			...action,
			type: joinKeys(key, action.type)
		};

		if (action.actions) {
			newAction.actions = action.actions.map(wrap);
		}

		return newAction
	};

	return wrap;
}

const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

export function addSubActions<T extends IActionCreators>(
	actions: T,
	wrappers: AdditionalActionCreators<T>
): T {
	const wrappersList = decomposeKeys(wrappers);
	return wrapChildActionCreators(
		function wrapAction(action: IAction<any>) {
			const subActinos = (action.actions || []).map(wrapAction);

			return {
				...action,
				actions: wrappersList.hasOwnProperty(action.type)
					? [...subActinos, wrappersList[action.type](action.payload, actions)]
					: subActinos
			};
		},
		actions
	);
}

export function decomposeKeys(list: object, parentKey = ''): {[key: string]: any} {
	return Object.keys(list).reduce(
		(result, key) => {
			if (typeof list[key] === 'object') {
				return {...result, ...decomposeKeys(list[key], parentKey ? joinKeys(parentKey, key) : key)};
			} else {
				return {...result, [parentKey ? joinKeys(parentKey, key) : key]: list[key]};
			}
		},
		{}
	);
}

export function build(): IBuilder;
export function build<Actions extends IActionCreators, State>(
	controller: IController<Actions, State>
): IBuilder<Actions, State>;
export function build(
	controller: IController<any, any> = {actions: {}, reducer: (s = {}) => ({...s})}
) {
	return new Builder(controller);
}

export const builder = build();
