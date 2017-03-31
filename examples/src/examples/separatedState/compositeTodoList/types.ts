import * as ListTypes from "../todoList/types";
import * as ItemTypes from "../todoListItem/types";

export const TODOS_KEY = "todos";
export const LIST_ITEMS_KEY = "items";

import  { IViewProps as IListViewProps } from "../../listWithKeys/controller";
export interface IViewProps {
	items: IListViewProps;
	todos: Partial<ListTypes.IViewProps>;
}

export { IProps } from "../todoList/types";
