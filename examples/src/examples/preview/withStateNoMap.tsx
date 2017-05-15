import * as React from "react";
import * as ECF from "encaps-component-factory";

interface IProps {
	text: string;
}

interface IViewProps extends IProps {
	state: IState;
	dispatch: ECF.Dispatch;
}

interface IState {
	num: number;
}

const View = (props: IViewProps): JSX.Element => {
	return (
		<div>
			<h2>{props.text}</h2>
			<span>Количество: {props.state.num}</span>
			<br/>
			<button onClick={() => props.dispatch(increment(1))} >Нажми меня, чтобы увеличить</button>
		</div>
	);
}

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

const builder = ECF.createBuilder<IProps, IState>();
builder.setInitState(() => ({num: 0}));
const increment = builder.addHandler('increment', (state, action: ECF.IAction<number>) => ({num: state.num + action.payload}) );
const controller = builder.getController();

export default ECF.getStandalone(controller.getReducer(), controller.getComponent(View));