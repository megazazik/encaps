import * as React from "react";
import * as PropTypes from "prop-types";
import { IAction, Reducer, IChildProps } from "./types";
import { wrapDispatch } from "./builder";
import Dispatcher from "./events";

const contextType = {
	state: PropTypes.any,
	dispatch: PropTypes.func,
	subscribe: PropTypes.func,
	unsubscribe: PropTypes.func
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
	private dispatcher = new Dispatcher();

	constructor (props: IProps) {
		super(props);
		this.state = props.store.state;
	}

	static childContextTypes = contextType;

	private dispatch = (action: IAction<any>): void => {
		this.props.store.dispatch(action);
		this.setState(this.props.store.state);
		this.dispatcher.notifyAll(null);
	};

	private subscribe = (handler: (state: any) => void): void => {
		this.dispatcher.add(handler);
	};

	private unsubscribe = (handler: (state: any) => void): void => {
		this.dispatcher.remove(handler);
	};

	getChildContext() {
		return {
			state: this.props.store.state,
			dispatch: this.dispatch,
			subscribe: this.subscribe,
			unsubscribe: this.unsubscribe,
		};
	};

	render (): JSX.Element {
		return React.createElement("div", {}, this.props.children);  
	}
}

export interface IStateHolderProps {
	code?: string;
	extractState?: (fullState: any) => any;
	Element: React.StatelessComponent<any> | React.ComponentClass<any>;
	elementProps: any;
}

class ReactStateHolder extends React.PureComponent<IStateHolderProps, {}> {
	defaultProps = {
		extractState: (state) => state
	}

	static contextTypes = contextType;
	private currentState: any;

	componentDidMount () {
		// TODO проверить, нельзя ли оптимизировать производительность
		this.context.subscribe(this.onStateChange);
	}

	componentWillUnmount () {
		this.context.unsubscribe(this.onStateChange);
	}

	private onStateChange = (state: any) => {
		if (this.currentState != this.getState()) {
			this.forceUpdate();
		}
	};

	private getState (): any {
		return this.props.extractState(this.props.code ? this.context.state[this.props.code] : this.context.state);
	}

	render (): JSX.Element {
		this.currentState = this.getState();
		const stateProps: IChildProps<any> = {
			doNotAccessThisInnerState: this.currentState,
			doNotAccessThisInnerDispatch: (action: IAction<any>): void => this.props.code ? wrapDispatch(this.context.dispatch, this.props.code)(action) : this.context.dispatch(action)
		}
		
		return React.createElement(this.props.Element as any, {...stateProps, ...this.props.elementProps});
	}
}

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