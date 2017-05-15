import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({ ids: ["1", "2"] }) );

const addItem = builder.addDispatchedHandler('addItem', (state, action: ECF.IAction<string>) => (
	{
		...state,  
		ids: [...state.ids, action.payload]
	}
) );

const removeItem = builder.addDispatchedHandler('removeItem', (state, action: ECF.IAction<string>) => {
	const newIds = [...state.ids];
	if (newIds.indexOf(action.payload) >= 0) {
		newIds.splice(newIds.indexOf(action.payload), 1);
	}
	return {...state,  ids: newIds};
} );

builder.setStateToProps((state, props) =>({
	...state
}))

builder.setDispatchToProps((dispatch, props) =>({
	onAddItem: (id: string) => {
		props.onAddItem && props.onAddItem(id);
		addItem(dispatch, id)
	},
	onRemoveItem: (id: string) => {
		props.onRemoveItem && props.onRemoveItem(id);
		removeItem(dispatch, id);
	}
}))

export default builder.getController();