import * as React from "react";
import * as Favorites from "../../controllers/favorites/types";
import * as TodoList from "../../controllers/todoList/types";

export interface IViewProps extends TodoList.IViewProps {
	favorites: Favorites.IViewProps;
}

export default function FavoritesList (props: IViewProps): JSX.Element {
	return (
		<div>
			<div>Favorites:</div>
			<div>
				{props.favorites.ids.map( id => 
					<div key={`todoFavorite_${id}`}>
						<div>{props.todos[parseInt(id)].title}</div>
						<div onClick={() => props.favorites.onRemoveItem(id)}>Remove from favorites</div>
					</div>
				)}
			</div>
		</div>
	);
}