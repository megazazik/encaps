import { createChildProps } from "encaps-component-factory";
import { createBuilder, IController, wrapDispatch, joinKeys } from "encaps-component-factory/controller";
import { Dispatch, IAction, IChildProps, ISubAction, IParentProps, IActionCreator } from "encaps-component-factory/types";
import { createConnectParams, IGetPropsParams, createWrapDispatch } from "encaps-component-factory/connect";

export interface IState<S> {
	values: S[]
}

export const VALUES = "values";

export function createState<S>(size: number, getInitState: () => S): IState<S> {
	return { values: Array.apply(null, Array(size)).map(getInitState) };
}

export default function createListBuilder<S extends object, PubActions = {}> (
	valueBuilder: IController<S, PubActions>, 
	size: number = 0
) {
	const valueReducer = valueBuilder.getReducer();

	const builder = createBuilder()
		.setInitState(() => createState(size, () => valueBuilder.getInitState()))
		.action({
			addValue: (state, action: IAction<{}>) => { 
				const values =  [...state.values];
				values.push(valueBuilder.getInitState());
				return { values };
			},
			subtractValue: (state, action: IAction<{}>) => {
				const values =  [...state.values];
				values.pop();
				return { values };
			}
		})
		.subAction({
			values:	(state, action: ISubAction<any>) => { 
				const values =  [...state.values];
				values[action.key] = valueReducer(state.values[action.key], action);
				return {...state, values};
			}
		});

	return builder.getController();
};

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
