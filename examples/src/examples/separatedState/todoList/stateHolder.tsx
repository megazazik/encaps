import * as React from "react";
import * as ECF from "encaps-component-factory";
import { ITodo } from "../todo/types";
import Dispatcher from "../events";
import { IProps as ITodoProps } from "./types";

interface IProps<P> {
	Element: React.ComponentClass<P & ECF.IChildProps> | React.SFC<P & ECF.IChildProps>;
	elementProps: P & ECF.IChildProps;
	todoProps?: ITodoProps
}

export const TODOS_STATE_ITEM_KEY = "todos";
const StateHolder = ECF.getStateHolder();

class TodoStateHolder extends React.Component<IProps<any>, {}> {
	private static readonly addTodoDispatcher = new Dispatcher();
	private static readonly editTodoDispatcher = new Dispatcher();
	private static readonly removeTodoDispatcher = new Dispatcher();

	private static onAddTodo(todo: ITodo): void { TodoStateHolder.addTodoDispatcher.notifyAll(todo) };
	private static onRemoveTodo(id: number): void { TodoStateHolder.removeTodoDispatcher.notifyAll(id) };
	private static onEditTodo(todo: ITodo): void { TodoStateHolder.editTodoDispatcher.notifyAll(todo) };

	private onAddTodo: (todo: ITodo) => void;
	private onRemoveTodo: (id: number) => void;
	private onEditTodo: (todo: ITodo) => void;

	constructor (props) {
		super(props);

		this.setHandlers(this.props.todoProps);
	}

	private setHandlers(handlers: ITodoProps = {}): void {
		if (this.onAddTodo != handlers.onAddTodo) {
			TodoStateHolder.addTodoDispatcher.remove(this.onAddTodo);
			TodoStateHolder.addTodoDispatcher.add(handlers.onAddTodo);
			this.onAddTodo = handlers.onAddTodo;
		}

		if (this.onEditTodo != handlers.onEditTodo) {
			TodoStateHolder.editTodoDispatcher.remove(this.onEditTodo);
			TodoStateHolder.editTodoDispatcher.add(handlers.onEditTodo);
			this.onEditTodo = handlers.onEditTodo;
		}

		if (this.onRemoveTodo != handlers.onRemoveTodo) {
			TodoStateHolder.removeTodoDispatcher.remove(this.onRemoveTodo);
			TodoStateHolder.removeTodoDispatcher.add(handlers.onRemoveTodo);
			this.onRemoveTodo = handlers.onRemoveTodo;
		}
	}

	componentWillReceiveProps (nextProps: IProps<any>): void {
		this.setHandlers(nextProps && nextProps.todoProps);
	}

	componentWillUnmount(): void {
		this.setHandlers();
	}

	render () {
		const elementProps = {
			...this.props.elementProps,
			onAddTodo: TodoStateHolder.onAddTodo,
			onEditTodo: TodoStateHolder.onEditTodo,
			onRemoveTodo: TodoStateHolder.onRemoveTodo,
		}
		
		return <StateHolder 
			code={TODOS_STATE_ITEM_KEY}
			Element={this.props.Element}
			elementProps={elementProps}
		/>;
	}
}

export default function getTodosHolder<P> (
	Element: React.ComponentClass<P & ECF.IChildProps> | React.SFC<P & ECF.IChildProps>,
	elementProps: P & ECF.IChildProps,
	todoProps: ITodoProps = {}
): JSX.Element {
	return (
		<TodoStateHolder 
			Element={Element}
			elementProps={elementProps}
			todoProps={todoProps}
		/>
	);
}