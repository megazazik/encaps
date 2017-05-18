import * as React from "react";
import * as ECF from "encaps-component-factory";

const view = (): JSX.Element => {
	return (
		<div>
			<h2>Заголовок</h2>
			<span>Это текст под заголовком</span>
		</div>
	);
}

const builder = ECF.createBuilder<{}, {}, {}>();
const View = builder.getController().getComponent(view);

export default ECF.getStandalone((action) => ({}), View);