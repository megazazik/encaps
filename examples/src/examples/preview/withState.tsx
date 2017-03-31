import * as React from "react";
import * as ECF from "encaps-component-factory";
import withStore from "../store";

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

const builder = ECF.createBuilder<IProps, IState, IViewProps>();
builder.setInitState(() => ({num: 0}));
const increment = builder.addHandler('increment', (state, action: ECF.IAction<number>) => ({num: state.num + action.payload}) );
builder.setGetProps((state, dispatch, props) => ({
	...props,
	...state,
	click: () => dispatch(increment(1))
}));

export default withStore(builder.getReducer(), null, builder.getComponent(view));