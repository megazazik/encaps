import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState, IPublicState, IPublicActions } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { createBuilder } from "encaps-component-factory/controller";

const builder = createBuilder<IState, IPublicState, IPublicActions>();

builder.setInitState(() => ({
	numbers: [0, 0]
}));

interface INumberChange {
	value: number;
	index: number;
}

const numChange = builder.action<INumberChange>(
	'numChange', 
	(state, action: ECF.IAction<INumberChange>) => { 
		const numbers =  [...state.numbers];
		numbers[action.payload.index] = action.payload.value;
		return { numbers };
	}
);

export const createAddField = builder.action<{}>(
	'addField', 
	(state, action: ECF.IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.push(0);
		return { numbers };
	}
);

export const addField = (dispatch: ECF.Dispatch, payload?: {}) => dispatch(createAddField(payload));

export const createSubtractField = builder.action<{}>(
	'subtractField', 
	(state, action: ECF.IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.pop();
		return { numbers };
	}
);

export const subtractField = (dispatch: ECF.Dispatch, payload?: {}) => dispatch(createSubtractField(payload));

builder.setSelectState((state) => ({...state, result: state.numbers.reduce((prev, current) => (prev + current))}));

// builder.setStateToProps((state, props) =>({
// 	...state, 
// 	headerText: props.text,
// 	result: state.numbers.reduce((prev, current) => (prev + current))
// }));

// builder.setDispatchToProps((dispatch, props) =>({
// 	onNumberChange: (value, index) => dispatch(numChange({ value, index })),
// 	onAddField: () => addField(dispatch, null),
// 	onSubtractField: () => subtractField(dispatch, null)
// }))

export default builder.getController();