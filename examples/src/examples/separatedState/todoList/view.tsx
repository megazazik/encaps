import * as React from "react";
import { IViewProps } from "./types";
import TodoForm from "../todo";
import CreateTodo from "../createTodo";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<CreateTodo onCreate={props.onAddTodo} />
			{Object.keys(props.todos).map( id => 
				<TodoForm 
					key={`todo${id}`}
					todo={props.todos[id]}
					onChange={props.onEditTodo} 
				/>
			)}
		</div>
	);
}