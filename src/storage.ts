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
		this.dispatcher.notifyAll(this.props.store.state);
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
	extractState?: (fullState: any, props: any) => any;
	extractDispatch?: (dispatch: any, props: any) => any;
	Element: React.StatelessComponent<any> | React.ComponentClass<any>;
	elementProps: any;
}

export const getCreateStore = (): (reducer: Reducer<any>) => IStore => {
	return createStore;
}

export const getProvider = (): React.ComponentClass<IProps> => {
	return Provider;
}

class ReactConnectedStateHolder extends React.PureComponent<IStateHolderProps, {}> {
	static defaultProps = {
		extractState: (state) => state,
		extractDispatch: (dispatch) => dispatch
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
		if (this.currentState != this.getState(state)) {
			this.forceUpdate();
		}
	};

	private getState (state: any): any {
		return this.props.extractState(state, this.props.elementProps);
	}

	private getDispatch (): (action: IAction<any>) => void {
		return this.props.extractDispatch(this.context.dispatch, this.props.elementProps);
	}

	render (): JSX.Element {
		this.currentState = this.getState(this.context.state);
		const stateProps: IChildProps<any> = {
			doNotAccessThisInnerState: this.currentState,
			doNotAccessThisInnerDispatch: this.getDispatch()
		}
		
		return React.createElement(this.props.Element as any, {...stateProps, ...this.props.elementProps});
	}
}

export type Connect = {
	(
		stateToComponentState?: (state: any, props: any) => any, 
		dispatchToComponentDispatch?: (dispatch: (action: IAction<any>) => void, props: any) => any
	): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>
};

let currentConnect: Connect = connect;

export function getConnect(): Connect {
	return currentConnect;
}

export function setConect(connect: Connect): void {
	currentConnect = connect;
}

export function connect (
	stateToComponentState?: (state: any, props: any) => any, 
	dispatchToComponentDispatch?: (dispatch: (action: IAction<any>) => void, props: any) => any
): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any> {
	const createComponent = (Component: React.StatelessComponent<any> | React.ComponentClass<any>) => {
		return (props: any): JSX.Element => {
			return React.createElement(
				ReactConnectedStateHolder, 
				{
					extractState: stateToComponentState,
					extractDispatch: dispatchToComponentDispatch,
					Element: Component,
					elementProps: props
				}
			);
		};
	}
	return createComponent;
}