import { IActionCreator } from "encaps/types";

export interface IProps {
	num: number; 
	onChange: (num: number) => void;
}

export interface IState {
	active: boolean;
}

export interface IActions {
	activate: IActionCreator<boolean>;
}

export interface IViewProps extends IState, IProps {
	onStateChange: (active: boolean) => void;
}