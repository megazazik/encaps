import * as React from "react";
import { IAction, Dispatch, IActionCreator } from "encaps-component-factory/types";
import { getStandalone } from "encaps-component-factory/standalone";
import { IController, createBuilder } from "encaps-component-factory/controller";
import { createContainer } from "encaps-component-factory/react";
import { createConnectParams } from "encaps-component-factory/getProps";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

const controller = createBuilder()
	.setInitState(() => ({num: 0}))
	.action({increment: (state, action: IAction<number>) => ({num: state.num + action.payload})})
	.getController();

const connect = createContainer(createConnectParams(
	controller,
	undefined,
	(dispatch, props) => ({click: () => dispatch(controller.getActions().increment(1))})
));

interface IProps {
	text: string;
}

const View = connect<IProps>(
	(props): JSX.Element => {
		return (
			<div>
				<h2>{props.text}</h2>
				<span>Количество: {props.num}</span>
				<br/>
				<button onClick={props.click} >Нажми меня, чтобы увеличить</button>
			</div>
		);
	}
);

export default getStandalone(controller.getReducer(), View);