import * as Favorites from "../favorites/types";
import { IChildProps } from "encaps-component-factory";
import { ITodo } from "../todo/types";

export const FAVORITES_KEY = "favorites";

export interface IProps {
	todos: {[id: number]: ITodo}
}

export interface IState {}

export interface IViewProps extends IProps {
	favorites?: Favorites.IViewProps
}