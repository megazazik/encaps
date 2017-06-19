import * as React from "react";
import { IAction, Dispatch } from "encaps-component-factory/types";
import { getStandalone } from "encaps-component-factory/standalone";
import { IController, createBuilder } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";

interface IProps {
	text: string;
}

interface IViewProps {
	text: string;
	click: () => void;
	num: number;
}

interface IState {
	num: number;
}
const view = (props: IViewProps): JSX.Element => {
	return (
		<div>
			<h2>{props.text}</h2>
			<span>Количество: {props.num}</span>
			<br/>
			<button onClick={props.click} >Нажми меня, чтобы увеличить</button>
		</div>
	);
}

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

const builder = createBuilder<IState>();
builder.setInitState(() => ({num: 0}));
const increment = builder.action('increment', (state, action: IAction<number>) => ({num: state.num + action.payload}) );

const controller = builder.getController();

const View = createComponent<IProps, IViewProps, IState>(
	controller,
	(state, props) => ({...state, ...props}),
	(dispatch, props) => ({click: () => dispatch(increment(1))})
)(view);

export default getStandalone(controller.getReducer(), View);