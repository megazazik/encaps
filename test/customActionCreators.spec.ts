import test from 'tape';
import { build } from '../src/controller';
import { IAction } from '../src/types';

test('simple effects', (t) => {
	const model = build()
		.initState((state) => ({...state, value: 0}))
		.handlers({
			simpleAction: (state, action: IAction<number>) => ({...state, value: action.payload})
		})
		.actionCreator(
			'testEffect',
			(actions) => (payload: number) => () => actions.simpleAction(payload * 2)
		);
	
	t.deepEqual(
		model.actions.testEffect(10)(),
		{type: 'simpleAction', payload: 20}
	);

	t.end();
});

test('simple multiple effects', (t) => {
	const model = build()
		.initState((state) => ({...state, value: 0}))
		.handlers({
			simpleAction: (state, action: IAction<number>) => ({...state, value: action.payload})
		})
		.actionCreators({
			ef1: (actions) => (payload: number) => () => actions.simpleAction(payload * 2),
			ef2: (actions) => (payload: number) => () => actions.simpleAction(payload / 2),
		});
	
	t.deepEqual(
		model.actions.ef1(10)(),
		{type: 'simpleAction', payload: 20}
	);

	t.deepEqual(
		model.actions.ef2(10)(),
		{type: 'simpleAction', payload: 5}
	);

	t.end();
});

test('children effects', (t) => {
	const grandChild = build()
		.initState((state) => ({...state, value: 0}))
		.handlers({
			simpleAction: (state, action: IAction<number>) => ({...state, value: action.payload})
		})
		.actionCreator(
			'testEffect',
			(actions) => (payload: number) => () => actions.simpleAction(payload * 2)
		);

	const child = build().child('grandChild', grandChild);
	
	t.deepEqual(
		grandChild.actions.testEffect(10)(),
		{type: 'simpleAction', payload: 20}
	);

	t.deepEqual(
		child.actions.grandChild.testEffect(10)(),
		{type: 'grandChild.simpleAction', payload: 20}
	);

	const parent = build().child('child', child);

	t.deepEqual(
		parent.actions.child.grandChild.testEffect(10)(),
		{type: 'child.grandChild.simpleAction', payload: 20}
	);

	t.end();
});

test('simple effect select', (t) => {
	const model = build()
		.initState((state) => ({...state, value: 0}))
		.handlers({
			simpleAction: (state, action: IAction<number>) => ({...state, value: action.payload})
		})
		.actionCreator(
			'testEffect',
			(actions, select) => () => select
		);
	
	t.deepEqual(
		model.actions.testEffect()({value: 20}),
		{value: 20}
	);

	t.end();
});

test('simple multiple effect select', (t) => {
	const model = build()
		.initState((state) => ({...state, value: 0}))
		.handlers({
			simpleAction: (state, action: IAction<number>) => ({...state, value: action.payload})
		})
		.actionCreators({
			ef1: (actions, select) => () => select,
			ef2: (actions, select) => () => select,
		});
	
	t.deepEqual(
		model.actions.ef1()({value: 20}),
		{value: 20}
	);

	t.deepEqual(
		model.actions.ef2()({value: 5}),
		{value: 5}
	);

	t.end();
});

test('children effect select', (t) => {
	const grandChild = build()
		.initState((state) => ({...state, value: 0}))
		.handlers({
			simpleAction: (state, action: IAction<number>) => ({...state, value: action.payload})
		})
		.actionCreator(
			'testEffect',
			(actions, select) => (state) => select(state).value
		);

	const child = build().child('grandChild', grandChild);
	const parent = build().child('child', child);
	const grandParent = build().child('parent', parent);
	
	t.equal(
		grandChild.actions.testEffect({value: 20}),
		20
	);

	t.deepEqual(
		child.actions.grandChild.testEffect({grandChild: {value: 11}}),
		11
	);

	t.deepEqual(
		parent.actions.child.grandChild.testEffect({child: {grandChild: {value: 33}}}),
		33
	);

	t.deepEqual(
		grandParent.actions.parent.child.grandChild.testEffect({parent: {child: {grandChild: {value: 25}}}}),
		25
	);

	t.end();
});
