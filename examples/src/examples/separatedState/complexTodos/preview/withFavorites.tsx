import * as React from "react";
import { IAction, setStateHolder, getStateHolder } from "encaps-component-factory";
import controller from  "../controller";
import todosController from "../../todoList/controller";
import getTodosStateHolder, { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";
import TodosView from "../index";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReduxStateHolder from "encaps-component-factory-redux";
import { ITodo } from "../../todo/types";
import { IViewProps as ITodosViewProps } from "../../todoList/types";
import favoritesController from  "../../favorites/controller";
import getFavoritesStateHolder, { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import FavoritesView from "../../favoritesTodos";

interface IPageState {
	[key: string]: any
};

const COMPONENT_STATE = "component";
const StateHolder = getStateHolder();

const CompositeTodosView = (props: ITodosViewProps) => {
	return <StateHolder 
		code={COMPONENT_STATE}
		Element={TodosView}
		elementProps={{todos: props}} 
	/>;
}

const TodosComponent = todosController.getComponent(CompositeTodosView);
const FavoritesComponent = favoritesController.getComponent(FavoritesView);

function reducer (state: IPageState = {}, action: IAction<any>): IPageState {
	return {
		[TODOS_STATE_ITEM_KEY]: todosController.getReducer()(state[TODOS_STATE_ITEM_KEY], action),
		[COMPONENT_STATE]: controller.getReducer()(state[COMPONENT_STATE], action),
		[FAVORITES_STATE_ITEM_KEY]: favoritesController.getReducer()(state[FAVORITES_STATE_ITEM_KEY], action)
	}
}

const eventHandlers1 = {
	onAddTodo: (todo: ITodo): void => { console.log("Handler1"); console.log(todo) },
	onRemoveTodo: (id: number): void => { console.log("Handler1"); console.log(id) },
	onEditTodo:  (todo: ITodo): void => { console.log("Handler1"); console.log(todo) }
};

const eventHandlers2 = {
	onAddTodo: (todo: ITodo): void => { console.log("Handler2"); console.log(todo) },
	onRemoveTodo: (id: number): void => { console.log("Handler2"); console.log(id) },
	onEditTodo:  (todo: ITodo): void => { console.log("Handler2"); console.log(todo) }
};

function View (props: {}): JSX.Element {
	return (
		<div>
			<div>
				{ getFavoritesStateHolder(FavoritesComponent, null) } 
			</div>
			<div>
				{ getTodosStateHolder(TodosComponent, null, eventHandlers1) } 
			</div>
			<div>
				{ getTodosStateHolder(TodosComponent, null, eventHandlers2) } 
			</div>
		</div>
	);
}

const storeEnhancer = window['devToolsExtension'] ? window['devToolsExtension']() : value => value;
const store = createStore(reducer, storeEnhancer);

const TodoWithSeparatedState = (props: {}): JSX.Element => (
	<Provider store={store} >
		<View />
	</Provider>
);


setStateHolder(ReduxStateHolder);

export default TodoWithSeparatedState;