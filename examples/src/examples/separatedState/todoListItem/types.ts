import { ITodo } from "../todo/types";

export interface IProps {
	todo: ITodo;
	onChange: (todo: ITodo) => void;
	onRemove: (id: number) => void;
}

export interface IState {
	expanded: boolean;
}

export interface IViewProps extends IState, IProps {
	onExpand: () => void;
}