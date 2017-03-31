import * as React from "react";
import { IViewProps } from "./types";
import { ITodo } from "../todo/types";

export default function View (props: IViewProps): JSX.Element {
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