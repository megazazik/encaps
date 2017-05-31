import * as React from "react";
import * as ECF from "encaps-component-factory";
import componentController from "../controller";
import ComponentView from "../view";
import withStore from "../../../../redux";
import todosController from "../../../controllers/todoList";
import { IViewProps } from "../types";

const builder = ECF.createBuilder<{}, {}, IViewProps>();
builder.addBuilder("todos", todosController);
builder.addBuilder("items", componentController);
const controller = builder.getController();
const Component = (props) => (
	<ComponentView
		todos={props.todos}
		items={props.items.items}
	/>
);

export default withStore(controller.getReducer(), controller.getComponent(Component));