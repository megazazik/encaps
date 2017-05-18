import * as React from "react";
import Field from "../../../field";
import { IViewProps, FIELD1_KEY, FIELD2_KEY } from "./types";
import { ViewProps } from "encaps-component-factory";
import { num1Change, num2Change } from "../0_container/controller";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.sum.text}</h2>
			<Field num={props.sum.state.num1} onChange={ (num) => props.sum.dispatch(num1Change(num)) } {...props.getChild(FIELD1_KEY)} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.sum.state.num2} onChange={ (num) => props.sum.dispatch(num2Change(num)) } {...props.getChild(FIELD2_KEY)} />
			<span>&nbsp;=&nbsp;{props.sum.state.num1 + props.sum.state.num2}</span>
		</div>
	);
}