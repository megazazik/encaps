import * as React from "react";
import { getStandalone } from "encaps-component-factory/standalone";
import { IController, createBuilder } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";

interface IProps {
	text: string;
}

const view = ({text}: IProps): JSX.Element => {
	return (
		<div>
			<h2>Заголовок</h2>
			<span>{text}</span>
		</div>
	);
}

export const previewProps = {
	text: "Это текст, переданый через свойства."
}

const builder = createBuilder<{}, {}>();

export default getStandalone(() => ({}), createComponent(builder.getController())(view));