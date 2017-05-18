import * as React from "react";
import { IProps, IState } from "./types";
import * as ECF from "encaps-component-factory";
import controller, { numChange, addField, subtractField } from "./controller";

export default function View (props: ECF.ViewProps<IProps, IState>): JSX.Element {
	return (
		<div>
			<h2>{props.text}</h2>
			<div>
				<button onClick={() => addField(props.dispatch, null)}>Добавить поле</button>
				<button onClick={() => subtractField(props.dispatch, null)}>Удалить поле</button>
			</div>
			{ props.state.numbers.map( (num, index) => (
				<span key={"field" + index}>
					{index != 0 && (
						<span>&nbsp;+&nbsp;</span>
					)}
					<input 
						value={props.state.numbers[index]}
						onChange={ (ev) => props.dispatch(numChange({
							value: parseFloat(ev.currentTarget.value), 
							index
						})) }
					/>
				</span>
			))}
			<span>&nbsp;=&nbsp;{props.state.numbers.reduce((prev, current) => (prev + current))}</span>
		</div>
	);
}