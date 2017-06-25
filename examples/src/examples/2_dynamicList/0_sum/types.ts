import { IActionCreator } from "encaps-component-factory/types";

export interface IState {
	numbers: number[];
}

export interface INumberChange {
	value: number;
	index: number;
}

export interface IPublicState extends IState {
	result: number;
}

export interface IPublicActions {
	numChange: IActionCreator<INumberChange>;
	addField: IActionCreator<{}>;
	subtractField: IActionCreator<{}>;
}

export interface IProps {
	text: string;
}

export interface IViewProps extends IPublicState {
	headerText: string;
	onNumberChange: (value: number, index: number) => void;
	onAddField: () => void;
	onSubtractField: () => void;
}