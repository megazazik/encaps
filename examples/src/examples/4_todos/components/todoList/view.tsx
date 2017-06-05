import * as React from "react";
import TodoListItem from "../todoListItem";
import { IViewProps as IItemViewProps } from "../todoListItem/types";
import CreateTodo from "../createTodo";
import { IViewProps } from "./types";
import { ITodo } from "../../controllers/todo/types";
import List from "../../../optimizedList";
import { childPropsEquals } from "encaps-component-factory";

class OptimizedTodoFormList extends List<any> {}

export default class LazyTodoListView extends React.PureComponent<IViewProps, {}> {
	private onTodoRemove = (id: number): void => {
		this.props.todos.onRemoveTodo(id); 
		this.props.items.onSubtractValue(""+id);
	}

	private _propsList: {[id: string]: any} = {};

	private getProps (id: string) {
		const {key, todo, onChange, onRemove, ...oldProps} = this._propsList[id] || {} as any;
		if (!this._propsList[id]
			|| this._propsList[id].todo != this.props.todos.todos[id]
			|| !childPropsEquals(this.props.items.getChildProps(id), oldProps)
		) {
			this._propsList[id] = {
				key: `todo${id}`,
				todo: this.props.todos.todos[id],
				onChange: this.props.todos.onEditTodo,
				onRemove: this.onTodoRemove,
				...this.props.items.getChildProps(id)
			};
		}
		
		return this._propsList[id];
	}

	render () {
		const propsList = [];
		Object.keys(this.props.todos.todos).forEach( (id) => {
			propsList.push(this.getProps(id));
		});

		return (
			<div>
				<CreateTodo onCreate={this.props.todos.onAddTodo} />
				<OptimizedTodoFormList component={TodoListItem} componentProps={propsList} />
			</div>
		);
	}
}