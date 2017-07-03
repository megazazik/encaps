import * as React from 'react';
import controller from './controller';
import { createComponent } from "encaps-component-factory/react";
import { stateToProps } from "../0_container/connect";
import Field from "../../fieldN";
import { FIELD1_KEY, FIELD2_KEY } from './types';

export default createComponent(
	controller,
	stateToProps
)((props) => {
	return (
		<div>
			<h2>{props.text}</h2>
			<Field num={props.num1} onChange={props.actions.num1Change} {...props.getChild(FIELD1_KEY)} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.num2} onChange={props.actions.num2Change} {...props.getChild(FIELD2_KEY)} />
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
})
