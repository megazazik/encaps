import { createBuilder, IController, wrapDispatch, joinKeys } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction, ISubAction, IChildProps, Dispatch } from "encaps-component-factory/types";
import { createChildProps } from "encaps-component-factory";

const VALUES = "values";

export interface IState<S> {
	values: {[key: string]: S}
}

function createListBuilder<S extends object, Actions, SubActions> (valueBuilder: IController<S, Actions, SubActions>) {
	const valueReducer = valueBuilder.getReducer();

	const builder = createBuilder()
		.setInitState<IState<S>>(
			() => ({values: {}})
		)
		.action({
			addValue: (state, action: IAction<string>) => { 
				const values =  {...state.values};
				values[action.payload] = valueBuilder.getInitState();
				return { values };
			},
			subtractValue: (state, action: IAction<string>) => { 
				const values = {...state.values};
				delete values[action.payload];
				return { values };
			}
		})
		.subAction({
			values: (state, action: ISubAction<any>) => { 
				const values =  {...state.values};
				values[action.key] = valueReducer(state.values[action.key], action);
				return {...state, values};
			}
		});

	return builder.getController();
};

export default createListBuilder;

export function getListItem<S = any>(state: S, dispatch: Dispatch, index: number) {
	 return createChildProps(
		state[VALUES][index],
		wrapDispatch(joinKeys(VALUES, "" + index), dispatch)
	 );
}