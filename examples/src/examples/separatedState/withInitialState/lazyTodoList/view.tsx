import * as React from "react";
import TodoListItem from "../../todoListItem/withFavorites";
import CreateTodo from "../../createTodo";
import { IViewProps } from "./types";
import { ITodo } from "../../todo/types";

export default class LazyTodoListView extends React.PureComponent<IViewProps, {}> {
	private onTodoRemove = (id: number): void => {
		this.props.todos.onRemoveTodo(id); 
		this.props.items.onSubtractValue(""+id);
	}

	render () {
		return (
			<div>
				<CreateTodo onCreate={ (todo:ITodo) => { this.props.todos.onAddTodo(todo); this.props.items.onAddValue(todo.id + ""); } } />
				{Object.keys(this.props.todos.todos).map( id => 
					<TodoListItem 
						key={`todo${id}`}
						todo={this.props.todos.todos[id]}
						onChange={this.props.todos.onEditTodo} 
						onRemove={this.onTodoRemove}
						{...this.props.items.getChildProps(id)}
					/>
				)}
			</div>
		);
	}
}