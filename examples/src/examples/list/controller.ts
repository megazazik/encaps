import * as ECF from "encaps-component-factory";

export interface IViewProps<S> {
	onAddValue: () => void;
	onSubtractValue: () => void;
	values: ECF.IChildProps<S>[]
}

const VALUES = "values";

function createListBuilder<S> (valueBuilder: ECF.IController<any, S, any>, size: number) {
	const builder = ECF.createBuilder<{}, {values: S[]}, IViewProps<S>>();

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

	builder.setGetProps((state, dispatch, props) => ({
		values: state.values.map((numberState, index) => ECF.createChildProps(
			numberState,
			onFieldStateChange(dispatch, "" + index)
		)),
		onAddValue: () => addValue(dispatch, null),
		onSubtractValue: () => subtractValue(dispatch, null)
	}));

	return {
		controller: builder.getController(),
		actions: {
			createAddValue,
			createSubtractValue,
			addValue,
			subtractValue
		}
	};
};

export default createListBuilder;