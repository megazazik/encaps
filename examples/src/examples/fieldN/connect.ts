import { createComponent } from "encaps-component-factory/react";
import controller, { activate } from "./controller";
import { IProps, IViewProps, IState, IActions } from "./types";

export default createComponent(
	controller,
	(state, props: IProps) => ({...state, ...props}),
	(dispatch, props) => ({
		onStateChange: (value) => dispatch(controller.getActions().activate(value))
	})
);