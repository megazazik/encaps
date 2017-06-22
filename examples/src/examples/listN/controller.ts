import { createChildProps } from "encaps-component-factory";
import { createBuilder, IController } from "encaps-component-factory/controller";
import { Dispatch, IAction, IChildProps, ISubAction } from "encaps-component-factory/types";
import { createComponent } from "encaps-component-factory/react";

export interface IViewProps<S> {
	onAddValue: () => void;
	onSubtractValue: () => void;
	getValue: (index: number) => IChildProps<S>;
}

interface IState<S> {
	values: S[]
}

interface IPublicActions {
	addValue: () => void;
	subtractValue: () => void;
	values: (key: string, payload?: any) => void;
}

const VALUES = "values";

function createListBuilder<S extends object, PubS extends object, PubDispatch> (
	valueBuilder: IController<S, PubS, PubDispatch>, 
	size: number
) {
	const builder = createBuilder<IState<S>>();

	builder.setInitState(
		() => ({ values: Array.apply(null, Array(size)).map(valueBuilder.getInitState()) })
	);

	const createAddValue = builder.action(
		"addValue",
		(state, action: IAction<{}>) => { 
			const values =  [...state.values];
			values.push(valueBuilder.getInitState()());
			return { values };
		}
	);
	const addValue = (dispatch: Dispatch, payload?: {}) => dispatch(createAddValue(payload));

	const createSubtractValue = builder.action(
		"subtractValue",
		(state, action: IAction<{}>) => {
			const values =  [...state.values];
			values.pop();
			return { values };
		}
	);
	const subtractValue = (dispatch: Dispatch, payload?: {}) => dispatch(createSubtractValue(payload));

	const valueReducer = valueBuilder.getReducer();

	const onFieldStateChange = builder.subAction(
		"values",
		(state, action: ISubAction<any>) => { 
			const values =  [...state.values];
			values[action.key] = valueReducer(state.values[action.key], action);
			return {...state, values};
		}
	);

	// builder.setGetProps((state, dispatch, props) => ({
	// 	values: state.values.map((numberState, index) => createChildProps(
	// 		numberState,
	// 		onFieldStateChange(dispatch, "" + index)
	// 	)),
	// 	onAddValue: () => addValue(dispatch, null),
	// 	onSubtractValue: () => subtractValue(dispatch, null)
	// }));

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

// export const connect = <S>(controller: IController<IState<S>, IState<S>, IPublicActions>) => 
// 	createComponent<{}, IViewProps<S>, IState<S>, Dispatch, IState<S>, IState<S>, IPublicActions>(
// 		controller,
// 		(state, props) => ({...state}),
// 		(dispatch, props) => (dispatch),
// 		(stateProps, dispatch): IViewProps<S> => {
// 			const actionsProps = controller.getSelectActions()(dispatch) as IPublicActions;
// 			return {
// 				onAddValue: actionsProps.addValue,
// 				onSubtractValue: actionsProps.subtractValue,
// 				getValue: (index) => createChildProps(
// 					stateProps.values[index],
// 					controller.getWrapDispatch("" + index)(dispatch)
// 				)
// 			}
// 		}
// 	);

export default createListBuilder;