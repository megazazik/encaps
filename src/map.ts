import {
	build,
	wrapAction,
	wrapChildActionCreators,
	joinKeys,
	unwrapAction,
	IModel,
	IActionCreators,
	markAsActionCreatorsGetter
} from './controller';
import { IAction } from './types';

export function createMap<Actions extends IActionCreators = {}, State = {}>(model: IModel<Actions, State>) {
	const map = build<{item: (key: string) => Actions}, {items: {[key: string]: State}}>({
		actions: {
			item: markAsActionCreatorsGetter(
				(index) => wrapChildActionCreators(wrapAction(joinKeys('item', index)), model.actions)
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
	.action({
		add: (state, {payload}: IAction<string>) => {
			const items =  {...state.items};
			if (!payload || items.hasOwnProperty(payload)) {
				return state;
			}
			items[payload] = model.reducer();
			return {...state, items};
		},
		remove: (state, {payload}: IAction<string>) => {
			if (!state.items.hasOwnProperty(payload)) {
				return state;
			}
			const {[payload]: removed, ...items} =  {...state.items};
			return {...state, items};
		},
	})

	return map;
}