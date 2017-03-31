import todosBuilder from "../compositeTodoList/controller";
import favoritesBuilder from "../todoFavorites/controller";
import { FAVORITES_STATE_ITEM_KEY } from "./favoritesStateHolder";
import { TODOS_STATE_ITEM_KEY } from "./todosStateHolder";
import { IAction } from "../../../action";

interface IPageState {
	[key: string]: any
};

export default function pageReducer (state: IPageState = {}, action: IAction<any>): IPageState {
	return {
		[FAVORITES_STATE_ITEM_KEY]: favoritesBuilder.getReducer()(state[FAVORITES_STATE_ITEM_KEY], action),
		[TODOS_STATE_ITEM_KEY]: todosBuilder.getReducer()(state[TODOS_STATE_ITEM_KEY], action)
	}
}