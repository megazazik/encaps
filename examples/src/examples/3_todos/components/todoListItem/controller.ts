import { createBuilder } from "encaps/controller";
import { createComponent } from "encaps/react";
import { IAction } from "encaps/types";
import { IProps, IViewProps, IState } from "./types";

export const builder = createBuilder()
	.setInitState<IState>( () => ({expanded: false}) )
	.action({
		toggle: (state, action: IAction<boolean>) => ({
			expanded: !state.expanded
		}) 
	});

export const controller = builder.getController();

export const connect = createComponent(
	controller,
	(state, props) => state,
	(dispatch, props) => ({onExpand: () => dispatch(controller.getActions().toggle())})
);

export default controller;