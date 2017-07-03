import { IProps, IViewProps, IState, IPublicState, IPublicActions, INumberChange } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { createBuilder } from "encaps-component-factory/controller";

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
			return { numbers };
		},
		addField: (state, action: IAction<{}>) => { 
			const numbers =  [...state.numbers];
			numbers.push(0);
			return { numbers };
		},
		subtractField: (state, action: IAction<{}>) => { 
			const numbers =  [...state.numbers];
			numbers.pop();
			return { numbers };
		}
	});

export default builder.getController();