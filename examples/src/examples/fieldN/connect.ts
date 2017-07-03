import { createComponent } from "encaps-component-factory/react";
import controller from "./controller";
import { IProps } from "./types";

export default createComponent(
	controller,
	(state, props: IProps) => ({...state, ...props}),
	(dispatch, props) => ({
		onStateChange: (value) => dispatch(controller.getActions().activate(value))
	})
);