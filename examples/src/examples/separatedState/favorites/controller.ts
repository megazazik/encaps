import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState( () => ({ ids: ["1", "2"] }) );

const createAddItem = builder.addHandler('addItem', (state, action: ECF.IAction<string>) => (
	{
		...state,  
		ids: [...state.ids, action.payload]
	}
) );
const addItem = (dispatch: ECF.Dispatch, payload?: string) => dispatch(createAddItem(payload));

const createRemoveItem = builder.addHandler('removeItem', (state, action: ECF.IAction<string>) => {
	const newIds = [...state.ids];
	if (newIds.indexOf(action.payload) >= 0) {
		newIds.splice(newIds.indexOf(action.payload), 1);
	}
	return {...state,  ids: newIds};
} );
const removeItem = (dispatch: ECF.Dispatch, payload?: string) => dispatch(createRemoveItem(payload));

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