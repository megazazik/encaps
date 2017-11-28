import { INumberChange } from "./types";
import { IAction, Dispatch } from "encaps";
import { createBuilder } from "encaps";

export function createState(size: number) {
	return {numbers: Array.apply(null, Array(size)).map(() => 0)};
}

export const ADD_FIELD_ACTION = 'addField';
export const SUBTRACT_FIELD_ACTION = 'subtractField';

export const builder = createBuilder()
	.setInitState(() => createState(2))
	.action({
		numChange: (state, action: IAction<INumberChange>) => { 
			const numbers =  [...state.numbers];
			numbers[action.payload.index] = action.payload.value;
			return {...state, numbers};
		},
		addField: (state, action: IAction<{}>) => { 
			const numbers =  [...state.numbers];
			numbers.push(0);
			return {...state, numbers};
		},
		subtractField: (state, action: IAction<{}>) => { 
			const numbers =  [...state.numbers];
			numbers.pop();
			return {...state, numbers};
		}
	});

export default builder.getController();