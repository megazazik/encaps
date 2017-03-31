import * as React from "react";
import { getCreateStore, getProvider, getStateHolder } from "../../../storage";
import { Reducer } from "../../../action";
import reducer from "./reducer";
import View from "./view";

const getComponentWithState = () => {
	const Provider = getProvider();
	const store = getCreateStore()( reducer );
	
	return (props: {}): JSX.Element => (
		<Provider store={store} >
			<View />
		</Provider>
	);
};

export default getComponentWithState;