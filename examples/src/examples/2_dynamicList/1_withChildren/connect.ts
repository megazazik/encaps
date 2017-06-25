import { createComponent } from "encaps-component-factory/react";
import controller from "./controller";
import { stateToProps, dispatchToProps } from "../0_sum/connect";
import { getListItem } from "../../listN/controller";
import { IProps, IViewProps, IState, SUM_KEY, NUMBERS_KEY } from "./types";

export default createComponent(
	controller,
	(state, props: IProps) => (state),
	(dispatch, props) => (dispatch),
	(state, dispatch, props) => ({
		...stateToProps(state.sum, props),
		...dispatchToProps(controller.getWrapDispatch(SUM_KEY)(dispatch), props),
		getListItem: (index: number) => getListItem(state.numbers, controller.getWrapDispatch(NUMBERS_KEY)(dispatch), index)
	})
);