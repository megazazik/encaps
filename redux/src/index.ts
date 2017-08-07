import * as React from "react";
import { connect as reduxConnect } from 'react-redux';
import { compose } from 'redux';
import { IAction, IChildProps, Dispatch, ACTIONS_DELIMITER } from "encaps-component-factory";
import { IController, getStatePart, wrapDispatch } from "encaps-component-factory/controller";
import { 
	IGetPropsParams, 
	createChildProps, 
	createWrapDispatch, 
	composeConnectParams,
	wrapConnectParams
} from "encaps-component-factory/getProps";
import { ComponentPath, IParentProps } from "encaps-component-factory/types";
import { parentConnectParams } from "encaps-component-factory/react";

export interface IConnectParams {
	stateToProps?: (state: any, props: any) => any; 
	dispatchToProps?: (dispatch: Dispatch, props: any) => any;
	mergeProps?: (stateProps: any, dispatchProps: any, props: any) => any;
	path?: ComponentPath;
	noConvertToComponentProps?: boolean;
}

export function connect (
	{
		path,
		stateToProps,
		dispatchToProps,
		mergeProps = (state, dispatch, props) => ({...state, ...dispatch, ...props}),
		noConvertToComponentProps
	}: IConnectParams = {}
): (component: React.ComponentType<any>) => React.StatelessComponent<any> {
	const usedNoConvertToComponentProps = !!stateToProps || !!dispatchToProps || !!noConvertToComponentProps;
	
	const usedStateToProps = stateToProps || ((state) => state);
	const usedDispatchToProps = dispatchToProps || ((dispatch) => dispatch);
	
	const stateToViewProps =  usedNoConvertToComponentProps ? (s) => s : (s) => ({ doNotAccessThisInnerState: s});
	const dispatchToViewProps = usedNoConvertToComponentProps ? (d) => d : (d) => ({ doNotAccessThisInnerDispatch: d});
	
	let cachedDispatch: Dispatch;
	const getDispatch = (dispatch) => {
		if (!cachedDispatch) {
			cachedDispatch = path ? wrapDispatch(path, dispatch) : dispatch;
		}
		return cachedDispatch;
	}
	
	const getChildState = (state) => getStatePart(path, state);

	return reduxConnect(
		(state, props) => stateToViewProps(usedStateToProps(
			getChildState(state),
			props
		)),
		(dispatch, props) => dispatchToViewProps(usedDispatchToProps(
			getDispatch(dispatch),
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
	return (component, path = []) => {
		const pathParts = typeof path === 'string' ? path.split(".") : path;
		const componentParams = pathParts.reduce(
			(prevParams, pathPart) => ({
				...wrapConnectParams(pathPart, prevParams),
				mergeProps: prevParams.mergeProps
			}),
			params
		);

		const connectParams = composeConnectParams(parentConnectParams, componentParams);

		return reduxConnect(
			connectParams.stateToProps,
			connectParams.dispatchToProps,
			connectParams.mergeProps
		)(component);
	}
}

export default connect;