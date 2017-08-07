import * as React from "react";
import { IViewProps } from "../todoListItem/types";
import TodoForm from "../todo";
import TodoReadOnly from "../todo/readOnly";
import styles = require("./styles.less");
import FavoriteConnected from '../inFavoritesConnected';

export default class TodoListItemFavoriteView extends React.PureComponent<IViewProps, {}> {
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
						<TodoReadOnly todo={this.props.todo} />
					)}
					<div onClick={ () => this.props.onRemove(this.props.todo.id) }>Remove</div>
					 <FavoriteConnected id={""+this.props.todo.id} />  
				</div>
			</div>
		);
	}
}