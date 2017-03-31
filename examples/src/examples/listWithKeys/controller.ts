import * as ECF from "encaps-component-factory";

export interface IViewProps {
	onAddValue: (id: string) => void;
	onSubtractValue: (id: string) => void;
	values: {[id: string]: ECF.IChildProps}
}

const VALUES = "values";

const createListBuilder = (valueBuilder: ECF.ComponentBuilder<any, any, any>, keys: string[]) => {
	const builder = ECF.createBuilder<{}, {values: {[id: string]: any}}, IViewProps>();

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
		builder,
		actions: {
			addValue,
			subtractValue
		}
	};
};

export default createListBuilder;