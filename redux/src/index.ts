import * as React from "react";
import { connect as reduxConnect } from 'react-redux';
import { compose } from 'redux';
import { IAction, IChildProps, Dispatch, ACTIONS_DELIMITER } from "encaps-component-factory";
import { IController, getStatePart, getChildController } from "encaps-component-factory/controller";
import { IGetPropsParams, createChildProps, createGetChildDispatch } from "encaps-component-factory/getProps";
import { ComponentPath, IParentProps } from "encaps-component-factory/types";

export interface IConnectParams {
	stateToProps?: (state: any, props: any) => any; 
	dispatchToProps?: (dispatch: Dispatch, props: any) => any;
	mergeProps?: (stateProps: any, dispatchProps: any, props: any) => any;
	rootController?: IController<any, any, any>;
	path?: ComponentPath;
	noConvertToComponentProps?: boolean;
}

export function connect (
	{
		rootController,
		path,
		stateToProps,
		dispatchToProps,
		mergeProps = (state, dispatch, props) => ({...state, ...dispatch, ...props}),
		noConvertToComponentProps
	}: IConnectParams = {}
): (component: React.ComponentType<any>) => React.StatelessComponent<any> {
	const usedNoConvertToComponentProps = noConvertToComponentProps !== undefined 
		? noConvertToComponentProps
		: !!(stateToProps || dispatchToProps);

	const usedStateToProps = stateToProps || ((state, props) => state);
	const usedDispatchToProps = dispatchToProps || ((dispatch, props) => dispatch);
	
	const stateToViewProps =  usedNoConvertToComponentProps ? (s) => s : (s) => ({ doNotAccessThisInnerState: s});
	const dispatchToViewProps = usedNoConvertToComponentProps ? (d) => d : (d) => ({ doNotAccessThisInnerDispatch: d});
	
	const getChildDispatch = rootController ? rootController.getWrapDispatch(path) : (dispatch) => dispatch;
	const getChildState = (state) => getStatePart(path, state);

	return reduxConnect(
		(state, props) => stateToViewProps(usedStateToProps(
			getChildState(state),
			props
		)),
		(dispatch, props) => dispatchToViewProps(usedDispatchToProps(
			getChildDispatch(dispatch),
			props
		)),
		mergeProps
	);
}

export function connectView<
	S extends object,
	Actions,
	SubActions,
	P,
	StateProps,
	ActionsProps,
	ViewP
>(
	params: IGetPropsParams<S, Actions, SubActions,	P, StateProps, ActionsProps, ViewP>
): <VP = {}>(
	component: React.ComponentType<ViewP & VP & IParentProps>,
	path?: ComponentPath
) => React.StatelessComponent<P & VP> {
	// todo add root controller

	const getChildDispatch = createGetChildDispatch(params.controller);

	return (component, path?) => {
		const getComponentDispatch = path ? params.controller.getWrapDispatch(path) : (dispatch) => dispatch;
		const getChildState = path ? (state) => getStatePart(path, state) : (state) => state;

		const createUniqueStateToProps = () => {
			let currentState;
			let currentDispatch;
			const getChild = (id: string) => createChildProps(
				currentState[id],
				getChildDispatch(id, currentDispatch)
			)

			const setCurrents = (state, dispatch) => {
				currentState = state;
				currentDispatch = dispatch;
			};

			return (state, props) => 
			({
				__state__: state,
				__getChild__: getChild,
				__setCurrents__: setCurrents,
				stateProps:	params.stateToProps(
					getChildState(state),
					props
				)
			})

		};

		const mergeProps = (fromState, fromDispatch, props) => {
			fromState.__setCurrents__(
				fromState.__state__,
				fromDispatch.__dispatch__
			);

			return {
				...params.mergeProps(
					fromState.stateProps,
					fromDispatch.dispatchProps,
					props
				) as any,
				getChild: fromState.__getChild__
			};
		};

		return reduxConnect(
			createUniqueStateToProps,
			(dispatch, props) => ({
				__dispatch__: dispatch,
				dispatchProps:	params.dispatchToProps(
					getComponentDispatch(dispatch),
					props
				)
			}),
			mergeProps
		);
	}
}

export default connect;