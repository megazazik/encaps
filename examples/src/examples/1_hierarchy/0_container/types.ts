export interface IProps {
	text: string;
}

export interface IState {
	num1: number;
	num2: number;
}

export interface IPublicProps extends IState {
	headerText: string;
	result: number;
}

export interface IPublicActions {
	num1Change: (num: number) => void;
	num2Change: (num: number) => void;
}

export interface IViewProps extends IPublicProps {
	actions: IPublicActions
}