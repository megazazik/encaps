import { createComponent } from "encaps-component-factory/react";
import { wrapDispatch } from "encaps-component-factory/controller";
import controller, { listController } from "./controller";
import { getListItem } from "../../../list/controller";
import View from "./view";
import { IProps, IState, LIST_ITEMS_KEY } from "./types";

export default createComponent(
	controller,
	(state: IState) => state,
	(dispatch) => dispatch,
	(state, dispatch, props: IProps) => ({
		...props,
		onRemoveTodo: (id: number) => {
			props.onRemoveTodo(id);
			wrapDispatch(LIST_ITEMS_KEY, dispatch)(
				listController.getActions().subtractValue(id + "")
			);
		},
		getListItem: (index: number) => getListItem(state.items, wrapDispatch(LIST_ITEMS_KEY, dispatch), index)
	})
)(View);