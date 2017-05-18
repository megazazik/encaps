import * as React from "react";
import * as ECF from "encaps-component-factory";

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


const builder = ECF.createBuilder<IProps, {}, IProps>();

export default ECF.getStandalone(() => ({}), builder.getController().getComponent(view));