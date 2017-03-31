import * as React from "react";
import {IViewProps} from "../sum/types";
import styles = require("./styles.less");

type Field = (value: number, onChange: (value: number) => void, index?: number) => JSX.Element;

export default function View (props: IViewProps & {FieldElement: Field}): JSX.Element {
	return (
		<div className={styles["container"]}>
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
					{props.FieldElement(
						props.numbers[index],
						(value: number) => props.onNumberChange(value, index),
						index
					)}
				</span>
			))}
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
}