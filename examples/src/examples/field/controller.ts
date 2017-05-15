import * as React from "react";
import * as ECF from "encaps-component-factory";
import {IProps, IViewProps, IState} from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();
builder.setInitState(() => ({active: false}));

const activate = builder.addHandler('activate', (state, action: ECF.IAction<boolean>) => ({...state,  active: action.payload}) );
builder.setStateToProps((state, props) =>({
	...state,
	...props
}))

builder.setDispatchToProps((dispatch, props) =>({
	onStateChange: (value) => dispatch(activate(value))
}))

export default builder.getController();
