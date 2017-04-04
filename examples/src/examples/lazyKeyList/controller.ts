import * as ECF from "encaps-component-factory";

export interface IViewProps {
	onAddValue: (id: string) => void;
	onSubtractValue: (id: string) => void;
	getChildProps: (id: string) => ECF.IChildProps;
}

const VALUES = "values";

const createListBuilder = (valueBuilder: ECF.ComponentBuilder<any, any, any>) => {
	const builder = ECF.createBuilder<{}, {values: {[id: string]: any}}, IViewProps>();

	builder.setInitState(
		() => ({values: {}})
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
		return {
			onAddValue: (key: string) => addValue(dispatch, key),
			onSubtractValue: (key: string) => subtractValue(dispatch, key),
			getChildProps: (key: string) => ECF.createChildProps(
				state.values[key] || valueBuilder.getInitState()(),
				onValueStateChange(dispatch, key)
			)
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