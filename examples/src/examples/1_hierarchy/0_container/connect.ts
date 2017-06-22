import { createComponent } from "encaps-component-factory/react";
import controller, { num1Change, num2Change } from "./controller";
import { IProps, IViewProps, IState, IPublicState, IPublicActions } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";

export default createComponent<IProps, IViewProps, IState, IPublicState, IPublicActions>(
	controller,
	(state, props) => ({...state, headerText: props.text}),
	(actions, props) => ({
		onNum1Change: (num) => actions.num1Change(num),
		onNum2Change: (num) => actions.num2Change(num)
	})
);