import * as React from "react";
import Field from "../../../field";
import { IViewProps } from "./types";
import { ViewProps } from "encaps-component-factory";
import { num1Change, num2Change } from "../container/controller";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.sum.text}</h2>
			<Field num={props.sum.state.num1} onChange={ (num) => props.sum.dispatch(num1Change(num)) } {...props.field1} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.sum.state.num2} onChange={ (num) => props.sum.dispatch(num2Change(num)) } {...props.field2} />
			<span>&nbsp;=&nbsp;{props.sum.state.num1 + props.sum.state.num2}</span>
		</div>
	);
}