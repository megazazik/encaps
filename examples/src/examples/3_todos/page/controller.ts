import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction, ViewProps, Dispatch } from "encaps-component-factory/types";
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

const todosWrapDispatch = (origin: Dispatch, child: Dispatch): Dispatch => (action) => {
	if (action.type === Todos.ACTION_REMOVE_TODO) {
		wrapDispatch(origin, FAVORITES)(favoritesController.getActions().removeItem(""+action.payload));
	}
	child(action);
};

const builder = createBuilder()
	.addChild(TODOS, todosController, todosWrapDispatch)
	.addChild(FAVORITES, favoritesController)
	.addChild(UI_COMPONENTS, todoListViewController);

export const controller = builder.getController()

export default controller;

export const stateToProps = (state: IState) => state;
export const dispatchToProps = (dispatch: Dispatch) => dispatch;
export const mergeProps = (state: IState, dispatch: Dispatch, props) => ({
	...props,
	todos: {
		...Todos.stateToProps(state.todos),
		...Todos.dispatchToProps(controller.getWrapDispatch(TODOS)(dispatch))
	},
	favorites: {
		...Favorites.stateToProps(state.favorites),
		...Favorites.dispatchToProps(controller.getWrapDispatch(FAVORITES)(dispatch))
	}
});

export const connect = createComponent(
	controller,
	stateToProps,
	dispatchToProps,
	mergeProps
);