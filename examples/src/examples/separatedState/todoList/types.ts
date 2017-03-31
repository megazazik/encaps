import { ITodo } from "../todo/types";

export interface IProps {
	onAddTodo?: (todo: ITodo) => void;
	onRemoveTodo?: (id: number) => void;
	onEditTodo?: (todo: ITodo) => void;
}

export interface IState {
	todos: { [id: number]: ITodo }
}

export interface IViewProps extends IState {
	onAddTodo: (todo: ITodo) => void;
	onRemoveTodo: (id: number) => void;
	onEditTodo: (todo: ITodo) => void;
}