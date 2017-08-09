import * as React from "react";
import { getStandalone } from "encaps/standalone";
import { IController, createBuilder } from "encaps/controller";
import { createContainer } from "encaps/react";
import { createConnectParams } from "encaps/connect";

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