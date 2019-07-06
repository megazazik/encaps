import test from 'tape';
import { build } from '../src/controller';
import { createList } from '../src/list';
import { createMap } from '../src/map';
import { spy } from 'sinon';

const reducer = (state = {}, action) => {
	switch (action.type) {
		case 'type1':
			return {...state};
		case 'action2':
			return {value: action.value, value2: action.value2};
		default:
			return state;
	}
}

const actions = {
	action1: () => ({type: 'type1', payload: 10}),
	action2: (value: string, value2: number) => ({type: 'action2', value, value2})
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
		{child: {}}	
	)

	t.deepEqual(
		spyReducer.args[0][0],
		undefined
	)

	t.deepEqual(
		spyReducer.args[1][0],
		{}
	)

	t.deepEqual(
		spyReducer.args[1][1],
		{type: 'type1', payload: 10}
	)

	model.reducer({child: {}}, model.actions.child.action2('str', 13));

	t.deepEqual(
		spyReducer.args[2][0],
		{}
	)

	t.deepEqual(
		spyReducer.args[2][1],
		{type: 'action2', value: 'str', value2: 13}
	)

	const parent  = build().children({model});

	t.deepEqual(
		parent.reducer(undefined, parent.actions.model.child.action1()),
		{model: {child: {}}}
	)

	t.deepEqual(
		spyReducer.args[3][0],
		undefined
	)

	t.deepEqual(
		spyReducer.args[4][0],
		{}
	)

	t.deepEqual(
		spyReducer.args[4][1],
		{type: 'type1', payload: 10}
	)

	parent.reducer({model: {child: {}}}, parent.actions.model.child.action2('str1', 15));

	t.deepEqual(
		spyReducer.args[5][0],
		{}
	)

	t.deepEqual(
		spyReducer.args[5][1],
		{type: 'action2', value: 'str1', value2: 15}
	)
	
	t.end();
})


test('External reducers. Children', (t) => {
	const spyReducer = spy(reducer);
	const child = createList({ reducer: spyReducer, actions });
	const model = build().children({child});

	t.deepEqual(
		model.reducer({child: {items: [{}, {}]}}, model.actions.child.item(1).action1()),
		{child: {items: [{}, {}]}}
	)

	t.deepEqual(
		spyReducer.args[0][0],
		{}
	)

	t.deepEqual(
		spyReducer.args[0][1],
		{type: 'type1', payload: 10}
	)

	t.deepEqual(
		model.reducer({child: {items: [{}, {}]}}, model.actions.child.item(1).action2('str2', 11)),
		{
			child: {items: [
				{},
				{value: 'str2', value2: 11}
			]}
		}
	)

	t.deepEqual(
		spyReducer.args[1][0],
		{}
	)

	t.deepEqual(
		spyReducer.args[1][1],
		{type: 'action2', value: 'str2', value2: 11}
	)

	t.end();
})