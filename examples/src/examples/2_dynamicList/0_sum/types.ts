export interface IState {
	numbers: number[];
}

export interface IPublicState extends IState {
	result: number;
}

export interface IPublicActions {
	numChange: (data: {value: number, index: number}) => void;
	addField: () => void;
	subtractField: () => void;
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