import * as React from "react";
import getTodoHolder, { TODOS_STATE_ITEM_KEY } from "./todosStateHolder";
import TodosElement from "../compositeTodoList";
import FavoritesWithTodos from "../todosToFavoritesProvider";

export default function View (props: {}): JSX.Element {
	return (
		<div>
			{ getTodoHolder(FavoritesWithTodos, null) } 
			{ getTodoHolder(TodosElement, null) } 
		</div>
	);
}