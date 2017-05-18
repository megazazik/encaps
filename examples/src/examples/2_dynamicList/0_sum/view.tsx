import * as React from "react";
import {IViewProps} from "./types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.headerText}</h2>
			<div>
				<button onClick={props.onAddField}>Добавить поле</button>
				<button onClick={props.onSubtractField}>Удалить поле</button>
			</div>
			{ props.numbers.map( (num, index) => (
				<span key={"field" + index}>
					{index != 0 && (
						<span>&nbsp;+&nbsp;</span>
					)}
					<input 
						value={props.numbers[index]}
						onChange={ (ev) => props.onNumberChange(parseFloat(ev.currentTarget.value), index) }
					/>
				</span>
			))}
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
}