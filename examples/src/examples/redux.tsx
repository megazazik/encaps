import * as React from "react";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import * as ECF from "encaps-component-factory";
import connect from "encaps-component-factory-redux";

const storeEnhancer = window['devToolsExtension'] ? window['devToolsExtension']() : value => value;

const getComponentWithState = (reducer: ECF.Reducer<any>, Element: any) => {
	const store = createStore(reducer, storeEnhancer);
	const Holder = connect()(Element);
	
	return (props: any): JSX.Element => (
		<Provider store={store} >
			<Holder {...props} />
		</Provider>
	);
};

export function connectByKey (key: string) {
	return connect(
		(state, props) => (state[key]),
		(dispatch, props) => ECF.wrapDispatch(dispatch, key)
	);
}

export default getComponentWithState;