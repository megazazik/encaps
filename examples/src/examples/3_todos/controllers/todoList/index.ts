import { createBuilder } from "encaps-component-factory/controller";
import { createContainer } from "encaps-component-factory/react";
import { createConnectParams } from "encaps-component-factory/getProps";
import { IAction } from "encaps-component-factory/types";
import { IState } from "./types";
import { ITodo, Status } from "../todo/types";

export const ACTION_REMOVE_TODO = 'removeTodo';

export const builder = createBuilder()
	.setInitState<IState>( () => ({todos: {}, newTodoId: 0}) )
	.action({
		editTodo: (state, action: IAction<ITodo>) => ({
			...state,
			todos: {...state.todos, [action.payload.id]: action.payload}
		}),
		addTodo: (state, action: IAction<ITodo>) => ({
			...state,  
			todos: {...state.todos, [state.newTodoId]: {...action.payload, id: state.newTodoId}},
			newTodoId: state.newTodoId + 1
		}),
		removeTodo: (state, action: IAction<number>) => {
			const newTodos = {...state.todos};
			delete newTodos[action.payload]
			return {...state,  todos: newTodos};
		}
	});

export const controller = builder.getController();

export const connectParams = createConnectParams(
	controller,
	(state: IState) => state,
	(dispatch) => {
		let storedDispatch = dispatch;
		const onAddTodo = (todo: ITodo) => storedDispatch(controller.getActions().addTodo(todo));
		const onRemoveTodo = (id: number) => storedDispatch(controller.getActions().removeTodo(id));
		const onEditTodo = (todo: ITodo) => storedDispatch(controller.getActions().editTodo(todo));
		return (dispatch) =>({
			onAddTodo,
			onRemoveTodo,
			onEditTodo
		})
	}
)

export const connect = createContainer(connectParams);

export default controller;