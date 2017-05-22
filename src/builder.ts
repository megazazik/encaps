import * as React from "react";
import { IAction, Reducer, IChildProps, ISubAction, Dispatch, ViewProps, GetChildProps } from "./types";
import shallowEqual = require('fbjs/lib/shallowEqual');

const ACTIONS_DELIMITER = ".";

export interface IController<P, S, ViewP extends object> {
	getInitState(): () => S;
	getComponent<FP, FR>(
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>,
		propToViewProps: (props: FP) => FR,
		pure?: boolean
	): React.ComponentClass<P & IChildProps<S> & FR>;
	getComponent(
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>
	): React.ComponentClass<P & IChildProps<S>>;

	/**
	 * Возвращает функцию, обрабатывающую действия
	 * @returns Reducer
	 */
	getReducer(): Reducer<S>;

	/**
	 * Возвращает свойства представления компонента на основе его состояния
	 * В отличие от getStateToProps и getDispathToProps возвращает полные свойства, включающие свойства всех дочерних компонентов
	 * @param state текущее состояние
	 * @param dispatch функция для вызова действий
	 * @param props свойства, переданные компоненту
	 */
	getGetProps(): (state: S, dispatch: Dispatch, props: P) => ViewP;

	/**
	 * Возвращает свойства представления компонента на основе его состояния
	 * @param state текущее состояние
	 * @param props свойства, переданные компоненту
	 */
	getStateToProps(): (state: S, props: P) => Partial<ViewP>;

	/**
	 * Возвращает свойства представления компонента, связанные с генерацией действий
	 * @param dispatch функция для вызова действий
	 * @param props свойства, переданные компоненту
	 */
	getDispatchToProps(): (dispatch: Dispatch, props: P) => Partial<ViewP>;
}

export interface IBuilder<P, S, ViewP extends object> {
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
	addHandler<T>(
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (payload: T) => IAction<T>;

	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для вызова действий
	 */
	// addDispatchedHandler<T>(
	// 	id: string,
	// 	handler: (state: S, action: IAction<T>) => S
	// ): (dispatch: Dispatch, payload: T) => void;

	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для создания действий
	 */
	addSubHandler(
		id: string,
		handler: (state: S, action: ISubAction<any>) => S
	): (dispatch: Dispatch, key: string) => Dispatch;

	/**
	 * Задает функцию, которая возвращает свойства представления
	 * Если это свойство задано, то setStateToProps и setDispatchToProps не используются
	 * @param getProps функция, возвращающая свойства
	 */
	setGetProps(getProps: (state: S, dispatch: Dispatch, props: P) => ViewP): void;

	/**
	 * Задает функцию, которая возвращает свойства представления на основе текущего состояния 
	 * @param getProps функция, возвращающая свойства
	 */
	setStateToProps(getProps: (state: S, props: P) => Partial<ViewP>): void;

	/**
	 * Задает функцию, которая возвращает свойства представления
	 * @param getProps функция, возвращающая свойства
	 */
	setDispatchToProps(getProps: (dispatch: Dispatch, props: P) => Partial<ViewP>): void;

	/**
	 * Добавляет дочерний компонент
	 * @param key - индетификатор дочечернего компонента
	 * @param builder - объект для построения дочернего компонента
	 */
	addChildBuilder(
		key: string,
		builder: IController<any, any, any>
	): (dispatch: Dispatch) => Dispatch;

	/**
	 * Добавляет расширяемый компонент
	 * @param key - индетификатор расширяемого компонента
	 * @param builder - объект для построения расширяемого компонента
	 */
	addBuilder(
		key: string,
		builder: IController<any, any, any>
	): (dispatch: Dispatch) => Dispatch;

	/**
	 * Создает контроллер копмпонента
	 * @returns объект для создани компонента
	 */
	getController(): IController<P, S, ViewP>;
}


/**
 * Базовый класс для построения компонентов
 * @type P тип свойств 
 * @type S тип состояния
 * @type ViewP тип свойств внутреннего представления
 */
class ComponentBuilder<P, S, ViewP extends object> implements IBuilder<P, S, ViewP> {
	public _childs: { [key: string]: IController<any, any, any> } = {};
	public _initState: () => S;
	public _handlers: {
		[id: string]: Reducer<S>
	} = {};
	public _subHandlers: {
		[id: string]: (state: S, action: ISubAction<any>) => S
	} = {};
	public _childDispatchs: { [key: string]: Dispatch } = {};
	public _getProps: (state: S, dispatch: Dispatch, props: P) => ViewP;
	public _getStateToProps: (state: S, props: P) => Partial<ViewP> = (state, props) => ({...(props as any), state: state} as any);
	public _getDispatchProps: (dispatch: Dispatch, props: P) => Partial<ViewP> = (dispatch) => ({dispatch: dispatch} as any);
	public _builders: { [key: string]: IController<any, any, any> } = {};

