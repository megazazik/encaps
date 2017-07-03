import { ITodo } from "../todo/types";

export interface IState {
	todos: { [id: number]: ITodo },
	newTodoId: number
}

export interface IViewProps extends IState {
	onAddTodo: (todo: ITodo) => void;
	onRemoveTodo: (id: number) => void;
	onEditTodo: (todo: ITodo) => void;
}