import { createContainer } from "encaps-component-factory/react";
import { createWrapDispatch, composeConnectParams, wrapConnectParams, wrapDispatchToProps } from "encaps-component-factory/connect";
import { Dispatch } from "encaps-component-factory/types";
import { wrapDispatch } from "encaps-component-factory/controller";
import { listController } from "./controller";
import { connectParams } from "../0_sum/connect";
import { connectParams as listConnectParams } from "../../list/controller";
import { IProps, IViewProps, IState, SUM_KEY, NUMBERS_KEY } from "./types";
import * as Sum from "../0_sum/controller";

const sumWrapDispatch = (dispatch: Dispatch): Dispatch => {
	const numbersDispatch = wrapDispatch(NUMBERS_KEY, dispatch);
	return (action) => {
		switch(action.type) {
			case Sum.ADD_FIELD_ACTION: 
				numbersDispatch(listController.getActions().addValue());
				break;
			case Sum.SUBTRACT_FIELD_ACTION:
				numbersDispatch(listController.getActions().subtractValue());
				break;
		}
		
		dispatch(action);
	}
};

export default createContainer(composeConnectParams(
	{
		...connectParams,
		dispatchToProps: wrapDispatchToProps(sumWrapDispatch, connectParams.dispatchToProps)
	},
	{
		...wrapConnectParams(NUMBERS_KEY, listConnectParams),
		mergeProps: (s, d, p) => ({[NUMBERS_KEY]: listConnectParams.mergeProps(s, d, p)})
	}
));