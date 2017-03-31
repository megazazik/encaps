import * as Favorites from "../favorites/types";
import { IChildProps } from "encaps-component-factory";
import * as TodoList from "../todoList/types";

export const FAVORITES_KEY = "favorites";
export const TODOS_KEY = "todos";

export interface IProps extends TodoList.IProps {
	favorites: Favorites.IViewProps;
}

export interface IState {}

export interface IViewProps extends TodoList.IViewProps {
	favorites: Favorites.IViewProps;
}