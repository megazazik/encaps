import { createComponent } from "encaps-react";
import controller from "./controller";
import { IProps } from "./types";

export default createComponent(
	controller,
	(state, props: IProps) => ({...state, ...props}),
	(dispatch, props) => ({
		onStateChange: (value) => dispatch(controller.getActions().activate(value))
	})
);