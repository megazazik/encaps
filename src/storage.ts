import * as React from "react";
import { IAction, Reducer, IChildProps } from "./types";
import { wrapDispatch } from "./builder";

const contextType = {
	state: React.PropTypes.any,
	dispatch: React.PropTypes.func
}

export interface IStore {
	state: any;
	dispatch: (action: IAction<any>) => void;
}

class Store implements IStore {
	public state;
	constructor (private reducer: Reducer<any>) {
		this.state = reducer(undefined, undefined);
	}

	dispatch (action: IAction<any>): void {
		this.state = this.reducer(this.state, action);
	}
}

export function createStore(reducer: Reducer<any>): IStore {
	return new Store(reducer);
}

export interface IProps {
	store: IStore;
}

export interface IState {
	state: any;
}

export class Provider extends React.Component<IProps, IState> {
	constructor (props: IProps) {
		super(props);
		this.state = props.store.state;
	}

	static childContextTypes = contextType;

	private dispatch = (action: IAction<any>): void => {
		this.props.store.dispatch(action);
		this.setState(this.props.store.state)
	};

	getChildContext() {
		return {
			state: this.props.store.state,
			dispatch: this.dispatch
		};
	};

	render (): JSX.Element {
		return React.createElement("div", {}, this.props.children);  
	}
}

export interface IStateHolderProps {
	code?: string;
	Element: React.StatelessComponent<any> | React.ComponentClass<any>;
	elementProps: any;
}

const ReactStateHolder: React.StatelessComponent<IStateHolderProps> = (props: IStateHolderProps, context: any): JSX.Element => {
	
	const stateProps: IChildProps = {
		doNotAccessThisInnerState: props.code ? context.state[props.code] : context.state,
		dispatch: (action: IAction<any>): void => props.code ? wrapDispatch(context.dispatch, props.code)(action) : context.dispatch(action)
	}
	
	return React.createElement(props.Element as any, {...stateProps, ...props.elementProps});
}

ReactStateHolder.contextTypes = contextType;

export const getCreateStore = (): (reducer: Reducer<any>) => IStore => {
	return createStore;
}

export const getProvider = (): React.ComponentClass<IProps> => {
	return Provider;
}

let StateHolder: React.StatelessComponent<IStateHolderProps> | React.ComponentClass<IStateHolderProps> = ReactStateHolder;

const GlobalStateHolder = (props: IStateHolderProps): JSX.Element => {
	return React.createElement(StateHolder as any, props);
}
export const getStateHolder = () => {
	return GlobalStateHolder;
}

export const setStateHolder = (holder: React.StatelessComponent<IStateHolderProps> | React.ComponentClass<IStateHolderProps>): void => {
	StateHolder = holder;
}