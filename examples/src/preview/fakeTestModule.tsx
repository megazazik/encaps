import * as React from 'react';

export default function FakeComponent (props: {text?: string}) {
	return (
		<div>{!!props && !!props.text ? props.text : "Свойства не заданы."}</div>
	);
}