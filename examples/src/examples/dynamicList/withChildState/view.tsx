import * as React from "react";
import Field from "../../field";
import { IViewProps } from "./types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.sum.headerText}</h2>
			<div>
				<button onClick={ () => { props.sum.onAddField(); props.numbers.onAddValue(); } }>Добавить поле</button>
				<button onClick={ () => { props.sum.onSubtractField(); props.numbers.onSubtractValue(); } }>Удалить поле</button>
			</div>
			{ props.numbers.values.map( (num, index) => (
				<span key={"field" + index}>
					{index != 0 && (
						<span>&nbsp;+&nbsp;</span>
					)}
					<Field
						num={props.sum.numbers[index]}
						onChange={ (num) => props.sum.onNumberChange(num, index) }
						{...props.numbers.values[index]}
					/>
				</span>
			))}
			<span>&nbsp;=&nbsp;{props.sum.result}</span>
		</div>
	);
}