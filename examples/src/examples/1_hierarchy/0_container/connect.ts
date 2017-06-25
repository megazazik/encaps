import { createComponent } from "encaps-component-factory/react";
import controller, { num1Change, num2Change } from "./controller";
import { IProps, IViewProps, IState, IPublicActions } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";

export function stateToProps (state: IState, props: IProps) {
	return {
		...state, 
		result: state.num1 + state.num2,
		headerText: props.text
	}
};

export default createComponent(
	controller,
	stateToProps
);