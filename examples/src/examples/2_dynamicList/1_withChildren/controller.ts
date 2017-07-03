import { Dispatch } from "encaps-component-factory/types";
import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import sumController, * as Sum from "../0_sum/controller";
import fieldController from "../../fieldN/controller";
import { NUMBERS_KEY, SUM_KEY, IState } from "./types";

import createList, * as Numbers from "../../listN/controller";

export function createState(size: number): IState {
	return {
		sum: Sum.createState(size),
		numbers: Numbers.createState(size, fieldController.getInitState)
	}
}

const listController = createList(fieldController, 2);

const sumWrapDispatch = (origin: Dispatch, child: Dispatch): Dispatch => (action) => {
	switch(action.type) {
		case Sum.ADD_FIELD_ACTION: 
			wrapDispatch(origin, NUMBERS_KEY)(listController.getActions().addValue());
			break;
		case Sum.SUBTRACT_FIELD_ACTION:
			wrapDispatch(origin, NUMBERS_KEY)(listController.getActions().subtractValue());
			break;
	}
	
	child(action);
};

const builder = createBuilder()
	.addChild(NUMBERS_KEY, listController)
	.addChild(SUM_KEY, sumController, sumWrapDispatch);

export default builder.getController();