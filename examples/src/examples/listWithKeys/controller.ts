import * as ECF from "encaps-component-factory";

export interface IViewProps<S> {
	onAddValue: (id: string) => void;
	onSubtractValue: (id: string) => void;
	values: {[id: string]: ECF.IChildProps<S>}
}

const VALUES = "values";

function createListBuilder<S> (valueBuilder: ECF.IController<any, S, any>, keys: string[]) {
	const builder = ECF.createBuilder<{}, {values: {[id: string]: S}}, IViewProps<S>>();

	builder.setInitState(
		() => {
			const initState = {values: {}};
			keys.forEach( key => { initState.values[key] = valueBuilder.getInitState()(); } );
			return initState;
		}
	);

	const addValue = builder.addDispatchedHandler(
		"addValue",
		(state, action: ECF.IAction<string>) => { 
			const values =  {...state.values};
			values[action.payload] = valueBuilder.getInitState()();
			return { values };
		}
	);

	const subtractValue = builder.addDispatchedHandler(
		"subtractValue",
		(state, action: ECF.IAction<string>) => { 
			const values = {...state.values};
			delete values[action.payload];
			return { values };
		}
	);

	const valueReducer = valueBuilder.getReducer();

	const onValueStateChange = builder.addSubHandler(
		"values",
		(state, action: ECF.ISubAction<any>) => { 
			const values =  {...state.values};
			values[action.key] = valueReducer(state.values[action.key], action);
			return {...state, values};
		}
	);

	builder.setGetProps((state, dispatch, props) => {
		const values = {};
		Object.keys(state.values).forEach( key => {
			 values[key] = ECF.createChildProps(
				state.values[key],
				onValueStateChange(dispatch, key)
			);
		} );

		return {
			values,
			onAddValue: (key: string) => addValue(dispatch, key),
			onSubtractValue: (key: string) => subtractValue(dispatch, key)
		};
	});

	return {
		controller: builder.getController(),
		actions: {
			addValue,
			subtractValue
		}
	};
};

export default createListBuilder;