import { createBuilder } from "encaps/controller";
import { createContainer } from "encaps/react";
import { createConnectParams } from "encaps/connect";
import { IAction, Dispatch } from "encaps/types";
import { IState } from "./types";

export const builder = createBuilder()
	.setInitState<IState>( () => ({ ids: [] }) )
	.action({
		addItem: (state, action: IAction<string>) => ({
			...state,  
			ids: [...state.ids, action.payload]
		}),
		removeItem: (state, action: IAction<string>) => {
			const newIds = [...state.ids];
			if (newIds.indexOf(action.payload) >= 0) {
				newIds.splice(newIds.indexOf(action.payload), 1);
			}
			return {...state,  ids: newIds};
		}
	});

export const controller = builder.getController();

export const connectParams = createConnectParams(
	controller,
	(state: IState) => state,
	(dispatch: Dispatch) => ({
		onAddItem: (id: string) => dispatch(controller.getActions().addItem(id)),
		onRemoveItem: (id: string) => dispatch(controller.getActions().removeItem(id))
	})
);

export const connect = createContainer(connectParams);

export default controller;