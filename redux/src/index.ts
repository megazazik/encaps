import * as React from "react";
import { connect as reduxConnect } from 'react-redux';
import { compose } from 'redux';
import { IAction, IChildProps, Dispatch, IController, ACTIONS_DELIMITER } from "encaps-component-factory";

export interface IConnectParams {
	stateToProps: (stateProps: any, props: any) => any; 
	dispatchToProps: (dispatchProps: any, props: any) => any;
	controller: IController<any, any, any>;
	path: string | string[];
	noConvertToComponentProps: boolean
}

export function connect (
	params: Partial<IConnectParams> = {}
): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any> {
	const usedParams: Partial<IConnectParams> = {
		stateToProps: (state, props) => state,
		dispatchToProps: (dispatch, props) => dispatch,
		path: [],
		noConvertToComponentProps: false,
		...params
	};

	let path: string[];
	if (typeof usedParams.path === 'string') {
		path = usedParams.path.split(ACTIONS_DELIMITER);
	} else {
		path = usedParams.path;
	}

	const stateToViewProps =  usedParams.noConvertToComponentProps ? (s) => s : (s) => ({ doNotAccessThisInnerState: s});
	const controllerStateToProps = usedParams.controller ? getChildController(usedParams.controller, path).getStateToProps() : (s, p) => s;

	const dispatchToViewProps = usedParams.noConvertToComponentProps ? (d) => d : (d) => ({ doNotAccessThisInnerDispatch: d});
	const controllerDispatchToProps = usedParams.controller ? getChildController(usedParams.controller, path).getDispatchToProps() : (s, p) => s;
	const getChildDispatch = usedParams.controller ? usedParams.controller.getWrapDispatch() : (d, p) => d;

	return reduxConnect(
		(state, props): Partial<IChildProps<any>> => stateToViewProps(
			usedParams.stateToProps(
				controllerStateToProps(getStatePart(state, path), props), 
				props
			)
		),
		(dispatch, props): Partial<IChildProps<any>> => dispatchToViewProps(
			usedParams.dispatchToProps(
				controllerDispatchToProps(getChildDispatch(dispatch, path), props), 
				props
			)
		)
	);
}

function getStatePart(state: any, path: string[]): any {
	return path.reduce((state, key) => state[key], state);
}

function getChildController(controller: IController<any, any, any>, path: string[]): IController<any, any, any> {
	return path.reduce((controller, key) => controller.getController(key), controller);
}

export default connect;