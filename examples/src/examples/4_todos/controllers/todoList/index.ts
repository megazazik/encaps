import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";
import { ITodo, Status } from "../todo/types";

export const ACTION_REMOVE_TODO = 'removeTodo';

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({todos: {}, newTodoId: 0}) );

const editTodo = builder.addHandler('editTodo', (state, action: ECF.IAction<ITodo>) => (
	{
		...state,
		todos: {...state.todos, [action.payload.id]: action.payload}
	}
));

const addTodo = builder.addHandler('addTodo', (state, action: ECF.IAction<ITodo>) => (
	{
		...state,  
		todos: {...state.todos, [state.newTodoId]: {...action.payload, id: state.newTodoId}},
		newTodoId: state.newTodoId + 1
	}
));

const removeTodo = builder.addHandler(ACTION_REMOVE_TODO, (state, action: ECF.IAction<number>) => {
	const newTodos = {...state.todos};
	delete newTodos[action.payload]
	return {...state,  todos: newTodos};
});

builder.setStateToProps((state, props) =>({
	...state
}))

builder.setDispatchToProps((dispatch, props) =>({
	onAddTodo: (todo: ITodo) => dispatch(addTodo(todo)),
	onRemoveTodo: (id: number) => dispatch(removeTodo(id)),
	onEditTodo: (todo: ITodo) => dispatch(editTodo(todo))
}))

export default builder.getController();