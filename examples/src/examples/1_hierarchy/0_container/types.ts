export interface IProps {
	text: string;
}

export interface IState {
	num1: number;
	num2: number;
}

export interface IPublicState extends IState {
	result: number;
}

export interface IPublicActions {
	num1Change: (num: number) => void;
	num2Change: (num: number) => void;
}

export interface IViewProps extends IPublicState {
	headerText: string;
	onNum1Change: (num: number) => void;
	onNum2Change: (num: number) => void;
}