import {
	build,
	wrapAction,
	wrapActionsCreatorsWithKey,
	joinKeys,
	unwrapAction,
	IModel,
	IActionCreators,
	createCustomActionCreator,
	addToStringToActionCreators,
} from './controller';
import { IAction } from './types';

export function createMap<Actions extends IActionCreators = {}, State = {}>(model: IModel<Actions, State>) {
	const map = build<{item: (key: string) => Actions}, {items: {[key: string]: State}}>({
		actions: {
			item: createCustomActionCreator(
				(actions, select) => (...args) => actions,
				(index) => wrapActionsCreatorsWithKey(
					joinKeys('item', index),
					addToStringToActionCreators(model.actions),
					() => (state) => state && state.items ? state.items[index] : undefined
				),
				(index) => (state) => state.items[index],
				true
			)
		},
		reducer: (state = {items: {}}, baseAction: IAction<any> = {type: ''}) => {
			const {action, key} = unwrapAction(baseAction);
			if (key === 'item') {
				const {action: childAction, key: childKey} = unwrapAction(action);
				if (!childKey || !state.items.hasOwnProperty(childKey)) {
					return state;
				}
				const items = {...state.items};
				items[childKey] = model.reducer(items[childKey], childAction);
				return {...state, items};
			} else {
				return state;
			}
		},
	})

	return map;
}
