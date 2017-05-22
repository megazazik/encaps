import * as ECF from "encaps-component-factory";

export interface IViewProps<S> {
	onAddValue: (id: string) => void;
	onSubtractValue: (id: string) => void;
	getChildProps: (id: string) => ECF.IChildProps<S>;
}

const VALUES = "values";

function createListBuilder<S> (valueBuilder: ECF.IController<any, S, any>) {
	const builder = ECF.createBuilder<{}, {values: {[id: string]: S}}, IViewProps<S>>();

	builder.setInitState(
		() => ({values: {}})
	);

	const createAddValue = builder.addHandler(
		"addValue",
		(state, action: ECF.IAction<string>) => { 
			const values =  {...state.values};
			values[action.payload] = valueBuilder.getInitState()();
			return { values };
		}
	);
	const addValue = (dispatch: ECF.Dispatch, payload: string) => dispatch(createAddValue(payload));

	const createSubtractValue = builder.addHandler(
		"subtractValue",
		(state, action: ECF.IAction<string>) => { 
			const values = {...state.values};
			delete values[action.payload];
			return { values };
		}
	);
	const subtractValue = (dispatch: ECF.Dispatch, payload?: string) => dispatch(createSubtractValue(payload));

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
		controller: builder.getController(),
		actions: {
			addValue,
			subtractValue
		}
	};
};

export default createListBuilder;