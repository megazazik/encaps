import * as React from "react";
import Field from "../../field";
import { IViewProps, FIELD1_KEY, FIELD2_KEY } from "./types";

export default function View (props: IViewProps & {[key: string]: any}): JSX.Element {
	return (
		<div>
			<h2>{props.sum.headerText}</h2>
			<Field num={props.sum.num1} onChange={props.sum.onNum1Change} {...props[FIELD1_KEY]} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.sum.num2} onChange={props.sum.onNum2Change} {...props[FIELD2_KEY]} />
			<span>&nbsp;=&nbsp;{props.sum.result}</span>
		</div>
	);
}