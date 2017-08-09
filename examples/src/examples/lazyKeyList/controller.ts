import { createBuilder, IController, wrapDispatch, joinKeys } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction, ISubAction, IChildProps, Dispatch } from "encaps-component-factory/types";
import { createChildProps } from "encaps-component-factory";
import { createConnectParams, IGetPropsParams, createWrapDispatch } from "encaps-component-factory/connect";

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

export const connectParams: IGetPropsParams<any, any, any, any, any, any, {getListItem: (index: number) => any}> = {
	stateToProps: (state) => {
		const wrapDispatch = createWrapDispatch();

		const sData = {
			state,
			dispatch: () => {},
			getListItem: (index: number) => createChildProps(
				sData.state[VALUES][index],
				wrapDispatch(joinKeys(VALUES, "" + index), sData.dispatch)
			)
		}
		
		return (state) => {
			sData.state = state;
			return sData;
		}
	},
	dispatchToProps: (dispatch) => ({dispatch}),
	mergeProps: (sData, {dispatch}, props) => {
		sData.dispatch = dispatch;
		return {
			getListItem: sData.getListItem
		}
	}
};
