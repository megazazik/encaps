import { ITodo } from "../../controllers/todo/types";
import { IParentProps } from "encaps-react";

export interface IProps {
	todo: ITodo;
	onChange: (todo: ITodo) => void;
	onRemove: (id: number) => void;
}

export interface IState {
	expanded: boolean;
}

export interface IViewProps extends IState, IProps, IParentProps {
	onExpand: () => void;
}