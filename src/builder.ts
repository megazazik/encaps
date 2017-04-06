import * as React from "react";
import { IAction, Reducer, IChildProps, ISubAction } from "./types";

const ACTIONS_DELIMITER = ".";

/**
 * Базовый класс для построения компонентов
 * @type P тип свойств 
 * @type S тип состояния
 * @type ViewP тип свойств внутреннего представления
 */
export class ComponentBuilder<P, S, ViewP> {
	protected _initState: () => S;
	getInitState (): () => S {
		return () => {
			let initState: any = !!this._initState ? this._initState() : {};
			for (let builderKey in this._builders) {
				initState[builderKey]  = this._builders[builderKey].getInitState()();
			}

			for (let childKey in this._childs) {
				initState[childKey] = this._childs[childKey].getInitState()();
			}
			return initState;
		}
	}

	/**
	 * Задает, функцию, которая возвращает начальное состояние
	 * @param props свойства переданные элементу при инициализации
	 */
	setInitState (f: () => S): void {
		this._initState = f;
	}

	protected _handlers: {
		[id: string]: Reducer<S>
	} = {};

	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для создания действий
	 */
	addHandler<T> (
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (payload: T) => IAction<T> {
		this._handlers[id] = handler;
		return (payload: T) => ({type: id, payload: payload});
	}

	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для вызова действий
	 */
	addDispatchedHandler<T> (
		id: string,
		handler: (state: S, action: IAction<T>) => S
	): (dispatch: (action: IAction<any>) => void, payload: T) => void {
		const actionCreator = this.addHandler(id, handler);
		return (dispatch: (action: IAction<any>) => void, payload: T) => dispatch(actionCreator(payload));
	}

	private _subHandlers: {
		[id: string]: (state: S, action: ISubAction<any>) => S
	} = {};
	/**
	 * Добавляет обработчик действия
	 * @param id идентификатор действия
	 * @param handler обработчик действия
	 * @returns метод для создания действий
	 */
	addSubHandler (
		id: string,
		handler: (state: S, action: ISubAction<any>) => S
	): (dispatch: (action: IAction<any>) => void, key: string) => (action: IAction<any>) => void {
		this._subHandlers[id] = handler;
		return (dispatch: (action: IAction<any>) => void, key: string) => wrapDispatch(dispatch, joinKeys(id, key));
	}
	
	private _childDispatchs: {[key: string]: (action: IAction<any>) => void} = {};

	private _getChildDispatch (dispatch: (action: IAction<any>) => void, key: string): (action: IAction<any>) => void {
		if (!this._childDispatchs[key]) {
			this._childDispatchs[key] = wrapDispatch(dispatch, key);
		}
		return this._childDispatchs[key];
	}

	private _getProps: (state: S, dispatch: (action: IAction<any>) => void, props: P) => ViewP;
	/**
	 * Задает функцию, которая возвращает свойства представления
	 * @param getProps функция, возвращающая свойства
	 */
	setGetProps (getProps: (state: S, dispatch: (action: IAction<any>) => void, props: P) => ViewP): void {
		this._getProps = getProps;
	}

	buildGetProps () {
		return (state: S, dispatch: (action: IAction<any>) => void, props: P): ViewP => {
			let newProps: any = !!this._getProps ? this._getProps(state, dispatch, props) : {};
			
			for (let builderKey in this._builders) {
				newProps = {
					...newProps, 
					[builderKey]: this._builders[builderKey].buildGetProps()(
						state[builderKey], 
						this._getChildDispatch(dispatch, builderKey), 
						{...props as any, ...newProps[builderKey]}
					)
				};
			}

			for (let childKey in this._childs) {
				newProps[childKey] = createChildProps(
					state[childKey],
					this._getChildDispatch(dispatch, childKey)
				);
			}

			return newProps;
		}
	}

	/**
	 * Создает компонент
	 * @param view представление, используемое для отображения
	 * @returns Созданный компонен
	 */
	getComponent<FP, FR> (
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>,
		propToViewProps: (props: FP) => FR
	): React.StatelessComponent<P & IChildProps<S> & FR>;
	getComponent (
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>
	): React.StatelessComponent<P & IChildProps<S>>;
	getComponent (
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>,
		propToViewProps: (props: any) => any = (props: {}) => ({})
	): React.StatelessComponent<P & IChildProps<S>> {
		const getProps = this.buildGetProps();
		return (props: P & IChildProps<S>): JSX.Element => {
			return React.createElement(
				View as any, 
				{
					...getProps(props.doNotAccessThisInnerState as S, props.doNotAccessThisInnerDispatch, props) as any, 
					...propToViewProps(props)
				}
			);
		};
	}

	/**
	 * Возвращает функцию, обрабатывающую действия
	 * @returns Reducer
	 */
	getReducer (): Reducer<S> {
		return (state: S = this.getInitState()(), baseAction: IAction<any> = {type: "", payload: null}): S => {
			const {key, action} = unwrapAction(baseAction);
			return this._handlers.hasOwnProperty(key || baseAction.type) ? this._handlers[key || baseAction.type](state, action) :
				this._subHandlers.hasOwnProperty(key) ? this._subHandlers[key](state, getSubAction(action)) :
				this._builders.hasOwnProperty(key) ? {...(state as any), [key]: this._builders[key].getReducer()(state[key], action)} :
				this._childs.hasOwnProperty(key) ? {...(state as any), [key]: this._childs[key].getReducer()(state[key], action)} :
				state;
		};
	}

	protected _childs: {[key: string]: ComponentBuilder<any, any, any>} = {};

	/**
	 * Добавляет дочерний компонент
	 * @param key - индетификатор дочечернего компонента
	 * @param builder - объект для построения дочернего компонента
	 */
	addChildBuilder (
		key: string, 
		builder: ComponentBuilder<any, any, any>
	): (dispatch: (action: IAction<any>) => void) => (action: IAction<any>) => void {
		this._childs[key] = builder;
		return (dispatch: (action: IAction<any>) => void) => wrapDispatch(dispatch, key);
	}

	protected _builders: {[key: string]: ComponentBuilder<any, any, any>} = {};

	/**
	 * Добавляет расширяемый компонент
	 * @param key - индетификатор расширяемого компонента
	 * @param builder - объект для построения расширяемого компонента
	 */
	addBuilder (
		key: string, 
		builder: ComponentBuilder<any, any, any>
	): (dispatch: (action: IAction<any>) => void) => (action: IAction<any>) => void {
		this._builders[key] = builder;
		return (dispatch: (action: IAction<any>) => void) => wrapDispatch(dispatch, key);
	}

	cloneWithInitState (f: () => S): ComponentBuilder<P, S, ViewP> {
		const cloneBuilder = createBuilder<P, S, ViewP>();
		cloneBuilder._initState = f;
		cloneBuilder._childs = this._childs;
		cloneBuilder._handlers = this._handlers;
		cloneBuilder._subHandlers = this._subHandlers;
		cloneBuilder._builders = this._builders;
		cloneBuilder._getProps = this._getProps;

		return cloneBuilder;
	}
}

export const unwrapAction = (action: IAction<any>): {action: IAction<any>; key: string} => {
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
	return {...action, key};
}

const joinKeys = (...keys: string[]): string => keys.join(ACTIONS_DELIMITER);

export function createChildProps<S> (state: S, dispatch: (action: IAction<any>) => void) : IChildProps<S> {
	return {
		doNotAccessThisInnerState: state,
		doNotAccessThisInnerDispatch: dispatch
	};
}

export const wrapDispatch = (
	dispatch: (action: IAction<any>) => void, 
	key: string
): (action: IAction<any>) => void => {
	return (action: IAction<any>) => {
		dispatch({type: joinKeys(key, action.type), payload: action.payload});
	}
};

export function createBuilder<P, S, ViewP> (): ComponentBuilder<P, S, ViewP> {
	return new ComponentBuilder<P, S, ViewP> ();
}