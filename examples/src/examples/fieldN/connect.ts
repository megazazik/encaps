import { createComponent } from "encaps-component-factory/react";
import controller, { activate } from "./controller";
import { IProps, IViewProps, IState } from "./types";

export default createComponent<IProps, IViewProps, IState>(
	controller,
	(state, props) => ({...state, ...props}),
	(dispatch, props) => ({
		onStateChange: (value) => dispatch(activate(value))
	})
);