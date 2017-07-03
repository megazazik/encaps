import * as React from "react";
import Field from "../../fieldN";
import { IViewProps } from "./types";
import connect from "./connect";

export default connect((props) => (
		<div>
			<h2>{props.headerText}</h2>
			<div>
				<button onClick={ props.onAddField }>Добавить поле</button>
				<button onClick={ props.onSubtractField }>Удалить поле</button>
			</div>
			{props.numbers.map((num, index) => (
				<span key={"field" + index}>
					{index != 0 && (
						<span>&nbsp;+&nbsp;</span>
					)}
					<Field 
						num={num}
						onChange={ (num) => props.onNumberChange(num, index) }
						{...props.getListItem(index)}
					/>
				</span>
			))}
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
));