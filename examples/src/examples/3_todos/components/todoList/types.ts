import * as ItemTypes from "../todoListItem/types";
import { IState as IListState  } from "../../../lazyKeyList/controller";
import { IViewProps as IProps, IState as ITodosState } from "../../controllers/todoList/types";
import { IParentProps, IChildProps } from "encaps-component-factory/types";

export const TODOS_KEY = "todos";
export const LIST_ITEMS_KEY = "items";

export { IProps };

export interface IState {
	items: IListState<ITodosState>
}

export interface IViewProps extends IProps, IParentProps {
	getListItem: (index: number) => IChildProps<ItemTypes.IState>
}


