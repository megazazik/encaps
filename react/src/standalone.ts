import * as React from "react";
import { IChildProps } from "./types";
import { IAction, Reducer, } from 'encaps';
import { createChildProps } from './react';

export function getStandalone<P, S> (
	reducer: Reducer<S>, 
	Element: React.StatelessComponent<P & IChildProps<S>> | React.ComponentClass<P & IChildProps<S>>
): React.ComponentClass<P> | React.StatelessComponent<P> {

	class StandaloneStorage extends React.Component<P, S> {
		private _innerState: any = null;
		constructor (props: P) {
			super(props);

			this._innerState = reducer(undefined, undefined)
			this.state = this._innerState;
		}

		private _dispatch = (action: IAction<any>): void => {
			this._innerState = reducer(this._innerState, action);
			this.setState(this._innerState);
		}

		render () {
			const stateProps: IChildProps<S> = createChildProps(
				this.state,
				this._dispatch
			)

			return React.createElement(Element as any, {...this.props as any, ...stateProps}) ;
		}
	}

	return StandaloneStorage;
}