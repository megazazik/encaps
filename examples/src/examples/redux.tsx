import * as React from "react";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import * as ECF from "encaps";
import connect from "encaps-redux";

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

export default getComponentWithState;