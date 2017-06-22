export interface IProps {
	num: number; 
	onChange: (num: number) => void;
}

export interface IState {
	active: boolean;
}

export interface IActions {
	activate: (value: boolean) => void;
}

export interface IViewProps extends IState, IProps {
	onStateChange: (active: boolean) => void;
}