import * as ECF from "encaps-component-factory";
import {IProps, IViewProps, IState} from "./types";
import initState from "./initState";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState(initState);

const num1Change = builder.addHandler('num1Change', (state, action: ECF.IAction<number>) => ({...state,  num1: action.payload}) );
const num2Change = builder.addHandler('num2Change', (state, action: ECF.IAction<number>) => ({...state,  num2: action.payload}) );

builder.setStateToProps((state, props) =>({
	...state, 
	headerText: props.text,
	result: state.num1 + state.num2,
}))
builder.setDispatchToProps((dispatch, props) =>({
	onNum1Change: (num) => dispatch(num1Change(num)),
	onNum2Change: (num) => dispatch(num2Change(num))
}))

export default builder.getController();