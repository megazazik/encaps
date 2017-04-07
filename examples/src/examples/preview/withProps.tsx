import * as React from "react";
import * as ECF from "encaps-component-factory";
import withStore from "../store";

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
builder.setGetProps((state, dispatch, props) => props);

export default withStore(() => ({t:{}}), "t", builder.getController().getComponent(view));