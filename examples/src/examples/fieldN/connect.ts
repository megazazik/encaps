import { createComponent } from "encaps-component-factory/react";
import controller, { activate } from "./controller";
import { IProps, IViewProps, IState, IActions } from "./types";

export default createComponent<IProps, IViewProps, IState, IState, IActions>(
	controller,
	(state, props) => ({...state, ...props}),
	(actions, props) => ({
		onStateChange: (value) => actions.activate(value)
	})
);