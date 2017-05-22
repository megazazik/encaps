import * as ECF from "encaps-component-factory";
import sumController, { createAddField, createSubtractField } from "../0_sum/controller";
import fieldBuilder from "../../field/controller";
import { IProps, IViewProps, NUMBERS_KEY, SUM_KEY } from "./types";
import createList from "../../list/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

const dispatchSum = builder.addBuilder(SUM_KEY, sumController);

const listBuilderParams = createList(fieldBuilder, 2);
const dispatchList = builder.addBuilder(NUMBERS_KEY, listBuilderParams.controller);

const addField = builder.addHandler("addField", (state, action: ECF.IAction<{}>) => ({
	...state,
	[NUMBERS_KEY]: listBuilderParams.controller.getReducer()(state[NUMBERS_KEY], listBuilderParams.actions.createAddValue()),
	[SUM_KEY]: sumController.getReducer()(state[SUM_KEY], createAddField())
}));

const subtractField = builder.addHandler("subtractField", (state, action: ECF.IAction<{}>) => ({
	...state,
	[NUMBERS_KEY]: listBuilderParams.controller.getReducer()(state[NUMBERS_KEY], listBuilderParams.actions.createSubtractValue()),
	[SUM_KEY]: sumController.getReducer()(state[SUM_KEY], createSubtractField())
}));

builder.setDispatchToProps((dispatch, props) =>({
	onAddField: () => dispatch(addField()),
	onSubtractField: () => dispatch(subtractField())
}))

export default builder.getController();