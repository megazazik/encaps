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
import { IController, wrapDispatch } from './controller';
import { createChildProps, IGetPropsParams, createConnectParams, createWrapDispatch } from './getProps';
import shallowEqual = require('fbjs/lib/shallowEqual');

const COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';

export function createComponent<
	S extends object,
	Actions,
	SubActions,
	P = {},
	StateProps = S,
	ActionsProps = IPublicActions<Actions, SubActions>
>(
	controller: IController<S, Actions, SubActions>,
	stateToProps?: (state: S, props: P) => StateProps,
	dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps
): (
	View: React.ComponentType<P & StateProps & ActionsProps & IParentProps>,
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
	dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps,
	mergeProps?: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
) {
	return createContainer(createConnectParams(
		controller,
		stateToProps,
		dispatchToProps,
		mergeProps
	));
}

export function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean {
	return shallowEqual(props1.doNotAccessThisInnerState, props2.doNotAccessThisInnerState);
}

export function createContainer<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(
	{
		stateToProps,
		dispatchToProps,
		mergeProps
	}: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>
) {

	function createContainerInner<VP>(
		View: React.ComponentType<ViewP & VP & IParentProps>,
		needShallowEqual?: boolean
	): React.ComponentClass<P & VP & IChildProps<S>>;

	function createContainerInner(
		View: React.ComponentType<ViewP & IParentProps>,
		needShallowEqual?: boolean
	): React.ComponentClass<P & IChildProps<S>>;

	function createContainerInner<VP>(
		View: React.ComponentType<ViewP & VP & IParentProps>,
		needShallowEqual: boolean = true
	): React.ComponentClass<P & VP & IChildProps<S>> {
		const getProps = (s, d, p) => mergeProps(
			stateToProps(s, p),
			dispatchToProps(d, p),
			p
		);

		const getChildDispatch = createWrapDispatch();
		
		class StateController extends React.Component<P & VP & IChildProps<S>, {}> {
			public static displayName = (View.displayName || (View as any).name) + COMPONENT_DISPLAY_NAME_SUFFIX;
			private _componentProps: ViewP;
			private _state: S;
			private _props: P;

			private _getChildProps: GetChildProps = (id: string) => createChildProps(
				this.props.doNotAccessThisInnerState[id],
				getChildDispatch(id, this.props.doNotAccessThisInnerDispatch)
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

	return createContainerInner;
}