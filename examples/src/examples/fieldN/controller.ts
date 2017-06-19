import * as React from "react";
import { IState } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { createBuilder } from "encaps-component-factory/controller";

const builder = createBuilder<IState>();
builder.setInitState(() => ({active: false}));

export const activate = builder.action('activate', (state, action: IAction<boolean>) => ({...state,  active: action.payload}) );

export default builder.getController();
