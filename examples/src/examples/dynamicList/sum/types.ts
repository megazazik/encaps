export interface IProps {
	text: string;
}

export interface IState {
	numbers: number[];
}

export interface IViewProps extends IState {
	headerText: string;
	onNumberChange: (value: number, index: number) => void;
	onAddField: () => void;
	onSubtractField: () => void;
	result: number;
}