import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction, ViewProps, Dispatch } from "encaps-component-factory/types";
import { ITodo, Status } from "../controllers/todo/types";
import { IState as ITodoListState, IViewProps as ITodoListViewProps } from "../controllers/todoList/types";
import todosController, { ACTION_REMOVE_TODO } from "../controllers/todoList";
import { IState as IFavoritesState, IViewProps as IFavoritesViewProps } from "../controllers/favorites/types";
import favoritesController from "../controllers/favorites";
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
	if (action.type === ACTION_REMOVE_TODO) {
		wrapDispatch(origin, FAVORITES)(favoritesController.getActions().removeItem(""+action.payload));
	}
	child(action);
};

const builder = createBuilder()
	.addChild(TODOS, todosController, todosWrapDispatch)
	.addChild(FAVORITES, favoritesController)
	.addChild(UI_COMPONENTS, todoListViewController);

export const stateToProps = (state: IState, props: {}) => ({});

export default builder.getController();