import * as React from "react";
import { IViewProps } from "../compositeTodoList/types";
import { ITodo } from "../todo/types";
import getFavoritesHolder from "../todosWithFavorites/favoritesStateHolder"
import TodoFavorites from "../todoFavorites";

export default function View (props: IViewProps): JSX.Element {
	return getFavoritesHolder(TodoFavorites, { todos: props.todos.todos });
}