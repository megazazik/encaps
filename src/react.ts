import * as React from "react";
import {
	IAction,
	Reducer,
	IChildProps,
	ISubAction,
	Dispatch,
	ViewProps,
	GetChildProps,
	ACTIONS_DELIMITER,
	IParentProps,
	IPublicActions
} from "./types";
import { IController, /* todo remove import */ createActions } from './controller';
import { createChildProps, IGetStateParams } from './getProps';
import shallowEqual = require('fbjs/lib/shallowEqual');

const COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';

// todo remove
export function createComponent<
	S extends object,
	Actions,
	SubActions,
	P = {},
	StateProps = S,
	ActionsProps = {actions: IPublicActions<Actions, SubActions>}
>(
	controller: IController<S, Actions, SubActions>,
	stateToProps?: (state: S, props: P) => StateProps,
	dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps
): <VP = {}>(
	View: React.ComponentType<P & VP & StateProps & ActionsProps & IParentProps>,
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;

export function createComponent<
	S extends object,
	Actions,
	SubActions,
	P = {},
	StateProps = S,
	ActionsProps = {actions: IPublicActions<Actions, SubActions>}
>(
	controller: IController<S, Actions, SubActions>,
	stateToProps?: (state: S, props: P) => StateProps,
	dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps
): <VP = {}>(
	View: React.ComponentType<P & VP & StateProps & ActionsProps & IParentProps>,
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;

export function createComponent<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(
	controller: IController<S, Actions, SubActions>,
	stateToProps: (state: S, props: P) => StateProps,
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps,
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
): (
	View: React.ComponentType<ViewP & IParentProps>,
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;

export function createComponent<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(
	controller: IController<S, Actions, SubActions>,
	stateToProps?: (state: S, props: P) => StateProps,
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps =
		(dispatch, p) => ({actions: createActions(controller, dispatch)} as any),
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP =
		(stateProps, actions, p) => ({...p as any, ...stateProps as any, ...actions as any})
) {
	const usedStateToProps = stateToProps || (
		(state: S, props: P) => ({
			...Object.keys(controller.getChildren()).reduce(
				(resultState, key) => {
					delete resultState[key];
					return resultState;
				},
				{...state as any}
			)
		})
	);

	return (
		View: React.ComponentType<ViewP>,
		needShallowEqual: boolean = true
	): React.ComponentClass<P & IChildProps<S>> => {
		const getProps = (s, d, p) => mergeProps(
			usedStateToProps(s, p),
			dispatchToProps(d, p),
			p
		);

		const wrapDispatch: {[key: string]: (d: Dispatch) => Dispatch} = {}; 
		const getChildDispatch = (dispatch: Dispatch, key: string) => {
			if (!wrapDispatch[key]) {
				wrapDispatch[key] = controller.getWrapDispatch(key);
			}
			return wrapDispatch[key](dispatch);	
		};
		
		class StateController extends React.Component<P & IChildProps<S>, {}> {
			public static displayName = (View.displayName || (View as any).name) + COMPONENT_DISPLAY_NAME_SUFFIX;
			private _componentProps: ViewP;
			private _state: S;
			private _props: P;

			private _getChildProps: GetChildProps = (id: string) => createChildProps(
				this.props.doNotAccessThisInnerState[id],
				getChildDispatch(this.props.doNotAccessThisInnerDispatch, id)
			);

			public render() {
				const { doNotAccessThisInnerState, doNotAccessThisInnerDispatch, ...props } = this.props as any;

				if (!needShallowEqual || !shallowEqual(doNotAccessThisInnerState, this._state) || !shallowEqual(props, this._props)) {
					this._state = doNotAccessThisInnerState;
					this._props = props;
					this._componentProps = {
						...getProps(
							this.props.doNotAccessThisInnerState as any, 
							this.props.doNotAccessThisInnerDispatch, 
							props as any
						) as any,
						getChild: this._getChildProps,
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
}

export function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean {
	return shallowEqual(props1.doNotAccessThisInnerState, props2.doNotAccessThisInnerState);
}

export function createContainer<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(
	{
		controller,
		stateToProps,
		dispatchToProps,
		mergeProps
	}: IGetStateParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>
) {
	return (
		View: React.ComponentType<ViewP>,
		needShallowEqual: boolean = true
	): React.ComponentClass<P & IChildProps<S>> => {
		const getProps = (s, d, p) => mergeProps(
			stateToProps(s, p),
			dispatchToProps(d, p),
			p
		);

		const wrapDispatch: {[key: string]: (d: Dispatch) => Dispatch} = {}; 
		const getChildDispatch = (dispatch: Dispatch, key: string) => {
			if (!wrapDispatch[key]) {
				wrapDispatch[key] = controller.getWrapDispatch(key);
			}
			return wrapDispatch[key](dispatch);	
		};
		
		class StateController extends React.Component<P & IChildProps<S>, {}> {
			public static displayName = (View.displayName || (View as any).name) + COMPONENT_DISPLAY_NAME_SUFFIX;
			private _componentProps: ViewP;
			private _state: S;
			private _props: P;

			private _getChildProps: GetChildProps = (id: string) => createChildProps(
				this.props.doNotAccessThisInnerState[id],
				getChildDispatch(this.props.doNotAccessThisInnerDispatch, id)
			);

			public render() {
				const { doNotAccessThisInnerState, doNotAccessThisInnerDispatch, ...props } = this.props as any;

				if (!needShallowEqual || !shallowEqual(doNotAccessThisInnerState, this._state) || !shallowEqual(props, this._props)) {
					this._state = doNotAccessThisInnerState;
					this._props = props;
					this._componentProps = {
						...getProps(
							this.props.doNotAccessThisInnerState as any, 
							this.props.doNotAccessThisInnerDispatch, 
							props as any
						) as any,
						getChild: this._getChildProps,
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
}