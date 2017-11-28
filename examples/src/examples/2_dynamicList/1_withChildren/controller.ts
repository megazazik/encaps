import { Dispatch } from "encaps";
import { createBuilder, wrapDispatch } from "encaps";
import sumController, * as Sum from "../0_sum/controller";
import fieldController from "../../field/controller";
import { NUMBERS_KEY, SUM_KEY, IState } from "./types";

import createList, * as Numbers from "../../list/controller";

export function createState(size: number): IState {
	return {
		...Sum.createState(size),
		items: Numbers.createState(size, fieldController.getInitState)
	}
}

export const listController = createList(fieldController, 2);

const builder = Sum.builder
	.addChild(NUMBERS_KEY, listController);

export default builder.getController();