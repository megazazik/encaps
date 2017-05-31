import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({ ids: [] }) );

const addItem = builder.addHandler('addItem', (state, action: ECF.IAction<string>) => (
	{
		...state,  
		ids: [...state.ids, action.payload]
	}
) );

export const removeItem = builder.addHandler('removeItem', (state, action: ECF.IAction<string>) => {
	const newIds = [...state.ids];
	if (newIds.indexOf(action.payload) >= 0) {
		newIds.splice(newIds.indexOf(action.payload), 1);
	}
	return {...state,  ids: newIds};
} );

builder.setStateToProps((state, props) =>({
	...state, 
	...props
}))

builder.setDispatchToProps((dispatch, props) =>({
	onAddItem: (id: string) => dispatch(addItem(id)),
	onRemoveItem: (id: string) => dispatch(removeItem(id))
}))

export default builder.getController();