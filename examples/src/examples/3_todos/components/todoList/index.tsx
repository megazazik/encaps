import { createContainer } from "encaps/react";
import { createConnectParams, wrapConnectParams, composeConnectParams } from "encaps/connect";
import { wrapDispatch } from "encaps/controller";
import controller, { listController } from "./controller";
import { connectParams } from "../../../list/controller";
import View from "./view";
import { IProps, IState, LIST_ITEMS_KEY } from "./types";

const params = createConnectParams(
	controller,
	(state: IState) => state,
	(dispatch, props: IProps) => {
		let outerOnRemoveTodo = props.onRemoveTodo;
		const onRemoveTodo = (id: number) => {
			outerOnRemoveTodo(id);
			wrapDispatch(LIST_ITEMS_KEY, dispatch)(
				listController.getActions().subtractValue(id + "")
			);
		}

		return (dispatch, props) => {
			outerOnRemoveTodo = props.onRemoveTodo;
			return {onRemoveTodo};
		};
	}
);

export default createContainer(
	composeConnectParams(
		params,
		wrapConnectParams(LIST_ITEMS_KEY, connectParams)
	)
)(View);