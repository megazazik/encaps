import * as React from "react";
import { getStandalone, createContainer, createConnectParams } from "encaps-react";
import { IController, createBuilder } from "encaps";

const View = (): JSX.Element => {
	return (
		<div>
			<h2>Заголовок</h2>
			<span>Это текст под заголовком</span>
		</div>
	);
}

const controller = createBuilder().getController();

export default getStandalone(controller.getReducer(), createContainer(createConnectParams(controller))(View));