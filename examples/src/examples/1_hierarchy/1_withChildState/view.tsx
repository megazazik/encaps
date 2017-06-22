import * as React from "react";
import Field from "../../fieldN";
import { IViewProps, FIELD1_KEY, FIELD2_KEY, SUM_KEY } from "./types";

export default function View (props: IViewProps): JSX.Element {
	const sumProps = props.getChildState(SUM_KEY);
	const sumActions = props.getChildActions(SUM_KEY);
	return (
		<div>
			<h2>{props.text}</h2>
			<Field num={sumProps.num1} onChange={sumActions.num1Change} {...props.getChild(FIELD1_KEY)} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={sumProps.num2} onChange={sumActions.num2Change} {...props.getChild(FIELD2_KEY)} />
			<span>&nbsp;=&nbsp;{sumProps.result}</span>
		</div>
	);
}