import * as React from "react";
import { ViewProps } from "encaps-component-factory";
import { IState, IProps } from "./types";
import { num1Change, num2Change } from "./controller";

export default function View (props: ViewProps<IProps, IState>): JSX.Element {
	return (
		<div>
			<h2>{props.text}</h2>
			<input 
				value={props.state.num1}
				onChange={ (ev) => props.dispatch(num1Change(parseFloat(ev.currentTarget.value))) }
			/>
			<span>&nbsp;+&nbsp;</span>
			<input 
				value={props.state.num2}
				onChange={ (ev) => props.dispatch(num2Change(parseFloat(ev.currentTarget.value))) }
			/>
			<span>&nbsp;=&nbsp;{props.state.num1 + props.state.num2}</span>
		</div>
	);
}