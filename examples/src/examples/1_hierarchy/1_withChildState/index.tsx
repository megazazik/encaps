import * as React from 'react';
import controller from './controller';
import { createConnectParams } from "encaps-component-factory/getProps";
import { createContainer } from "encaps-component-factory/react";
import { stateToProps } from "../0_container/connect";
import Field from "../../field";
import { FIELD1_KEY, FIELD2_KEY } from './types';

export default createContainer(createConnectParams(
	controller,
	stateToProps
))((props) => {
	return (
		<div>
			<h2>{props.text}</h2>
			<Field num={props.num1} onChange={props.num1Change} {...props.getChild(FIELD1_KEY)} />
			<span>&nbsp;+&nbsp;</span>
			<Field num={props.num2} onChange={props.num2Change} {...props.getChild(FIELD2_KEY)} />
			<span>&nbsp;=&nbsp;{props.result}</span>
		</div>
	);
})
