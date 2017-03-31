import * as ECF from "encaps-component-factory";

export interface IViewProps {
	onAddValue: () => void;
	onSubtractValue: () => void;
	values: ECF.IChildProps[]
}

const VALUES = "values";

const createListBuilder = (valueBuilder: ECF.ComponentBuilder<any, any, any>, size: number) => {
	const builder = ECF.createBuilder<{}, {values: any[]}, IViewProps>();

	builder.setInitState(
		() => ({ values: Array.apply(null, Array(size)).map(valueBuilder.getInitState()) })
	);

	const addValue = builder.addDispatchedHandler(
		"addValue",
		(state, action: ECF.IAction<{}>) => { 
			const values =  [...state.values];
			values.push(valueBuilder.getInitState()());
			return { values };
		}
	);

	const subtractValue = builder.addDispatchedHandler(
		"subtractValue",
		(state, action: ECF.IAction<{}>) => { 
			const values =  [...state.values];
			values.pop();
			return { values };
		}
	);

	const valueReducer = valueBuilder.getReducer();

	const onFieldStateChange = builder.addSubHandler(
		"values",
		(state, action: ECF.ISubAction<any>) => { 
			const values =  [...state.values];
			values[action.key] = valueReducer(state.values[action.key], action);
			return {...state, values};
		}
	);

	builder.setGetProps((state, dispatch, props) => ({
		values: state.values.map((numberState, index) => ECF.createChildProps(
			numberState,
			onFieldStateChange(dispatch, "" + index)
		)),
		onAddValue: () => addValue(dispatch, null),
		onSubtractValue: () => subtractValue(dispatch, null)
	}));

	return {
		builder,
		actions: {
			addValue,
			subtractValue
		}
	};
};

export default createListBuilder;