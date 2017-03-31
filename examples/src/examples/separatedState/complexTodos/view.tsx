import * as React from "react";
import TodoListItem from "../todoListItem/withFavorites";
import CreateTodo from "../createTodo";
import { IViewProps } from "./types";
import { ITodo } from "../todo/types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<CreateTodo onCreate={ (todo:ITodo) => { props.todos.onAddTodo(todo); props.items.onAddValue(todo.id + ""); } } />
			{Object.keys(props.todos.todos).map( id => 
				<TodoListItem 
					key={`todo${id}`}
					todo={props.todos.todos[id]}
					onChange={props.todos.onEditTodo} 
					onRemove={() => { props.todos.onRemoveTodo(parseInt(id)); props.items.onSubtractValue(id); } }
					{...props.items.values[id]}
				/>
			)}
		</div>
	);
}