import * as React from "react";
import { createBuilder } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction } from "encaps-component-factory/types";
import componentController from "../controller";
import ComponentView from "../";
import withStore from "../../../../redux";
import todosController, { dispatchToProps } from "../../../controllers/todoList";
import { IViewProps } from "../types";

/** 
 * Не работает.
 * Так как в  ComponentView подключается todoListItem, который подключает inFavories, 
 * который в свою очередь использует connect
 */

const builder = createBuilder()
	.setInitState(() => ({}))
	.addChild("todos", todosController)
	.addChild("items", componentController);

const controller = builder.getController();
const Component = createComponent(
	controller,
	(state) => state,
	(dispatch) => ({dispatch})
)((props) => (
	<ComponentView
		{...(props as any).todos}
		{...dispatchToProps(controller.getWrapDispatch('todos')(props.dispatch))}
		{...props.getChild('items')}
	/>
));

export default withStore(controller.getReducer(), Component);