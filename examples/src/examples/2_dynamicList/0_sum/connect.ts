import { createContainer } from "encaps-react";
import { createConnectParams } from "encaps-react";
import controller from "./controller";
import { IProps, IViewProps, IState, IPublicState, IPublicActions } from "./types";
import { Dispatch } from "encaps";

export function stateToProps(state: IState, props: IProps) {
	return {
		...state, 
		headerText: props.text, 
		result: state.numbers.reduce((prev, current) => (prev + current))
	};
}

export function dispatchToProps(dispatch: Dispatch, props: IProps) {
	return {
		onNumberChange: (value, index) => dispatch(controller.getActions().numChange({value, index})),
		onAddField: () => dispatch(controller.getActions().addField()),
		onSubtractField: () => dispatch(controller.getActions().subtractField())
	};
}

export const connectParams = createConnectParams(
	controller,
	stateToProps,
	dispatchToProps
);

export default createContainer(connectParams);