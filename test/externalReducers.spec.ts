import test from 'tape';
import { build } from '../src/controller';
import { createList } from '../src/list';
import { createMap } from '../src/map';

const reducer = (state = {}, action) => {
	switch (action.type) {
		case 'type1':
			return state;
		default:
			return {...state};
	}
}

const actions = {
	action1: () => ({type: 'type1', payload: 10})
}

test('External reducers. simple', (t) => {
	t.doesNotThrow(() => {
		const model = build({ reducer, actions});
		model.actions.action1();
		model.reducer(undefined, {type: ''});

		model.reducer({}, model.actions.action1());
	})

	t.end();
})

test('External reducers. child', (t) => {
	t.doesNotThrow(() => {
		const model = build()
			.child('child', {reducer, actions});
		model.actions.child.action1();
		model.reducer(undefined, {type: ''})

		model.reducer({} as any, {type: ''})
	})

	t.end();
})

test('External reducers. list', (t) => {
	t.doesNotThrow(() => {
		const model = createList({reducer, actions});
		
		model.actions.item(1).action1();
		model.reducer(undefined, {type: ''})

		model.reducer(model.reducer(undefined, {type: ''}), {type: ''})
		model.reducer(model.reducer(undefined, {type: ''}), model.actions.item(1).action1())
		model.reducer(undefined, model.actions.add())
		model.reducer(undefined, model.actions.insert(0))
	})

	t.end();
})


test('External reducers. map', (t) => {
	t.doesNotThrow(() => {
		const model = createMap({reducer, actions});
		
		model.actions.item('1').action1();
		model.reducer(undefined, {type: ''})

		model.reducer(model.reducer(undefined, {type: ''}), {type: ''})
		model.reducer(model.reducer(undefined, {type: ''}), model.actions.item('1').action1())
		model.reducer(undefined, model.actions.add('qw'))
	})

	t.end();
})