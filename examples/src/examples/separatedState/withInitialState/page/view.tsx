import * as React from "react";
import todosController from "../../todoList/controller";
import getTodosStateHolder, { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";
import favoritesController from  "../../favorites/controller";
import getFavoritesStateHolder, { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import FavoritesView from "../../favoritesTodos";
import CompositeTodosView, { COMPONENT_STATE } from "../lazyTodoList/stateHolder";


const TodosComponent = todosController.getComponent(CompositeTodosView);
const FavoritesComponent = favoritesController.getComponent(FavoritesView);

export default function View (props: {}): JSX.Element {
	return (
		<div>
			<div>
				{ getFavoritesStateHolder(FavoritesComponent, null) } 
			</div>
			<div>
				{ getTodosStateHolder(TodosComponent, null) } 
			</div>
		</div>
	);
}
