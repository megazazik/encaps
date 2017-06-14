import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({
	expanded: false
}) );

const toggle = builder.addHandler('toggle', (state, action: ECF.IAction<boolean>) => (
	{
		expanded: !state.expanded
	}
) );

builder.setStateToProps((state, props) => ({...state, ...props}));
builder.setDispatchToProps((dispatch, props) => ({onExpand: () => dispatch(toggle())}));

export default builder.getController();