import * as React from "react";
import { IState, IActions } from "./types";
import { IAction, Dispatch } from "encaps";
import { createBuilder } from "encaps";

export const builder = createBuilder()
	.setInitState(() => ({active: false}))
	.action({
		activate: (state, action: IAction<boolean>) => ({...state,  active: action.payload})
	})

export default builder.getController();
