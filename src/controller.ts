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

export interface IActionCreators {
	[key: string]: (IActionCreator<any> | IActionCreators | ((...args) => IActionCreators))
}

export interface IModel<Actions extends IActionCreators = {}, State = {}> {
	/**
	 * Функции, которые создают дейтсвия
	 */
	readonly actions: Actions;

	/**
	 * Reducer текущего контроллера
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
> extends IModel<Actions, State> {

	readonly model: IModel<Actions, State>;

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
		model: IModel<CActions, CState> | IBuilder<CActions, CState>
	): IBuilder<
		Actions & {[P in K]: CActions},
		State & {[P in K]: CState}
	>;

	/**
	 * Оборачивает функции, создающие действия
	 * @returns новый строитель
	 */
	subActions(
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
	constructor(private _model: IModel<Actions, State>) {}

	setInitState<NewState extends State>(f: (s: State) => NewState): IBuilder<Actions, NewState> {
		/** @todo дополнять текущее состояние, а не перезаписывать */
		const initState = f(this._model.reducer());
		return new Builder<Actions, NewState>({
			...this._model,
			reducer: subActionsReducer((state = initState, action?) => this._model.reducer(state, action)),
		} as any);
	}

	action<AS extends Dictionary>(
		handlers: {[K in keyof AS]: (state: State, action: IAction<AS[K]>) => State}
	): IBuilder<Actions & IPublicActionCreators<AS>, State> {
		/** @todo дополнять текущее состояние, а не перезаписывать */
		return new Builder<Actions & IPublicActionCreators<AS>, State>({
			actions: {
				...this._model.actions as any,
				...Object.keys(handlers).reduce(
					(actions: object, key) => ({...actions, [key]: (payload?) => ({ type: key, payload: payload })}),
					{}
				)
			},
			reducer: subActionsReducer((state = this._model.reducer(), action: IAction<any> = {type: ''}) => {
				return handlers.hasOwnProperty(action.type)
					? handlers[action.type](state, action) 
					: this._model.reducer(state, action);
			}),
		} as any);
	}

	child<K extends string, CActions extends IActionCreators, CState>(
		childKey: K,
		model: IModel<CActions, CState> | IBuilder<CActions, CState>
	): IBuilder<Actions & {[P in K]: CActions}, State & {[P in K]: CState}> {
		/** @todo дополнять текущее состояние, а не перезаписывать? */
		const initState = {
			...this._model.reducer() as any,
			[childKey]: model.reducer()
		}

		return new Builder<Actions & {[P in K]: CActions}, State & {[P in K]: CState}>({
			actions: {
				...this._model.actions as any,
				[childKey]: wrapChildActionCreators(wrapAction(childKey), model.actions)
			},
			reducer: subActionsReducer((state = initState, baseAction: IAction<any> = {type: ''}) => {
				const { key, action } = unwrapAction(baseAction);

				return childKey === key
					? { ...(state as any), [key]: model.reducer(state[key], action) }
					: this._model.reducer(state, baseAction);
			}),
		} as any);
	}

	subActions(wrappers: AdditionalActionCreators<Actions>): IBuilder<Actions, State> {
		return new Builder<Actions, State>({
			...this.model,
			actions: addSubActions(this._model.actions, wrappers) as any
		});
	}

	get model(): IModel<Actions, State> {
		return {...this._model};
	}

	get actions(): Actions {
		return this.model.actions;
	}

	get reducer(): Reducer<State> {
		return this.model.reducer;
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

export const unwrapAction = (action: IAction<any>): { action: IAction<any>; key: string } => {
	return {
		key: action.type.substring(0, action.type.indexOf(ACTIONS_DELIMITER)),
		action: {
			payload: action.payload,
			type: action.type.substring(action.type.indexOf(ACTIONS_DELIMITER) + 1)
		}
	};
}

export function wrapChildActionCreators(wrap: (action: IAction<any>) => IAction<any>, actions) {
	const wrappedActions = Object.keys(actions).reduce(
		(result, actionKey) => {
			if (typeof actions[actionKey] === 'function') {
				if (isEffect(actions[actionKey])) {
					return ({
						...result,

						[actionKey]: wrapEffect(
							(actions) => wrapChildActionCreators(wrap, actions),
							actions[actionKey]
						),
						// [actionKey]: createEffect(
						// 	(...args) => wrapChildActionCreators(wrap, actions[actionKey](...args))
						// )
					});
				} else {
					// обычные действия
					return ({...result, [actionKey]: (payload?) => wrap(actions[actionKey](payload))});
				}
			} else {
				// действия дочерних объектов
				return ({...result, [actionKey]: wrapChildActionCreators(wrap, actions[actionKey])});
			}
		},
		{}
	);
	return wrappedActions;
}

export function wrapAction(key: string) {
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

export const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

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

const CheckEffectField = '__Encaps.ActionCreatorsGetter__';
const GetEffectParamsValue = '__Encaps.GetEffectParamsValue__';

export function createEffect(
	effect: (actions) => any,
	getActions: (...agrs) => any
) {
	const newEffect = (...args) => {
		if (args[0] === GetEffectParamsValue) {
			return [effect, getActions];
		} else {
			return effect(getActions(...args))(...args);
		}
	}

	newEffect[CheckEffectField] = true;
	return newEffect;
}

export function wrapEffect(wrapActions, effect) {
	const [originEffect, getActions] = effect(GetEffectParamsValue);
	return createEffect(originEffect, (...args) => wrapActions(getActions(...args)));
}

export function isEffect(getter) {
	return !!getter[CheckEffectField];
}

/** @deprecated will be removed in the next version. Use createEffect instead. */
export function markAsActionCreatorsGetter(getter) {
	getter[CheckEffectField] = true;
	return getter;
}

export function build(): IBuilder;
export function build<Actions extends IActionCreators, State>(
	model: IModel<Actions, State>
): IBuilder<Actions, State>;
export function build(
	model: IModel<any, any> = {actions: {}, reducer: (s = {}) => ({...s})}
) {
	return new Builder(model);
}
