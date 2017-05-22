import * as ECF from "encaps-component-factory";

export interface IState<S> {
	values: S[];
}

const VALUES = "values";

function createListBuilder<S> (valueBuilder: ECF.IController<any, S, any>, size: number) {
	const builder = ECF.createBuilder<{}, IState<S>>();

	builder.setInitState(
		() => ({ values: Array.apply(null, Array(size)).map(valueBuilder.getInitState()) })
	);

	const createAddValue = builder.addHandler(
		"addValue",
		(state, action: ECF.IAction<{}>) => { 
			const values =  [...state.values];
			values.push(valueBuilder.getInitState()());
			return { values };
		}
	);
	const addValue = (dispatch: ECF.Dispatch, payload?: {}) => dispatch(createAddValue(payload));

	const createSubtractValue = builder.addHandler(
		"subtractValue",
		(state, action: ECF.IAction<{}>) => { 
			const values =  [...state.values];
			values.pop();
			return { values };
		}
	);
	const subtractValue = (dispatch: ECF.Dispatch, payload?: {}) => dispatch(createSubtractValue(payload));

	const valueReducer = valueBuilder.getReducer();

	const onFieldStateChange = builder.addSubHandler(
		"values",
		(state, action: ECF.ISubAction<any>) => { 
			const values =  [...state.values];
			values[action.key] = valueReducer(state.values[action.key], action);
			return {...state, values};
		}
	);

	return {
		controller: builder.getController(),
		actions: {
			addValue,
			subtractValue, 
			onFieldStateChange
		}
	};
};

export default createListBuilder;