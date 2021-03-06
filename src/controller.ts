import {
	IAction,
	Reducer,
	ACTIONS_DELIMITER,
	IActionCreator,
	ModelActions,
	ModelState,
	INIT_STATE_ACTIONS,
	Action,
	ICommonAction,
	ICommonActionCreator
} from "./types";

export interface Dictionary<T = any> {
	[key: string]: T
}

export type IPublicActionCreators<Actions> = { [K in keyof Actions]: IActionCreator<Actions[K]> };

export interface IActionCreators {
	[key: string]: (IActionCreator<any, any> | IActionCreators | ((...args) => IActionCreators)) | ((...args) => any)
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

/** @todo доработать, чтобы правильно определялся тип у типов действий, не совпадающих с именем actionCreator */
type AdditionalActionCreators<Creators, BaseCreators = Creators> = {
	[K in keyof Creators]?: Creators[K] extends IActionCreator<infer U>
		? ((action: IAction<U>, actions: BaseCreators) => Action)
		: Creators[K] extends ICommonActionCreator<infer F, any>
			? ((action: ICommonAction<F>, actions: BaseCreators) => Action)
			: AdditionalActionCreators<Creators[K], BaseCreators>
} | ((action: ICommonAction<any>, actions: BaseCreators) => ICommonAction<any> | Array<ICommonAction<any>>);

export interface IBuilder<
	Actions extends IActionCreators = {},
	State = {}
> extends IModel<Actions, State> {

	readonly model: IModel<Actions, State>;

	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @returns новый строитель
	 */
	initState<NewState extends State>(f: (state: State) => NewState): IBuilder<Actions, NewState>;

	/**
	 * Добавляет действия
	 * @returns новый строитель
	 */
	handlers<
		Handlers extends Dictionary<keyof State | ((state: State, action: IAction<any>) => State)>
	>(
		/** ассоциативный массив обработчиков действия */
		handlers: Handlers
	): IBuilder<
		Actions & IPublicActionCreators<
			{
				[K in keyof Handlers]: Handlers[K] extends (state: State, action: IAction<infer U>) => State
					? U
					: (Handlers[K] extends keyof State ? State[Handlers[K]] : never)
			}
		>,
		State
	>;

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
		Actions & { [P in K]: CActions },
		State & { [P in K]: CState }
	>;

	/**
	 * Добавляет дочерний контроллер
	 * @returns новый строитель
	 */
	children<AS extends Dictionary<IModel | IBuilder>>(
		/** ассоциативный массив дочерних моделей */
		children: AS
	): IBuilder<
		Actions & { [C in keyof AS]: ModelActions<AS[C]> },
		State & { [C in keyof AS]: ModelState<AS[C]> }
	>;

	/**
	 * Оборачивает функции, создающие действия
	 * @returns новый строитель
	 */
	subActions<A extends AdditionalActionCreators<Actions>>(
		/** ассоциативный массив функций, создающих дополнительные действия */
		wrapers: A
	): IBuilder<Actions, State>;

	/**
	 * Позволяет создавать любые действия, не только простые объекты
	 * @returns новый строитель
	 */
	actionCreator<K extends string, P extends any[], A>(
		/** тип действия */
		key: K,
		/** Функция, которая создает действия не в виде простых объектов */
		getActionCreator: (actions: Actions, select: (state) => State) => (...args: P) => A
	): IBuilder<Actions & { [F in K]: (...args: P) => A }, State>;

	/**
	 * Позволяет создавать любые действия, не только простые объекты
	 * @returns новый строитель
	 */
	actionCreators<EF extends Dictionary<(actions: Actions, select: (state) => State) => (...args: any[]) => any>>(
		/** ассоциативный массив дочерних моделей */
		getActionCreators: EF
	): IBuilder<
		Actions & { [C in keyof EF]: ReturnType<EF[C]> },
		State
	>;

	/**
	 * Вызывает функцию, которая расширяет функционал текущей модели
	 * @returns новый строитель
	 */
	wrap<NewM extends IModel<any, any>>(wrapper: (builder: IBuilder<Actions, State>) => NewM): NewM;
}

/**
 * Класс для построения компонентов
 * @type S тип состояния
 * @type Actions действия компонента
 */
class Builder<
	Actions extends IActionCreators = {},
	State = {}
> implements IBuilder<Actions, State> {
	private _model: IModel<Actions, State>

	constructor(model: IModel<Actions, State>) {
		this._model = {
			actions: addToStringToActionCreators(model.actions),
			reducer: model.reducer,
		}
	}

	initState<NewState extends State>(f: (s: State) => NewState): IBuilder<Actions, NewState> {
		/** @todo дополнять текущее состояние, а не перезаписывать */
		const initState = f(this._model.reducer(undefined, {type: INIT_STATE_ACTIONS}));
		return new Builder<Actions, NewState>({
			...this._model,
			reducer: subActionsReducer((state = initState, action?) => this._model.reducer(state, action)),
		} as any);
	}

	handlers<
		Handlers extends Dictionary<keyof State | ((state: State, action: IAction<any>) => State)>
	>(
		handlers: Handlers
	) {
		/** @todo дополнять текущее состояние, а не перезаписывать */
		return new Builder({
			actions: {
				...this._model.actions,
				...Object.keys(handlers).reduce(
					(actions: object, key) => {
						const actionsCreator = (payload?) => ({ type: key, payload });
						actionsCreator.toString = () => key;
						return { ...actions, [key]: actionsCreator };
					},
					{}
				)
			},
			reducer: subActionsReducer((state = this._model.reducer(undefined, {type: INIT_STATE_ACTIONS}), action: IAction<any> = { type: '' }) => {
				return handlers.hasOwnProperty(action.type)
					? (
						typeof handlers[action.type] === 'function'
							? (handlers[action.type] as any)(state, action)
							: state[handlers[action.type]] === action.payload
								? state
								: ({...state, [handlers[action.type] as string]: action.payload})
					)
					: this._model.reducer(state, action);
			}),
		}) as any;
	}

	child<K extends string, CActions extends IActionCreators, CState>(
		childKey: K,
		model: IModel<CActions, CState> | IBuilder<CActions, CState>
	): IBuilder<Actions & { [P in K]: CActions }, State & { [P in K]: CState }> {
		/** @todo дополнять текущее состояние, а не перезаписывать? */
		const getInitState = () => ({
			...this._model.reducer(undefined, {type: INIT_STATE_ACTIONS}) as any,
			[childKey]: model.reducer(undefined, {type: INIT_STATE_ACTIONS})
		})

		return new Builder<Actions & { [P in K]: CActions }, State & { [P in K]: CState }>({
			actions: {
				...this._model.actions as any,
				[childKey]: wrapActionsCreatorsWithKey(
					childKey,
					addToStringToActionCreators(model.actions),
					() => (state) => state ? state[childKey] : undefined
				)
			},
			reducer: subActionsReducer((state = getInitState(), baseAction: IAction<any> = { type: '' }) => {
				const { key, action } = unwrapAction(baseAction);

				return childKey === key
					? { ...(state as any), [key]: model.reducer(state[key], action) }
					: this._model.reducer(state, baseAction);
			}),
		} as any);
	}

	children<AS extends Dictionary<IModel | IBuilder>>(
		/** ассоциативный массив дочерних моделей */
		children: AS
	): IBuilder<
		Actions & { [C in keyof AS]: ModelActions<AS[C]> },
		State & { [C in keyof AS]: ModelState<AS[C]> }
	> {
		/** @todo оптимизировать */
		return Object.keys(children).reduce(
			(newBuilder, key) => newBuilder.child(key, children[key]),
			this as any
		);
	}

	subActions<A extends AdditionalActionCreators<Actions>>(wrappers: A): IBuilder<Actions, State> {
		return new Builder<Actions, State>({
			...this.model,
			actions: addSubActions(this._model.actions, wrappers) as any
		});
	}

	actionCreator<K extends string, P extends any[], A>(
		/** Имя генератора действия */
		key: K,
		/** Функция, которая создает действия не в виде простых объектов */
		getActionCreator: (actions: Actions, select: (state) => State) => (...args: P) => A
	): IBuilder<Actions & { [F in K]: (...args: P) => A }, State> {
		return new Builder({
			...this.model,
			actions: {
				...this.model.actions as any,
				[key]: createCustomActionCreator(getActionCreator, () => this.model.actions, () => (state) => state)
			}
		});
	}

	/**
	 * Позволяет создавать любые действия, не только простые объекты
	 * @returns новый строитель
	 */
	actionCreators<EF extends Dictionary<(actions: Actions, select: (state) => State) => (...args: any[]) => any>>(
		/** ассоциативный массив дочерних моделей */
		getActionCreators: EF
	): IBuilder<
		Actions & { [C in keyof EF]: ReturnType<EF[C]> },
		State
	> {
		/** @todo оптимизировать */
		return Object.keys(getActionCreators).reduce(
			(newBuilder, key) => newBuilder.actionCreator(key, getActionCreators[key]),
			this as any
		);
	}

	get model(): IModel<Actions, State> {
		return { ...this._model };
	}

	get actions(): Actions {
		return this.model.actions;
	}

	get reducer(): Reducer<State> {
		return this.model.reducer;
	}

	wrap<NewM extends IModel<any, any>>(wrapper: (builder: IBuilder<Actions, State>) => NewM) {
		return new Builder(wrapper(this));
	}
}

export function addToStringToActionCreators<A extends IActionCreators>(actionCreators: A): A {
	const newActions = {} as any;
	Object.keys(actionCreators).forEach((key) => {
		if (typeof actionCreators[key] === 'function' && !actionCreators[key].hasOwnProperty('toString') && !isCustomActionCreator(actionCreators[key])) {
			const originActionCreator = actionCreators[key] as Function;
			newActions[key] = function() {
				return originActionCreator.apply(this, arguments)
			};
			Object.assign(
				newActions[key],
				originActionCreator,
				{toString: () => key}
			);
		} else {
			newActions[key] = actionCreators[key];
		}
	});

	return newActions;
}

function subActionsReducer<T = any>(reducer: Reducer<T>): Reducer<T> {
	return (state?, action = { type: '' }) => {
		return getSubActions(action).reduce(
			(prevState, action) => reducer(prevState, action),
			state
		);
	}
}

export function getSubActions(action: IAction<any>): IAction<any>[] {
	const { actions = [], ...baseAction } = action;
	return [baseAction].concat(...(actions.map(getSubActions)));
}

export const unwrapAction = (action: IAction<any>): { action: IAction<any>; key: string } => {
	return {
		key: action.type.substring(0, action.type.indexOf(ACTIONS_DELIMITER)),
		action: {
			...action,
			type: action.type.substring(action.type.indexOf(ACTIONS_DELIMITER) + 1)
		}
	};
}

export function wrapChildActionCreators(
	wrap: (action: IAction<any>) => IAction<any>,
	actions,
	key?: string,
	select: (...args) => (state) => any = () => (state) => state
) {
	const wrappedActions = Object.keys(actions).reduce(
		(result, actionKey) => {
			if (typeof actions[actionKey] === 'function') {
				if (isCustomActionCreator(actions[actionKey])) {
					return ({
						...result,

						[actionKey]: wrapEffect(
							actions[actionKey],
							(actions) => wrapChildActionCreators(wrap, actions, key, select),
							select
						),
					});
				} else {
					// обычные действия
					const actionCreator = (...args) => wrap(actions[actionKey](...args));
					if (key) {
						actionCreator.toString = () => joinKeys(key, String(actions[actionKey]) || actionKey);
					} else {
						actionCreator.toString = () => (String(actions[actionKey]) || actionKey);
					}
					return ({ ...result, [actionKey]: actionCreator });
				}
			} else {
				// действия дочерних объектов
				return ({ ...result, [actionKey]: wrapChildActionCreators(wrap, actions[actionKey], key, select) });
			}
		},
		{}
	);
	return wrappedActions;
}

export function wrapActionsCreatorsWithKey(key: string, actions, select: (...args) => (state) => any) {
	return wrapChildActionCreators(wrapAction(key), actions, key, select);
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
	let getWrapper;

	if (typeof wrappers === 'function') {
		getWrapper = () => wrappers;
	} else {
		const wrappersList = decomposeKeys(wrappers);
		getWrapper = (type: string) => {
			const wrapperKey = Object.keys(wrappersList).find(
				(key) => ((type || '').indexOf(key + '.') === 0 || type === key)
			);

			return wrapperKey ? wrappersList[wrapperKey] : null;
		}
	}

	return wrapChildActionCreators(
		function wrapAction(action: IAction<any>) {
			const wrapper = getWrapper(action.type);

			const subActinos = (action.actions || []).map(wrapAction);

			if (subActinos.length === 0 && !wrapper) {
				return action;
			}

			if (wrapper) {
				const newSubActions = wrapper(action, actions) || [];
				const newActions = [...subActinos, ...(Array.isArray(newSubActions) ? newSubActions : [newSubActions])];
				if (newActions.length > 0) {
					return {
						...action,
						actions: newActions,
					}
				} else {
					return {...action};
				}
			} else {
				return {
					...action,
					actions: subActinos,
				}
			}
		},
		actions
	);
}

export function decomposeKeys(list: object, parentKey = ''): { [key: string]: any } {
	return Object.keys(list).reduce(
		(result, key) => {
			if (typeof list[key] === 'object') {
				return { ...result, ...decomposeKeys(list[key], parentKey ? joinKeys(parentKey, key) : key) };
			} else {
				return { ...result, [parentKey ? joinKeys(parentKey, key) : key]: list[key] };
			}
		},
		{}
	);
}

const CheckCustorActionCreatorField = '__Encaps.ActionCreatorsGetter__';
const ActionCreatorFactoryField = '__Encaps.ActionCreatorFactory__';
const GetEffectParamsValue = '__Encaps.GetEffectParamsValue__';

export function createCustomActionCreator(
	effect: (actions, select) => any,
	getActions: (...agrs) => any,
	select: (...agrs) => (state) => any,
	isActionCreatorFactory = false
) {
	const newEffect = (...args) => {
		if (args[0] === GetEffectParamsValue) {
			return [effect, getActions, select, isActionCreatorFactory];
		} else {
			return effect(getActions(...args), select(...args))(...args);
		}
	}

	if (isActionCreatorFactory) {
		newEffect[ActionCreatorFactoryField] = true;
	}
	newEffect[CheckCustorActionCreatorField] = true;
	return newEffect;
}

export function wrapEffect(effect, wrapActions, select) {
	const [originEffect, getActions, originSelect, isActionCreatorFactory] = effect(GetEffectParamsValue);
	return createCustomActionCreator(
		originEffect,
		(...args) => wrapActions(getActions(...args)),
		(...args) => (state) => originSelect(...args)(select(...args)(state)),
		isActionCreatorFactory
	);
}

export function isCustomActionCreator(getter) {
	return !!getter[CheckCustorActionCreatorField];
}

export function isActionCreatorFactory(getter) {
	return !!getter[ActionCreatorFactoryField];
}

export function build(): IBuilder;
export function build<Actions extends IActionCreators, State>(
	model: IModel<Actions, State>
): IBuilder<Actions, State>;
export function build(
	model: IModel<any, any> = { actions: {}, reducer: (s = {}) => ({ ...s }) }
) {
	return new Builder(model);
}
