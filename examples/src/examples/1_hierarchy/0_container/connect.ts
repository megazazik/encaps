import { createConnectParams } from "encaps-react";
import controller from "./controller";
import { IProps, IViewProps, IState, IPublicActions } from "./types";
import { IAction, Dispatch } from "encaps";

export function stateToProps (state: IState, props: IProps) {
	return {
		...state, 
		result: state.num1 + state.num2,
		headerText: props.text
	}
};

export default createConnectParams(
	controller,
	stateToProps
);