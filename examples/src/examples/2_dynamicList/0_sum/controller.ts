import { IProps, IViewProps, IState, IPublicState, IPublicActions, INumberChange } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { createBuilder } from "encaps-component-factory/controller";

const builder = createBuilder<IState, IPublicActions>();

export function createState(size: number) {
	return {numbers: Array.apply(null, Array(size)).map(() => 0)};
}

builder.setInitState(() => createState(2));

export const ADD_FIELD_ACTION = 'addField';
export const SUBTRACT_FIELD_ACTION = 'subtractField';

const numChange = builder.action<INumberChange>(
	'numChange', 
	(state, action: IAction<INumberChange>) => { 
		const numbers =  [...state.numbers];
		numbers[action.payload.index] = action.payload.value;
		return { numbers };
	}
);

export const createAddField = builder.action<{}>(
	ADD_FIELD_ACTION, 
	(state, action: IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.push(0);
		return { numbers };
	}
);

export const addField = (dispatch: Dispatch, payload?: {}) => dispatch(createAddField(payload));

export const createSubtractField = builder.action<{}>(
	SUBTRACT_FIELD_ACTION, 
	(state, action: IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.pop();
		return { numbers };
	}
);

export const subtractField = (dispatch: Dispatch, payload?: {}) => dispatch(createSubtractField(payload));

export default builder.getController();