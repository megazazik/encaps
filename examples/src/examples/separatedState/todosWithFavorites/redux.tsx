import * as React from "react";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Reducer } from "../../../action";
import ReduxStateHolder from "../../../redux";
import { setStateHolder } from "../../../storage";
import reducer from "./reducer";
import View from "./view";

const storeEnhancer = window['devToolsExtension'] ? window['devToolsExtension']() : value => value;
const store = createStore(reducer, storeEnhancer);

const TodoWithFavorites = (props: {}): JSX.Element => (
	<Provider store={store} >
		<View />
	</Provider>
);


setStateHolder(ReduxStateHolder);

export default TodoWithFavorites;