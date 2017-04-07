import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";
import { ITodo } from "../todo/types";
import { Status } from "../todo/types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({
	todos: {
		1: {
			title: "Todo1",
			description: "Do something",
			status: Status.InProgress,
			id: 1
		},
		2: {
			title: "The second Todo",
			description: "Do something",
			status: Status.New,
			id: 2
		}
	}
}) );

const editTodo = builder.addDispatchedHandler('editTodo', (state, action: ECF.IAction<ITodo>) => (
	{
		...state,  
		todos: {...state.todos, [action.payload.id]: action.payload}
	}
));

const addTodo = builder.addDispatchedHandler('addTodo', (state, action: ECF.IAction<ITodo>) => (
	{
		...state,  
		todos: {...state.todos, [action.payload.id]: action.payload}
	}
));

const removeTodo = builder.addDispatchedHandler('removeTodo', (state, action: ECF.IAction<number>) => {
	const newTodos = {...state.todos};
	delete newTodos[action.payload]
	return {...state,  todos: newTodos};
});

builder.setGetProps((state, dispatch, props) => ({
	...state, 
	onAddTodo: (todo: ITodo) => {
		props.onAddTodo && props.onAddTodo(todo);
		addTodo(dispatch, todo);
	},
	onRemoveTodo: (id: number) => {
		props.onRemoveTodo && props.onRemoveTodo(id);
		removeTodo(dispatch, id);
	},
	onEditTodo: (todo: ITodo) => {
		props.onEditTodo && props.onEditTodo(todo);
		editTodo(dispatch, todo);
	}
}));

export default builder.getController();