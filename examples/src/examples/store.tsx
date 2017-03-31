import * as React from "react";
import * as ECF from "encaps-component-factory";

const getComponentWithState = (reducer: ECF.Reducer<any>, key: string, Element: any) => {
	const Provider = ECF.getProvider();
	const Holder = ECF.getStateHolder();
	
	const store = ECF.getCreateStore()( reducer );
	
	return (props: any): JSX.Element => (
		<Provider store={store} >
			<Holder code={key} Element={Element} elementProps={props} />
		</Provider>
	);
};

export default getComponentWithState;