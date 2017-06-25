import { createComponent } from "encaps-component-factory/react";
import controller from "./controller";
import { IProps, IViewProps, IState, IPublicState, IPublicActions } from "./types";
import { Dispatch } from "encaps-component-factory/types";

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

export default createComponent(
	controller,
	stateToProps,
	dispatchToProps
);