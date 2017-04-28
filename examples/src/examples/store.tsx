import * as React from "react";
import * as ECF from "encaps-component-factory";

const getComponentWithState = (reducer: ECF.Reducer<any>, Element: any) => {
	const Provider = ECF.getProvider();
	const Holder = ECF.connect()(Element);

	const store = ECF.getCreateStore()(reducer);

	return (props: any): JSX.Element => (
		<Provider store={store} >
			<Holder {...props} />
		</Provider>
	);
};

export function connect (key: string) {
	return ECF.getConnect()(
		(state, props) => (state[key]),
		(dispatch, props) => ECF.wrapDispatch(dispatch, key)
	);
}

export default getComponentWithState;