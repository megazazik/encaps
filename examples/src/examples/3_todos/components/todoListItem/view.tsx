import * as React from "react";
import { IViewProps } from "../todoListItem/types";
import TodoForm from "../todo";
import TodoReadOnly from "../todo/readOnly";
import Favorite from '../inFavorite';
import styles = require("./styles.less");
import favoritesConnect from "../../page/connect/favorites";
import { IViewProps as IFavoritesIViewProps } from "../../controllers/favorites/types";

interface IFavoritesContainerProps {
	id: string
}

interface IFavoritesProps extends IFavoritesIViewProps, IFavoritesContainerProps {
	inFavorites: boolean;
}

const FavoriteComponent = favoritesConnect<IFavoritesContainerProps, IFavoritesProps>(
	(componentProps, props) => ({
		...componentProps,
		...props,
		inFavorites: componentProps.ids.indexOf(props.id) >= 0
	})
)((props: IFavoritesProps) => (
	<Favorite
		inFavorites={props.inFavorites}
		onRemoveItem={() => props.onRemoveItem(props.id)}
		onAddItem={() => props.onAddItem(props.id)}
	/>
));

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
					<FavoriteComponent id={""+this.props.todo.id} />
				</div>
			</div>
		);
	}
}