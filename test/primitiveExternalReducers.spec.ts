import test from 'tape';
import { build } from '../src/controller';
import { createList } from '../src/list';
import { createMap } from '../src/map';
import { spy } from 'sinon';

const reducer = (state = 0, action) => {
	switch (action.type) {
		case 'type1':
			return state + 1;
		case 'action2':
			return state - 1;
		default:
			return state;
	}
}

const actions = {
	action1: () => ({type: 'type1'}),
	action2: () => ({type: 'action2'})
}

test('External reducers. simple', (t) => {
	t.doesNotThrow(() => {
		const model = build({ reducer, actions});
		model.actions.action1();
		model.reducer(undefined, {type: ''});

		model.reducer(1, model.actions.action1());
	})

	t.end();
})

test('External reducers. child', (t) => {
	t.doesNotThrow(() => {
		const model = build()
			.child('child', {reducer, actions});
		model.actions.child.action1();
		model.reducer(undefined, {type: ''})

		model.reducer({child: 8}, {type: ''})
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
	})

	t.end();
});

test('External reducers. Children', (t) => {
	const spyReducer = spy(reducer);
	const child = build({ reducer: spyReducer, actions });
	const model = build().children({child});

	t.deepEqual(
		model.reducer(undefined, model.actions.child.action1()),
		{child: 1}
	)

	t.deepEqual(
		spyReducer.args[0][0],
		undefined
	)

	t.deepEqual(
		spyReducer.args[1][0],
		0
	)

	t.deepEqual(
		spyReducer.args[1][1],
		{type: 'type1'}
	)

	model.reducer({child: 12}, model.actions.child.action2());

	t.deepEqual(
		spyReducer.args[2][0],
		12
	)

	t.deepEqual(
		spyReducer.args[2][1],
		{type: 'action2'}
	)

	const parent  = build().children({model});

	t.deepEqual(
		parent.reducer(undefined, parent.actions.model.child.action1()),
		{model: {child: 1}}
	)

	t.deepEqual(
		spyReducer.args[3][0],
		undefined
	)

	t.deepEqual(
		spyReducer.args[4][0],
		0
	)

	t.deepEqual(
		spyReducer.args[4][1],
		{type: 'type1'}
	)

	parent.reducer({model: {child: 7}}, parent.actions.model.child.action2());

	t.deepEqual(
		spyReducer.args[5][0],
		7
	)

	t.deepEqual(
		spyReducer.args[5][1],
		{type: 'action2'}
	)
	
	t.end();
})


test('External reducers. List', (t) => {
	const spyReducer = spy(reducer);
	const child = createList({ reducer: spyReducer, actions });
	const model = build().children({child});

	t.deepEqual(
		model.reducer({child: {items: [11, 22]}}, model.actions.child.item(1).action1()),
		{child: {items: [11, 23]}}
	)

	t.deepEqual(
		spyReducer.args[0][0],
		22
	)

	t.deepEqual(
		spyReducer.args[0][1],
		{type: 'type1'}
	)

	t.deepEqual(
		model.reducer({child: {items: [110, 102]}}, model.actions.child.item(1).action2()),
		{
			child: {items: [
				110,
				101
			]}
		}
	)

	t.deepEqual(
		spyReducer.args[1][0],
		102
	)

	t.deepEqual(
		spyReducer.args[1][1],
		{type: 'action2'}
	)

	t.end();
})