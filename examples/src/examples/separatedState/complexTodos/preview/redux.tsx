import * as React from "react";
import * as ECF from "encaps-component-factory";
import ReduxStateHolder from "encaps-component-factory-redux";
import controller from  "../controller";
import todosController from "../../todoList/controller";
import getTodosStateHolder, { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";
import { ITodo } from "../../todo/types";
import favoritesController from  "../../favorites/controller";
import getFavoritesStateHolder, { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import FavoritesView from "../../favoritesTodos";
import CompositeTodosView, { COMPONENT_STATE } from "../stateHolder";
import withStore from "../../../redux";

interface IPageState {
	[key: string]: any
};

const pageController = ECF.createBuilder<{}, IPageState, {}>();
pageController.addBuilder(COMPONENT_STATE, controller);
pageController.addBuilder(TODOS_STATE_ITEM_KEY, todosController);
pageController.addBuilder(FAVORITES_STATE_ITEM_KEY, favoritesController);

const TodosComponent = todosController.getComponent(CompositeTodosView);
const FavoritesComponent = favoritesController.getComponent(FavoritesView);

const eventHandlers1 = {
	onAddTodo: (todo: ITodo): void => { console.log("Handler1"); console.log(todo) },
	onRemoveTodo: (id: number): void => { console.log("Handler1"); console.log(id) },
	onEditTodo:  (todo: ITodo): void => { console.log("Handler1"); console.log(todo) }
};

function View (props: {}): JSX.Element {
	return (
		<div>
			<div>
				{ getFavoritesStateHolder(FavoritesComponent, {}) }
			</div>
			<div>
				{ getTodosStateHolder(TodosComponent, null, eventHandlers1) } 
			</div>
		</div>
	);
}

const TodoWithSeparatedState = withStore(pageController.getController().getReducer(), null, pageController.getController().getComponent(View));

ECF.setStateHolder(ReduxStateHolder);

export default TodoWithSeparatedState;