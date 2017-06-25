import { IAction, Dispatch } from "encaps-component-factory/types";
import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import sumController, * as Sum from "../0_sum/controller";
import fieldController from "../../fieldN/controller";
import { IProps, IViewProps, NUMBERS_KEY, SUM_KEY, IState } from "./types";

import createList, * as Numbers from "../../listN/controller";

export function createState(size: number) {
	return {
		[SUM_KEY]: Sum.createState(size),
		[NUMBERS_KEY]: Numbers.createState(size, fieldController.getInitState)
	}
}

const builder = createBuilder<IState>();

const listController = createList(fieldController, 2);
const dispatchList = builder.addChild(NUMBERS_KEY, listController);

const sumWrapDispatch = (origin: Dispatch, child: Dispatch): Dispatch => (action) => {
	if (action.type === Sum.ADD_FIELD_ACTION) {
		wrapDispatch(origin, NUMBERS_KEY)(listController.getActions().addValue());
	}
	if (action.type === Sum.SUBTRACT_FIELD_ACTION) {
		wrapDispatch(origin, NUMBERS_KEY)(listController.getActions().subtractValue());
	}
	child(action);
};

const dispatchSum = builder.addChild(SUM_KEY, sumController, sumWrapDispatch);

export default builder.getController();