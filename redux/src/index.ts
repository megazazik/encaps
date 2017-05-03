import * as React from "react";
import { connect as reduxConnect } from 'react-redux';
import { IAction, IChildProps, Dispatch } from "encaps-component-factory";

export function connect (
    stateToComponentState: (state: any, props: any) => any = (state) => state, 
	dispatchToComponentDispatch: (dispatch: Dispatch, props: any) => Dispatch = (dispatch) => dispatch
): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>  {
    return reduxConnect(
        (state, props): Partial<IChildProps<any>> => ({ doNotAccessThisInnerState: stateToComponentState(state, props)}),
        (dispatch, props): Partial<IChildProps<any>> => ({ doNotAccessThisInnerDispatch: dispatchToComponentDispatch(dispatch, props)})
    );
}

export default connect;