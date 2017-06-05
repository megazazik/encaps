import * as ECF from "encaps-component-factory";
import { ITodo, Status } from "../controllers/todo/types";
import { IState as ITodoListState, IViewProps as ITodoListViewProps } from "../controllers/todoList/types";
import todosController, { ACTION_REMOVE_TODO } from "../controllers/todoList";
import { IState as IFavoritesState, IViewProps as IFavoritesViewProps } from "../controllers/favorites/types";
import favoritesController, { removeItem } from "../controllers/favorites";
import todoListViewController from "../components/todoList/controller";

export const TODOS = 'todos';
export const FAVORITES = 'favorites';
export const UI_COMPONENTS = 'ui';

export interface IState {
	todos: ITodoListState;
	favorites: IFavoritesState;
}

export type IViewProps = ECF.ViewProps<{}, IState> & {
	todos: ITodoListViewProps;
	favorites: IFavoritesViewProps;
};

const builder = ECF.createBuilder<{}, IState, IViewProps>();

const todosWrapDispatch = (origin: ECF.Dispatch, child: ECF.Dispatch): ECF.Dispatch => (action) => {
	if (action.type === ACTION_REMOVE_TODO) {
		ECF.wrapDispatch(origin, FAVORITES)(removeItem(""+action.payload));
	}
	child(action);
};

export const todosDispatch = builder.addBuilder(TODOS, todosController, todosWrapDispatch);

export const favoritesDispatch = builder.addBuilder(FAVORITES, favoritesController);
builder.addChildBuilder(UI_COMPONENTS, todoListViewController);

export default builder.getController();