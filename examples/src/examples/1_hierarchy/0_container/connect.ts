import { createComponent } from "encaps-component-factory/react";
import controller, { num1Change, num2Change } from "./controller";
import { IProps, IViewProps, IState, IPublicState } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";

export default createComponent<IProps, IViewProps, IState, IPublicState, Dispatch>(
	controller,
	(state, props) => ({...state, headerText: props.text}),
	(dispatch, props) => ({
		onNum1Change: (num) => dispatch(num1Change(num)),
		onNum2Change: (num) => dispatch(num2Change(num))
	})
);