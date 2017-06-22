import { createComponent } from "encaps-component-factory/react";
import controller from "./controller";
import { IProps, IViewProps, IState, IPublicState, IPublicActions } from "./types";

export default createComponent<IProps, IViewProps, IState, IPublicState, IPublicActions>(
	controller,
	(state, props) => ({...state, headerText: props.text}),
	(actions, props) => ({
		onNumberChange: (value, index) => actions.numChange({value, index}),
		onAddField: actions.addField,
		onSubtractField: actions.subtractField
	})
);