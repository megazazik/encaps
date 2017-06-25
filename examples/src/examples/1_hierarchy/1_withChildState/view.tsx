import * as React from "react";
import Field from "../../fieldN";
import { IViewProps, FIELD1_KEY, FIELD2_KEY, SUM_KEY } from "./types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.text}</h2>
			<Field num={props.num1} onChange={props.num1Change} {...props.getChild(FIELD1_KEY)} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.num2} onChange={props.num2Change} {...props.getChild(FIELD2_KEY)} />
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
}