import * as React from "react";
import { IViewProps } from "../todoListItem/types";
import TodoForm from "../todo";
import TodoFormReadOnly from "../todo/readOnly";
import Favorite from "../todoListItemFavorite";
import styles = require("./styles.less");

export default class TodoListItemFavoriteView extends React.PureComponent<IViewProps, {}> {
	// shouldComponentUpdate (nextProps: IViewProps): boolean {
	// 	return nextProps.todo != this.props.todo || nextProps.expanded != this.props.expanded;
	// }

	private count = 0;

	render () {
		this.count++;
		return (
			<div className={styles["container"]} >
				<div onClick={this.props.onExpand} >{this.props.todo.id}_{this.count} - {this.props.expanded ? "Read" : "Edit"}</div>
				<div>
					{this.props.expanded ? (
						<TodoForm todo={this.props.todo} onChange={this.props.onChange} />
					) : (
						<TodoFormReadOnly todo={this.props.todo} />
					)}
					<div onClick={ () => this.props.onRemove(this.props.todo.id) }>Remove</div>
					<Favorite id={""+this.props.todo.id} />
				</div>
			</div>
		);
	}
}