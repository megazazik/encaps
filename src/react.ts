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
	IParentProps
} from "./types";
import { IController, getStatePart, getChildController } from './controller';
import shallowEqual = require('fbjs/lib/shallowEqual');

const COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';

export function createComponent<S extends object, Actions>(
	controller: IController<S, Actions>
): <P>(
	View: React.StatelessComponent<P & IParentProps> | React.ComponentClass<P & IParentProps>,
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;
export function createComponent<S extends object, Actions, P = {}, StateProps = {state: S}, ActionsProps = {actions: Actions}>(
	controller: IController<S, Actions>,
	stateToProps?: (state: S, props: P) => StateProps,
	dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps
): <VP = {}>(
	View: React.StatelessComponent<P & VP & StateProps & ActionsProps & IParentProps>
		| React.ComponentClass<P & VP & StateProps & ActionsProps & IParentProps>,
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;

export function createComponent<S extends object, Actions, P, StateProps, ActionsProps, ViewP>(
	controller: IController<S, Actions>,
	stateToProps: (state: S, props: P) => StateProps,
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps,
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
): (
	View: React.StatelessComponent<ViewP & IParentProps> | React.ComponentClass<ViewP & IParentProps>,
	needShallowEqual?: boolean
) => React.ComponentClass<P & IChildProps<S>>;


export function createComponent<S extends object, Actions, P, StateProps, ActionsProps, ViewP>(
	controller: IController<S, Actions>,
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
		View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>,
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
			public static displayName = (View as any).name + COMPONENT_DISPLAY_NAME_SUFFIX;
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

export function createActions<S extends object, A>(controller: IController<S, A>, dispatch) {
	return Object.keys(controller.getActions()).reduce(
		(actions, key) => ({...actions, [key]: (payload?) => dispatch(controller.getActions()[key](payload))}),
		{}
	);
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