import * as React from "react";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import * as ECF from "encaps-component-factory";
import ReduxStateHolder from "encaps-component-factory-redux";

const storeEnhancer = window['devToolsExtension'] ? window['devToolsExtension']() : value => value;

const getComponentWithState = (reducer: ECF.Reducer<any>, key: string, Element: any) => {
	const store = createStore(reducer, storeEnhancer);
	
	return (props: any): JSX.Element => (
		<Provider store={store} >
			<ReduxStateHolder code={key} Element={Element} elementProps={props} />
		</Provider>
	);
};

ECF.setStateHolder(ReduxStateHolder);

export default getComponentWithState;