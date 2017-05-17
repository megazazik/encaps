import * as React from "react";
import Field from "../../../field";
import { IViewProps } from "./types";
import * as ECF from "encaps-component-factory";
import controller, { numChange, addField, subtractField } from "../sum/controller";
import { listBuilderParams, dispatchList } from "./controller";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div>
			<h2>{props.text}</h2>
			<div>
				<button onClick={() => {
						listBuilderParams.actions.addValue(props.numbers.dispatch, undefined);
						addField(props.sum.dispatch, null);
					}}
				>
					Добавить поле
				</button>
				<button onClick={() => {
						listBuilderParams.actions.subtractValue(props.numbers.dispatch, undefined);
						subtractField(props.sum.dispatch, null);
					}}
				>
					Удалить поле
				</button>
			</div>
			{ props.numbers.state.values.map( (num, index) => (
				<span key={"field" + index}>
					{index != 0 && (
						<span>&nbsp;+&nbsp;</span>
					)}
					<Field 
						num={props.state.sum.numbers[index]}
						onChange={ (num) => props.sum.dispatch(numChange({
							value: num,
							index
						}))}
						{...ECF.createChildProps(
							props.numbers.state.values[index],
						 	listBuilderParams.actions.onFieldStateChange(props.numbers.dispatch, "" + index)
						)}
					/>
				</span>
			))}
			<span>&nbsp;=&nbsp;{props.state.sum.numbers.reduce((prev, current) => (prev + current))}</span>
		</div>
	);
}