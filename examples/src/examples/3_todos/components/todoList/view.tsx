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
	private _propsList: {[id: string]: any} = {};

	private getProps (id: string) {
		const {key, todo, onChange, onRemove, ...oldProps} = this._propsList[id] || {} as any;
		if (!this._propsList[id]
			|| this._propsList[id].todo != this.props.todos[id]
			|| !childPropsEquals(this.props.getListItem(+id), oldProps)
		) {
			this._propsList[id] = {
				key: `todo${id}`,
				todo: this.props.todos[id],
				onChange: this.props.onEditTodo,
				onRemove: this.props.onRemoveTodo,
				...this.props.getListItem(+id)
			};
		}
		
		return this._propsList[id];
	}

	render () {
		const propsList = [];
		Object.keys(this.props.todos).forEach( (id) => {
			propsList.push(this.getProps(id));
		});

		return (
			<div>
				<CreateTodo onCreate={this.props.onAddTodo} />
				<OptimizedTodoFormList component={TodoListItem} componentProps={propsList} />
			</div>
		);
	}
}