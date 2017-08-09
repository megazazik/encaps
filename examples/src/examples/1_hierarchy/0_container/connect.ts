import { createConnectParams } from "encaps-component-factory/connect";
import controller from "./controller";
import { IProps, IViewProps, IState, IPublicActions } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";

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