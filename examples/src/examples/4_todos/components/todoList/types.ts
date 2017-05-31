import * as ItemTypes from "../todoListItem/types";
import { IViewProps as IListViewProps } from "../../../lazyKeyList/controller";
import { IViewProps as ITodosViewProps } from "../../controllers/todoList/types";

export const TODOS_KEY = "todos";
export const LIST_ITEMS_KEY = "items";

export interface IProps {
	todos: ITodosViewProps;
}

export interface IViewProps extends IProps {
	items?: IListViewProps<ItemTypes.IState>;
}

