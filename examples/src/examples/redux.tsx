import * as React from "react";
import { Provider, connect as connectRedux } from 'react-redux';
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

export function connectByKey (
	key: string,
	mapState = (state, props) => state,
	mapDispatch = (dispatch, props) => dispatch
) {
	return connect(
		(state, props) => mapState((state[key]), props),
		(dispatch, props) => mapDispatch(ECF.wrapDispatch(dispatch, key), props)
	);
}

export function connectReduxByKey (
	key: string,
	mapState = (state, props) => state,
	mapDispatch = (dispatch, props) => dispatch
) {
	return connectRedux(
		(state, props) => mapState((state[key]), props),
		(dispatch, props) => mapDispatch(ECF.wrapDispatch(dispatch, key), props)
	);
}

export default getComponentWithState;