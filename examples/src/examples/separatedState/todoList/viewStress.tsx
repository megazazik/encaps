import * as React from "react";
import { IViewProps } from "./types";
import TodoForm, { IProps as ITodoFormProps } from "../todo/indexDiv";
import { ITodo } from "../todo/types";
import CreateTodo from "../createTodo";
import List from "../../optimizedList";

class OptimizedTodoFormList extends List<ITodoFormProps> {}

export default class View extends React.Component<IViewProps, {}> {
	private _propsList: {[id: string]: ITodoFormProps & {key: string}} = {};

	private getProps (id: string) {
		if (!this._propsList[id] || this._propsList[id].todo != this.props.todos[id]) {
			this._propsList[id] = {
				key: `todo${id}`,
				todo: this.props.todos[id],
				onChange: this.props.onEditTodo
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
				<OptimizedTodoFormList component={TodoForm} componentProps={propsList} />
			</div>
		);
	}
}