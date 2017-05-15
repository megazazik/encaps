import * as React from "react";
import { IViewProps } from "../todoListItem/types";
import TodoForm from "../todo";
import Favorite from "../todoListItemFavorite";
import styles = require("./styles.less");

export default class TodoListItemFavoriteView extends React.PureComponent<IViewProps, {}> {
	render () {
		return (
			<div className={styles["container"]} >
				<div onClick={this.props.onExpand} >{this.props.todo.id} - {this.props.todo.title}</div>
				{this.props.expanded && (
					<div>
						<TodoForm todo={this.props.todo} onChange={this.props.onChange} />
						<div onClick={ () => this.props.onRemove(this.props.todo.id) }>Remove</div>
						<Favorite id={""+this.props.todo.id} />
					</div>
				)}
			</div>
		);
	}
}