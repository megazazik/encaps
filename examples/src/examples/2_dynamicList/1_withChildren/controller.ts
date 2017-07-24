import { Dispatch } from "encaps-component-factory/types";
import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import sumController, * as Sum from "../0_sum/controller";
import fieldController from "../../field/controller";
import { NUMBERS_KEY, SUM_KEY, IState } from "./types";

import createList, * as Numbers from "../../listN/controller";

export function createState(size: number): IState {
	return {
		sum: Sum.createState(size),
		numbers: Numbers.createState(size, fieldController.getInitState)
	}
}

export const listController = createList(fieldController, 2);

const builder = createBuilder()
	.addChild(NUMBERS_KEY, listController)
	.addChild(SUM_KEY, sumController);

export default builder.getController();