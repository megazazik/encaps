import * as React from "react";
import { IAction, Reducer, IChildProps, ISubAction, Dispatch, ViewProps, GetChildProps, ACTIONS_DELIMITER } from "./types";
import { IController, getStatePart, getChildController } from './controller';
import shallowEqual = require('fbjs/lib/shallowEqual');

const COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';

export function createComponent<P, ViewP, S extends object, PublicS extends object, PublicD>(
	controller: IController<S, PublicS, PublicD>,
	stateToProps?: (state: PublicS, props: P) => Partial<ViewP>,
	dispatchToProps?: (dispatch: PublicD, props: P) => Partial<ViewP>,
	// mergeProps?: (stateProps: Partial<ViewP>, dispatchProps: Partial<ViewP>) => ViewP
): (
	View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, 
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;
export function createComponent<P, ViewP, S extends object>(
	controller: IController<S, S, Dispatch>,
	stateToProps?: (state: S, props: P) => Partial<ViewP>,
	dispatchToProps?: (dispatch: Dispatch, props: P) => Partial<ViewP>,
): (
	View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, 
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;
export function createComponent<P, ViewP, TStateProps, TActionsProps, S extends object>(
	controller: IController<S, S, Dispatch>,
	stateToProps: (state: S, props: P) => TStateProps,
	dispatchToProps: (dispatch: Dispatch, props: P) => TActionsProps,
	mergeProps: (stateProps: TStateProps, actionsProps: TActionsProps) => ViewP
): (
	View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, 
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;
export function createComponent<P, ViewP, TStateProps, TActionsProps, S extends object, PublicS extends object, PublicD>(
	controller: IController<S, PublicS, PublicD>,
	stateToProps: (state: PublicS, props: P) => TStateProps,
	dispatchToProps: (dispatch: PublicD, props: P) => TActionsProps,
	mergeProps: (stateProps: TStateProps, dispatchProps: TActionsProps) => ViewP
): (
	View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, 
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;


export function createComponent<P, ViewP, S extends object, PublicS extends object, PublicD>(
	controller: IController<S, PublicS, PublicD>,
	stateToProps: (state: PublicS, props: P) => Partial<ViewP> = 
		(state, p) => ({...p as any, state}),
	actionsToProps: (dispatch: PublicD, props: P) => Partial<ViewP> = 
		(actions, p) => ({...p as any, actions}),
	mergeProps: (stateProps: Partial<ViewP>, dispatchProps: Partial<ViewP>) => ViewP =
		(stateProps: Partial<ViewP>, dispatchProps: Partial<ViewP>) => ({...stateProps as any, ...dispatchProps as any})
) {
	return (
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, 
		needShallowEqual: boolean = true
	): React.ComponentClass<P & IChildProps<S>> => {
		const getProps = (s, d, p) => mergeProps(
			stateToProps(controller.getSelectState()(s), p),
			actionsToProps(controller.getSelectActions()(d), p),
		);
		const childDispatchs: {[key: string]: Dispatch} = {};
		const getChildDispatch = (dispatch: Dispatch, key: string) => {
			if (!childDispatchs[key]) {
				childDispatchs[key] = controller.getWrapDispatch(key)(dispatch);
			}
			return childDispatchs[key];	
		};
		class StateController extends React.Component<P & IChildProps<S>, {}> {
			public static displayName = (View as any).name + COMPONENT_DISPLAY_NAME_SUFFIX;
			private _componentProps: ViewP;
			private _state: S;
			private _props: P;

			private _getChildProps: GetChildProps = (id: string) => createChildProps(
				this.props.doNotAccessThisInnerState[id],
				getChildDispatch(this.props.doNotAccessThisInnerDispatch, id)
			);

			private _getChildState = (id: string | string[]) => 
				getChildController(controller, id).getSelectState()(
					controller.getStatePart(id)(this.props.doNotAccessThisInnerState)
				);
			private _getChildActions = (id: string | string[]) => 
				getChildController(controller, id).getSelectActions()(
					controller.getWrapDispatch(id)(this.props.doNotAccessThisInnerDispatch)
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
						getChildState: this._getChildState,
						getChildActions: this._getChildActions
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

export function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S> {
	return {
		doNotAccessThisInnerState: state,
		doNotAccessThisInnerDispatch: dispatch
	};
}

export function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean {
	return shallowEqual(props1.doNotAccessThisInnerState, props2.doNotAccessThisInnerState);
}