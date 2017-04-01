import * as React from "react";
import controller from  "../controller";
import getStateHolder, { TODOS_STATE_ITEM_KEY } from "../stateHolder";
import * as ECF from "encaps-component-factory";
import TodosView from "../view";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReduxStateHolder from "encaps-component-factory-redux";
import { ITodo } from "../../todo/types";

interface IPageState {
	[key: string]: any
};

const TodosComponent = controller.getComponent(TodosView);

function reducer (state: IPageState = {}, action: ECF.IAction<any>): IPageState {
	return {
		[TODOS_STATE_ITEM_KEY]: controller.getReducer()(state[TODOS_STATE_ITEM_KEY], ECF.unwrapAction(action).action)
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
				{ getStateHolder(TodosComponent, null, eventHandlers1) } 
			</div>
			<div>
				{ getStateHolder(TodosComponent, null, eventHandlers2) } 
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


ECF.setStateHolder(ReduxStateHolder);

export default TodoWithFavorites;