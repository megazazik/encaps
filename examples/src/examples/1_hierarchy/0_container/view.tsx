import * as React from "react";
import {IViewProps} from "./types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.headerText}</h2>
			<input 
				value={props.num1}
				onChange={ (ev) => props.actions.num1Change(parseFloat(ev.currentTarget.value)) }
			/>
			<span>&nbsp;+&nbsp;</span>
			<input 
				value={props.num2}
				onChange={ (ev) => props.actions.num2Change(parseFloat(ev.currentTarget.value)) }
			/>
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
}