import * as React from "react";
import { connect as reduxConnect } from 'react-redux';
import { compose } from 'redux';
import { IAction, IChildProps, Dispatch, ACTIONS_DELIMITER } from "encaps-component-factory";
import { IController, getStatePart, getChildController } from "encaps-component-factory/controller";

export interface IConnectParams {
	stateToProps?: (state: any, props: any) => any; 
	dispatchToProps?: (dispatch: Dispatch, props: any) => any;
	mergeProps?: (stateProps: any, dispatchProps: any, props: any) => any;
	controller: IController<any, any, any>;
	path: string | string[];
}

export function connect (
	{
		controller,
		path,
		stateToProps = (state, props) => state,
		dispatchToProps = (dispatch, props) => dispatch,
		mergeProps = (state, dispatch, props) => ({...state, ...dispatch, ...props})

	}: IConnectParams
): (component: React.ComponentType<any>) => React.StatelessComponent<any> {
	
	// todo add getChild method 
	const getChildDispatch = controller.getWrapDispatch(path);
	const getChildState = (state) => getStatePart(path, state);

	return reduxConnect(
		(state, props) => stateToProps(
			getChildState(state),
			props
		),
		(dispatch, props) => dispatchToProps(
			getChildDispatch(dispatch),
			props
		),
		mergeProps
	);
}

export default connect;