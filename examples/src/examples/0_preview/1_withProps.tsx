import * as React from "react";
import { getStandalone } from "encaps/standalone";
import { IController, createBuilder } from "encaps/controller";
import { createContainer } from "encaps/react";
import { createConnectParams } from "encaps/connect";

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

const builder = createBuilder();

export default getStandalone(() => ({}), createContainer(createConnectParams(builder.getController()))(view));