	setInitState(f: () => S): void {
		this._initState = f;
	}

	addHandler<T>(
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (payload?: T) => IAction<T> {
		this._handlers[id] = handler;
		return (payload: T) => ({ type: id, payload: payload });
	}

	addDispatchedHandler<T>(
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (dispatch: Dispatch, payload: T) => void {
		const actionCreator = this.addHandler(id, handler);
		return (dispatch: Dispatch, payload: T) => dispatch(actionCreator(payload));
	}

	addSubHandler(
		id: string,
		handler: (state: S, action: ISubAction<any>) => S
	): (dispatch: Dispatch, key: string) => Dispatch {
		this._subHandlers[id] = handler;
		return (dispatch: Dispatch, key: string) => wrapDispatch(dispatch, joinKeys(id, key));
	}

	setGetProps(getProps: (state: S, dispatch: Dispatch, props: P) => ViewP): void {
		this._getProps = getProps;
	}

	setStateToProps(getProps: (state: S, props: P) => Partial<ViewP>): void {
		this._getStateToProps = getProps;
	}
	
	setDispatchToProps(getProps: (dispatch: Dispatch, props: P) => Partial<ViewP>): void {
		this._getDispatchProps = getProps;
	}

	addChildBuilder(
		key: string,
		builder: IController<any, any, any>
	): (dispatch: Dispatch) => Dispatch {
		this._childs[key] = builder;
		return (dispatch: Dispatch) => wrapDispatch(dispatch, key);
	}

	addBuilder(
		key: string,
		builder: IController<any, any, any>
	): (dispatch: Dispatch) => Dispatch {
		this._builders[key] = builder;
		return (dispatch: Dispatch) => wrapDispatch(dispatch, key);
	}

	getController(): IController<P, S, ViewP> {
		return new Controller<P, S, ViewP>(
			this._initState,
			this._builders,
			this._childs,
			this._handlers,
			this._subHandlers,
			this._getProps,
			this._getStateToProps,
			this._getDispatchProps
		);

	}
}

class Controller<P, S, ViewP extends object> implements IController<P, S, ViewP>{
	private _childDispatchs: { [key: string]: Dispatch } = {};
	private _builtInitState: () => S;
	private _builtReducer: Reducer<S>;
	private _builtGetProps: (state: S, dispatch: Dispatch, props: P) => ViewP;

	constructor(
		private _initState: () => S,
		private _builders: { [key: string]: IController<any, any, any> } = {},
		private _childs: { [key: string]: IController<any, any, any> } = {},
		private _handlers: {
			[id: string]: Reducer<S>
		} = {},
		private _subHandlers: {
			[id: string]: (state: S, action: ISubAction<any>) => S
		} = {},
		private _getProps: (state: S, dispatch: Dispatch, props: P) => ViewP,
		private _stateToProps: (state: S, props: P) => Partial<ViewP>,
		private _dispatchToProps: (dispatch: Dispatch, props: P) => Partial<ViewP>
	) {
		this._init();
	}

	private _init(): void {
		this._builtGetProps = this._buildGetProps();
		this._builtInitState = this._buildInitState();
		this._builtReducer = this._buildReducer();
	}

	getComponent(
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>,
		propToViewProps: (props: any) => any = (props: {}) => ({}),
		pure: boolean = true
	): React.ComponentClass<P & IChildProps<S>> {
		const getProps = this.getGetProps();
		const getChildDispatch = this._getChildDispatch.bind(this);
		class StateController extends React.Component<P & IChildProps<S>, {}> {
			private _componentProps: ViewP;
			private _state: S;
			private _props: P;

			private _getChildProps: GetChildProps = (id: string) => createChildProps(
				this.props.doNotAccessThisInnerState[id],
				getChildDispatch(this.props.doNotAccessThisInnerDispatch, id)
			);

			public render() {
				const { doNotAccessThisInnerState, doNotAccessThisInnerDispatch, ...props } = this.props as any;

				if (!pure || !shallowEqual(doNotAccessThisInnerState, this._state) || ! shallowEqual(props, this._props)) {
					this._state = doNotAccessThisInnerState;
					this._props = props;
					this._componentProps = {
						...getProps(
							this.props.doNotAccessThisInnerState as any, 
							this.props.doNotAccessThisInnerDispatch, 
							props as any
						) as any,
						...propToViewProps(this.props),
						getChild: this._getChildProps
					};
				}
				
				return React.createElement(
					View as any,
					this._componentProps
				);
			}
		}

		return StateController;
	}

	getGetProps() {
		return this._builtGetProps;
	}

	getStateToProps() {
		return this._stateToProps;
	}

	getDispatchToProps() {
		return this._dispatchToProps;
	}

	private _buildGetProps() {
		return (state: S, dispatch: Dispatch, props: P): ViewP => {
			let newProps: any = !!this._getProps ? 
				this._getProps(state, dispatch, props) : 
				{
					...this._stateToProps(state, props) as any,
					...this._dispatchToProps(dispatch, props) as any
				};

			for (let builderKey in this._builders) {
				newProps = {
					...newProps,
					[builderKey]: this._builders[builderKey].getGetProps()(
						state[builderKey],
						this._getChildDispatch(dispatch, builderKey),
						{ ...props as any, ...newProps[builderKey] }
					)
				};
			}

			return newProps;
		}
	}

	private _getChildDispatch(dispatch: Dispatch, key: string): Dispatch {
		if (!this._childDispatchs[key]) {
			this._childDispatchs[key] = wrapDispatch(dispatch, key);
		}
		return this._childDispatchs[key];
	}

	getInitState(): () => S {
		return this._builtInitState;
	}

	private _buildInitState(): () => S {
		return () => {
			let initState: any = !!this._initState ? this._initState() : {};
			for (let builderKey in this._builders) {
				initState[builderKey] = initState[builderKey] || this._builders[builderKey].getInitState()();
			}

			for (let childKey in this._childs) {
				initState[childKey] = initState[childKey] || this._childs[childKey].getInitState()();
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
			return this._handlers.hasOwnProperty(key || baseAction.type) ? this._handlers[key || baseAction.type](state, action) :
				this._subHandlers.hasOwnProperty(key) ? this._subHandlers[key](state, getSubAction(action)) :
					this._builders.hasOwnProperty(key) ? { ...(state as any), [key]: this._builders[key].getReducer()(state[key], action) } :
						this._childs.hasOwnProperty(key) ? { ...(state as any), [key]: this._childs[key].getReducer()(state[key], action) } :
							state;
		};
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

export function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S> {
	return {
		doNotAccessThisInnerState: state,
		doNotAccessThisInnerDispatch: dispatch
	};
}

export const wrapDispatch = (
	dispatch: Dispatch,
	key: string
): Dispatch => {
	return (action: IAction<any>) => {
		dispatch({ type: joinKeys(key, action.type), payload: action.payload });
	}
};

export function createBuilder<P, S>(): IBuilder<P, S, ViewProps<P, S>>;
export function createBuilder<P, S, ViewP extends object>(): IBuilder<P, S, ViewP>;
export function createBuilder<P, S, ViewP extends object>(): IBuilder<P, S, ViewP> {
	return new ComponentBuilder<P, S, ViewP>();
}