import { IActionCreator } from "encaps";

export interface IState {
	numbers: number[];
}

export interface INumberChange {
	value: number;
	index: number;
}

export interface IProps {
	text: string;
}

export interface IViewProps extends IState {
	headerText: string;
	onNumberChange: (value: number, index: number) => void;
	onAddField: () => void;
	onSubtractField: () => void;
	result: number;
}