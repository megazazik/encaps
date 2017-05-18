import * as ECF from "encaps-component-factory";
import sumBuilder, { addField as sumAddField, subtractField as sumSubtractField } from "../0_sum/controller";
import fieldBuilder from "../../field/controller";
import { IProps, IViewProps, NUMBERS_KEY, SUM_KEY } from "./types";

import createList from "../../list/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

const dispatchSum = builder.addBuilder(SUM_KEY, sumBuilder);

const listBuilderParams = createList(fieldBuilder, 2);
const dispatchList = builder.addBuilder(NUMBERS_KEY, listBuilderParams.controller);

const addField = (dispatch: ECF.Dispatch): void => {
	listBuilderParams.actions.addValue(dispatchList(dispatch), null);
	sumAddField(dispatchSum(dispatch), null);
}

const subtractField = (dispatch: ECF.Dispatch): void => {
	listBuilderParams.actions.subtractValue(dispatchList(dispatch), null);
	sumSubtractField(dispatchSum(dispatch), null);
}

builder.setStateToProps((state, props) =>({
	...state
}))

builder.setDispatchToProps((dispatch, props) =>({
	onAddField: () => addField(dispatch),
	onSubtractField: () => subtractField(dispatch)
}))

export default builder.getController();