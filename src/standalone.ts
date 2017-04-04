import * as React from "react";
import { IAction, Reducer, IChildProps } from "./types";

export function getStandalone<P, S> (
	reducer: Reducer<S>, 
	Element: React.StatelessComponent<P & IChildProps> | React.ComponentClass<P & IChildProps>
): React.ComponentClass<P> | React.StatelessComponent<P> {

	class StandaloneStorage extends React.Component<P, S> {
		constructor (props: P) {
			super(props);

			this.state = reducer(undefined, undefined);
		}

		private _dispatch = (action: IAction<any>): void => {
			this.setState(reducer(this.state, action));
		}

		render () {
			const stateProps: IChildProps = {
				doNotAccessThisInnerState: this.state,
				doNotAccessThisInnerDispatch: this._dispatch
			};

			return React.createElement(Element as any, {...this.props as any,...stateProps}) ;
		}
	}

	return StandaloneStorage;
}