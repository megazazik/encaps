import * as React from "react";
import controller from  "../../favorites/controller";
import getStateHolder, { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import { IAction, Reducer, setStateHolder } from "encaps-component-factory";
import FavoritesView from "../index";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReduxStateHolder from "encaps-component-factory-redux";
import todosController from "../../todoList/controller";
import { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";

interface IPageState {
	[key: string]: any
};

const TodosComponent = controller.getComponent(FavoritesView);

function reducer (state: IPageState = {}, action: IAction<any>): IPageState {
	return {
		[FAVORITES_STATE_ITEM_KEY]: controller.getReducer()(state[FAVORITES_STATE_ITEM_KEY], action),
		[TODOS_STATE_ITEM_KEY]: todosController.getReducer()(state[TODOS_STATE_ITEM_KEY], action)
	}
}

function View (props: {}): JSX.Element {
	return (
		<div>
			<div>
				{ getStateHolder(TodosComponent, null) } 
			</div>
		</div>
	);
}

const storeEnhancer = window['devToolsExtension'] ? window['devToolsExtension']() : value => value;
const store = createStore(reducer, storeEnhancer);

const TodoWithFavorites = (props: {}): JSX.Element => (
	<Provider store={store} >
		<View />
	</Provider>
);


setStateHolder(ReduxStateHolder);

export default TodoWithFavorites;