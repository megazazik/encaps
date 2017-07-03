import { createBuilder } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
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

export const stateToProps = (state: IState) => ({...state});
export const dispatchToProps = (dispatch) => ({
	onAddTodo: (todo: ITodo) => dispatch(controller.getActions().addTodo(todo)),
	onRemoveTodo: (id: number) => dispatch(controller.getActions().removeTodo(id)),
	onEditTodo: (todo: ITodo) => dispatch(controller.getActions().editTodo(todo))
});

export const connect = createComponent(
	controller,
	stateToProps,
	dispatchToProps
);

export default builder.getController();