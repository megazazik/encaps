import { createChildProps } from "encaps-component-factory";
import { createBuilder, IController, wrapDispatch, joinKeys } from "encaps-component-factory/controller";
import { Dispatch, IAction, IChildProps, ISubAction, IParentProps, IActionCreator } from "encaps-component-factory/types";
import { createComponent } from "encaps-component-factory/react";

export interface IViewProps<S> {
	onAddValue: () => void;
	onSubtractValue: () => void;
	getValue: (index: number) => IChildProps<S>;
}

export interface IState<S> {
	values: S[]
}

export interface IPublicActions {
	addValue: IActionCreator<{}>;
	subtractValue: IActionCreator<{}>;
}

export const VALUES = "values";

export function createState<S>(size: number, getInitState: () => S) {
	return { values: Array.apply(null, Array(size)).map(getInitState) };
}

export default function createListBuilder<S extends object, PubActions = {}> (
	valueBuilder: IController<S, PubActions>, 
	size: number = 0
) {
	const builder = createBuilder<IState<S>, IPublicActions>();

	builder.setInitState(() => createState(size, () => valueBuilder.getInitState()));

	builder.action(
		"addValue",
		(state, action: IAction<{}>) => { 
			const values =  [...state.values];
			values.push(valueBuilder.getInitState());
			return { values };
		}
	);

	builder.action(
		"subtractValue",
		(state, action: IAction<{}>) => {
			const values =  [...state.values];
			values.pop();
			return { values };
		}
	);

	const valueReducer = valueBuilder.getReducer();

	builder.subAction(
		"values",
		(state, action: ISubAction<any>) => { 
			const values =  [...state.values];
			values[action.key] = valueReducer(state.values[action.key], action);
			return {...state, values};
		}
	);

	return builder.getController();
};

export function getListItem<S = any>(state: S, dispatch: Dispatch, index: number) {
	 return createChildProps(
		state[VALUES][index],
		wrapDispatch(dispatch, joinKeys(VALUES, "" + index))
	 );
}