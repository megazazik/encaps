import * as React from "react";
import TodoListItem from "../todoListItem";
import { IViewProps as IItemViewProps } from "../todoListItem/types";
import CreateTodo from "../createTodo";
import { IViewProps } from "./types";
import { ITodo } from "../../controllers/todo/types";
import List from "../../../optimizedList";
import { childPropsEquals } from "encaps-react";

class OptimizedTodoFormList extends List<any> {}

export default class LazyTodoListView extends React.PureComponent<IViewProps, {}> {
	private getProps =  (id: string) => ({
		key: `todo${id}`,
		todo: this.props.todos[id],
		onChange: this.props.onEditTodo,
		onRemove: this.props.onRemoveTodo,
		...this.props.getListItem(+id)
	});

	render () {
		return (
			<div>
				<CreateTodo onCreate={this.props.onAddTodo} />
				<OptimizedTodoFormList
					component={TodoListItem}
					componentProps={Object.keys(this.props.todos).map(this.getProps)}
				/>    
			</div>
		);
	}
}