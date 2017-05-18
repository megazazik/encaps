export interface IProps {
	text: string;
}

export interface IState {
	num1: number;
	num2: number;
}

export interface IViewProps extends IState {
	headerText: string;
	onNum1Change: (num: number) => void;
	onNum2Change: (num: number) => void;
	result: number;
}