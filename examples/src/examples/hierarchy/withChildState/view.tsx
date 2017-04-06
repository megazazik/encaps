import * as React from "react";
import Field from "../../field";
import { IViewProps } from "./types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.sum.headerText}</h2>
			<Field num={props.sum.num1} onChange={props.sum.onNum1Change} {...props.field1} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.sum.num2} onChange={props.sum.onNum2Change} {...props.field2} />
			<span>&nbsp;=&nbsp;{props.sum.result}</span>
		</div>
	);
}