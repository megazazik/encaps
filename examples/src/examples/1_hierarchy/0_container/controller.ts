import { IAction } from "encaps/types";
import { createBuilder } from "encaps/controller";

import initState from "./initState";

export const builder = createBuilder()
	.setInitState(initState)
	.action({
		num1Change: (state, action: IAction<number>) => ({...state,  num1: action.payload}),
		num2Change: (state, action: IAction<number>) => ({...state,  num2: action.payload})
	}); 

export default builder.getController();