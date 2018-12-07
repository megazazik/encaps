import {
	build,
	wrapAction,
	wrapActionsCreatorsWithKey,
	joinKeys,
	unwrapAction,
	IModel,
	IActionCreators,
	createEffect
} from './controller';
import { IAction } from './types';

export function createList<Actions extends IActionCreators = {}, State = {}>(model: IModel<Actions, State>) {
	const list = build<{item: (index: number) => Actions}, {items: State[]}>({
		actions: {
			item: createEffect(
				(actions) => () => actions,
				(index) => wrapActionsCreatorsWithKey(
					joinKeys('item', index),
					model.actions,
					() => (state) => state && state.items ? state.items[index] : undefined
				),
				(index) => (state) => state.items[index]
			)
		},
		reducer: (state = {items: []}, baseAction: IAction<any> = {type: ''}) => {
			const {action, key} = unwrapAction(baseAction);
			if (key === 'item') {
				const {action: childAction, key: childKey} = unwrapAction(action);
				const childIndex = parseInt(childKey);
				if (isNaN(childIndex) || childIndex < 0 || childIndex > state.items.length - 1) {
					return state;
				}
				const items = [...state.items];
				items[childIndex] = model.reducer(items[childIndex], childAction);
				return {...state, items};
			} else {
				return state;
			}
		},
	})
	.handlers({
		add: (state, {payload = 1}: IAction<number>) => { 
			const items =  [...state.items];
			for (let i = 0; i < payload; i++) {
				items.push(model.reducer());
			}
			return {...state, items};
		},
		subtract: (state, {payload = 1}: IAction<number>) => {
			const items =  [...state.items];
			for (let i = 0; i < payload; i++) {
				items.pop();
			}
			return {...state, items};
		},
		remove: (state, {payload}: IAction<number>) => {
			if (typeof payload !== 'number' || payload >= state.items.length) {
				return state;
			}
			const items =  [...state.items];
			items.splice(payload, 1);
			return {...state, items};
		},
		insert:  (state, {payload}: IAction<number>) => {
			if (typeof payload !== 'number') {
				return state;
			}
			const items =  [...state.items];
			items.splice(payload, 0, model.reducer());
			return {...state, items};
		},
	})

	return list;
}
