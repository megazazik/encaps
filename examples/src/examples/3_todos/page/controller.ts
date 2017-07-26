import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction, ViewProps, Dispatch } from "encaps-component-factory/types";
import { getProps } from "encaps-component-factory/getProps";
import { ITodo, Status } from "../controllers/todo/types";
import { IState as ITodoListState, IViewProps as ITodoListViewProps } from "../controllers/todoList/types";
import todosController, * as Todos from "../controllers/todoList";
import { IState as IFavoritesState, IViewProps as IFavoritesViewProps } from "../controllers/favorites/types";
import favoritesController, * as Favorites from "../controllers/favorites";
import todoListViewController from "../components/todoList/controller";

export const TODOS = 'todos';
export const FAVORITES = 'favorites';
export const UI_COMPONENTS = 'ui';

export interface IState {
	todos: ITodoListState;
	favorites: IFavoritesState;
}

export type IViewProps = ViewProps<{}, IState> & {
	todos: ITodoListViewProps;
	favorites: IFavoritesViewProps;
};

const todosWrapDispatch = (dispatch: Dispatch): Dispatch => (action) => {
	if (action.type === Todos.ACTION_REMOVE_TODO) {
		wrapDispatch(FAVORITES, dispatch)(favoritesController.getActions().removeItem(""+action.payload));
	}
	wrapDispatch(TODOS, dispatch)(action);
};

const builder = createBuilder()
	.addChild(TODOS, todosController)
	.addChild(FAVORITES, favoritesController)
	.addChild(UI_COMPONENTS, todoListViewController);

export const controller = builder.getController()

export default controller;

export const stateToProps = (state: IState) => state;
export const dispatchToProps = (dispatch: Dispatch) => dispatch;
export const mergeProps = (state: IState, dispatch: Dispatch, props) => ({
	...props,
	todos: getProps(Todos.connectParams, state.todos, todosWrapDispatch(dispatch), props),
	favorites: getProps(Favorites.connectParams, state.favorites, wrapDispatch(FAVORITES, dispatch), props)
});

export const connect = createComponent(
	controller,
	stateToProps,
	dispatchToProps,
	mergeProps
);