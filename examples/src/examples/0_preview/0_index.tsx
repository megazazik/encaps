import * as React from "react";
import { getStandalone } from "encaps-component-factory/standalone";
import { IController, createBuilder } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";

const View = (): JSX.Element => {
	return (
		<div>
			<h2>Заголовок</h2>
			<span>Это текст под заголовком</span>
		</div>
	);
}

const controller = createBuilder<{}, {}>().getController();

export default getStandalone(controller.getReducer(), createComponent(controller)(View));