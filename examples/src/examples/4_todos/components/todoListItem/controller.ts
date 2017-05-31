import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({
	expanded: false
}) );

const expand = builder.addHandler('expand', (state, action: ECF.IAction<boolean>) => (
	{
		expanded: action.payload
	}
) );

builder.setGetProps((state, dispatch, props) => ({
	...state, 
	...props,
	onExpand: () => dispatch(expand(!state.expanded))
}));

export default builder.getController();