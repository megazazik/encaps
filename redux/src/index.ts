import * as React from "react";
import { connect } from 'react-redux';
import { IAction, IChildProps, IStateHolderProps, wrapDispatch } from "encaps-component-factory";

const InnerStateHolder = (props: {
    state: any, 
    dispatch: (action: IAction<any>) => void,
    holderProps: IStateHolderProps
}): JSX.Element => {

    const stateProps: IChildProps = {
		doNotAccessThisInnerState: props.holderProps.code ? props.state[props.holderProps.code] : props.state,
		dispatch: props.holderProps.code ? wrapDispatch(props.dispatch, props.holderProps.code) : props.dispatch
	}

    return React.createElement(props.holderProps.Element as any, {...props.holderProps.elementProps, ...stateProps});
}

const connectedComponent = connect(
    (state: any, props: IStateHolderProps) => ({
        state,
        holderProps: props
    }),
    (dispatch: (action: IAction<any>) => void) => ({ dispatch })
)(InnerStateHolder);

const ReduxStateHolder: React.StatelessComponent<IStateHolderProps> = (props: IStateHolderProps): JSX.Element => {
    return React.createElement(connectedComponent, props);
}

export default ReduxStateHolder;