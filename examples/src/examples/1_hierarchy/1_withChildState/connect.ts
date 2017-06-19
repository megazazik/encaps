import { createComponent } from "encaps-component-factory/react";
import controller from "./controller";
import { IProps, IViewProps, IState } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";

export default createComponent<IProps, IViewProps, IState>(
	controller,
	(state, props) => ({...state, ...props})
);