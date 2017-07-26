import { createComponent } from "encaps-component-factory/react";
import { createWrapDispatch } from "encaps-component-factory/getProps";
import { Dispatch } from "encaps-component-factory/types";
import { wrapDispatch } from "encaps-component-factory/controller";
import controller, { listController } from "./controller";
import { stateToProps, dispatchToProps } from "../0_sum/connect";
import { getListItem } from "../../list/controller";
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

export default createComponent(
	controller,
	(state: IState, props: IProps) => (state),
	(dispatch, props) => (dispatch),
	(state, dispatch, props) => ({
		...stateToProps(state, props),
		...dispatchToProps(sumWrapDispatch(dispatch), props),
		getListItem: (index: number) => getListItem(state.items, wrapDispatch(NUMBERS_KEY, dispatch), index)
	})
);