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
import { 
	createChildProps,
	IGetPropsParams,
	createConnectParams,
	createWrapDispatch,
	composeConnectParams
} from './getProps';
import shallowEqual = require('fbjs/lib/shallowEqual');

const COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';

export { shallowEqual };

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
	connectParams: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>
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
		class StateController extends React.Component<P & VP & IChildProps<S>, {}> {
			public static displayName = (View.displayName || (View as any).name) + COMPONENT_DISPLAY_NAME_SUFFIX;
			private _computedProps;
			private _getChildDispatch = createWrapDispatch();
			private _connectParams = composeConnectParams(parentConnectParams, connectParams);
			private _firstCall = true;

			shouldComponentUpdate (nextProps): boolean {
				if (needShallowEqual && shallowEqual(nextProps, this.props)) {
					return false;
				}
				
				const newComponentProps = this._getProps(nextProps);

				if (needShallowEqual && shallowEqual(newComponentProps, this._computedProps)) {
					return false;
				} else {
					this._computedProps = newComponentProps;
					return true;
				}
			}

			private _getProps(props) {
				const { doNotAccessThisInnerState: s, doNotAccessThisInnerDispatch: d, ...p } = props;
				const {
					stateToProps,
					dispatchToProps,
					mergeProps
				} = this._connectParams;

				let stateProps = stateToProps(s, p);
				let dispatchProps = dispatchToProps(d, p);

				if (this._firstCall) {
					if (typeof stateProps === 'function') {
						this._connectParams.stateToProps = stateProps;
						stateProps = stateProps(s, p);
					}

					
					if (typeof dispatchProps === 'function') {
						this._connectParams.dispatchToProps = dispatchProps;
						dispatchProps = dispatchProps(d, p);
					}

					this._firstCall = false;
				}

				return mergeProps(
					stateProps,
					dispatchProps,
					p
				);
			}

			public render() {
				if (!this._computedProps) {
					this._computedProps = this._getProps(this.props);
				}

				return React.createElement(View as any, this._computedProps);
			}
		}

		return StateController;
	}

	return createContainerInner;
}

export const parentConnectParams: IGetPropsParams<any, any, any, any, any, any, IParentProps> = {
	stateToProps: (fState, fProps) => {
		const sData = {
			state: fState,
			dispatch: undefined,
			getChild: (id: string) => createChildProps(
				sData.state[id],
				sData.wrapDispatch(id, sData.dispatch)
			),
			wrapDispatch: createWrapDispatch()
		}

		return (state, props) => {
			sData.state = state
			return {__data__: sData};
		};
	},
	dispatchToProps: (dispatch, props) => ({dispatch}),
	mergeProps: (fromState, fromDispatch, props) => {
		fromState.__data__.dispatch = fromDispatch.dispatch;

		return {
			getChild: fromState.__data__.getChild
		};
	}
}