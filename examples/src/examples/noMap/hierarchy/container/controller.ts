import * as ECF from "encaps-component-factory";
import {IProps, IState} from "./types";

const builder = ECF.createBuilder<IProps, IState>();
const initState = () => ({num1: 0, num2: 0});

builder.setInitState(initState);

export const num1Change = builder.addHandler('num1Change', (state, action: ECF.IAction<number>) => ({...state,  num1: action.payload}) );
export const num2Change = builder.addHandler('num2Change', (state, action: ECF.IAction<number>) => ({...state,  num2: action.payload}) );

export default builder.getController();