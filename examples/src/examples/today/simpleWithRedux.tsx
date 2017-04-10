import * as React from 'react';
import * as ECF from "encaps-component-factory";
import ReduxStateHolder from "encaps-component-factory-redux";
import withStore from "../redux";

ECF.setStateHolder(ReduxStateHolder);

interface IProps {
	text: string;
}

interface IState {
	num1: number;
	num2: number;
}

interface IViewProps extends IState {
	headerText: string;
	onNum1Change: (num: number) => void;
	onNum2Change: (num: number) => void;
	result: number;
}

const initState = () => ({num1: 0, num2: 0});

function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.headerText}</h2>
			<input 
				value={props.num1}
				onChange={ (ev) => props.onNum1Change(parseFloat(ev.currentTarget.value)) }
			/>
			<span>&nbsp;+&nbsp;</span>
			<input 
				value={props.num2}
				onChange={ (ev) => props.onNum2Change(parseFloat(ev.currentTarget.value)) }
			/>
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
}

const num1Change = (num: number) => ({ type: 'num1Change', payload: num});
const num2Change = (num: number) => ({ type: 'num2Change', payload: num});

const builder = ECF.createBuilder<IProps, IState, IViewProps>();


builder.setInitState(initState);
builder.addHandler('num1Change', (state, action: ECF.IAction<number>) => ({...state,  num1: action.payload}) );
builder.addHandler('num2Change', (state, action: ECF.IAction<number>) => ({...state,  num2: action.payload}) );


builder.setGetProps((state, dispatch, props) => ({
	...state, 
	headerText: props.text,
	result: state.num1 + state.num2,
	onNum1Change: (num) => dispatch(num1Change(num)),
	onNum2Change: (num) => dispatch(num2Change(num))
}));

const controller = builder.getController();

const component = controller.getComponent(View);

const componentWithState = withStore(controller.getReducer(), null, component);

export const previewProps = { text: "Текст, переданный через свойства" };

export default componentWithState;