import { IProps, IViewProps, IState, IPublicActions } from "./types";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { createBuilder } from "encaps-component-factory/controller";

import initState from "./initState";

const builder = createBuilder<IState, IPublicActions>();

builder.setInitState(initState);

export const num1Change = builder.action('num1Change', (state, action: IAction<number>) => ({...state,  num1: action.payload}) );
export const num2Change = builder.action('num2Change', (state, action: IAction<number>) => ({...state,  num2: action.payload}) );

export default builder.getController();