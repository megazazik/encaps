import * as React from "react";
import getTodoStateHolder from "../todoList/stateHolder";
import controller from "../todoList/controller";
import { IViewProps as IFavoritesViewProps } from "../favorites/types";
import TodosList from "./view";

const TodosListComponent = controller.getComponent(TodosList, (props: {favorites: IFavoritesViewProps}) => ({favorites: props.favorites}));

export default function View (props: IFavoritesViewProps): JSX.Element {
	return getTodoStateHolder(
		TodosListComponent, 
		{favorites: props},
		{
			onRemoveTodo: (id: number) => props.onRemoveItem(""+id)
		}
	);
}