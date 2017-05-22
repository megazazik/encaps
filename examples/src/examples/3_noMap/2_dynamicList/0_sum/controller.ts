import * as ECF from "encaps-component-factory";
import { IProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState>();

builder.setInitState(() => ({
	numbers: [0, 0]
}));

interface INumberChange {
	value: number;
	index: number;
}

export const numChange = builder.addHandler<INumberChange>(
	'numChange', 
	(state, action: ECF.IAction<INumberChange>) => { 
		const numbers =  [...state.numbers];
		numbers[action.payload.index] = action.payload.value;
		return { numbers };
	}
);


export const createAddField = builder.addHandler<{}>(
	'addField', 
	(state, action: ECF.IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.push(0);
		return { numbers };
	}
);
export const addField = (dispatch: ECF.Dispatch, payload?: {}) => dispatch(createAddField(payload));

export const createSubtractField = builder.addHandler<{}>(
	'subtractField', 
	(state, action: ECF.IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.pop();
		return { numbers };
	}
);
export const subtractField = (dispatch: ECF.Dispatch, payload?: {}) => dispatch(createSubtractField(payload));

export default builder.getController();