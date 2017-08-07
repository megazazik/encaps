import * as React from "react";
import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import { createContainer } from "encaps-component-factory/react";
import { getProps, wrapConnectParams } from "encaps-component-factory/getProps";
import { IAction, Dispatch } from "encaps-component-factory/types";
import componentController from "../controller";
import ComponentView from "../";
import withStore from "../../../../redux";
import todosController, { connectParams } from "../../../controllers/todoList";
import { IViewProps } from "../types";
import { Status } from "../../../controllers/todo/types";

/** 
 * Чтобы заработало, нужно в файле 
 * examples/src/examples/3_todos/components/todoListItem/view.tsx
 * закомментировать компонент FavoriteConnected в разметке
 */

const TODOS_COUNT = 1000;

const todos = {};
for(let i: number = 0; i < TODOS_COUNT; i++) {
	todos[i] = {
		title: "Это очень важное дело " + i,
		description: "Надо обязательно все сделать",
		status: Status.New,
		id: i
	};
}

const initState = {
	todos: {
		todos,
		newTodoId: TODOS_COUNT + 1
	}
};

const builder = createBuilder()
	.setInitState(() => initState)
	.addChild("todos", todosController)
	.addChild("items", componentController);

const controller = builder.getController();

const Component = createContainer(
	wrapConnectParams('todos', connectParams)
)((props) => (
	<ComponentView
		{...props.todos}
		{...props.getChild('items')}
	/>
));

export default withStore(controller.getReducer(), Component);