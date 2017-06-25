import { createComponent, createActions } from "encaps-component-factory/react";
import controller from "./controller";
import { IProps, IViewProps, IState, SUM_KEY } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { stateToProps } from "../0_container/connect";

export default createComponent(
	controller,
	(state, props: IProps) => stateToProps(state.sum, props),
	(dispatch, props) => createActions(
		controller.getChildren()[SUM_KEY],
		controller.getWrapDispatch(SUM_KEY)(dispatch)
	)
);