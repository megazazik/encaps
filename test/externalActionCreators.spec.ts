import test from 'tape';
import { build } from '../src/controller';
import { createList } from '../src/list';
import { createMap } from '../src/map';
import { IActionCreator, ICommonActionCreator, IAction, ICommonAction, Action } from '../src/types';

const reducer = (state = {value: 1}, action) => {
	switch (action.type) {
		case 'type1':
			return {...state};
		default:
			return state;
	}
}

const actions = {
	type1() {
		return {type: 'type1'}
	},
	type2(value: string) {
		return {type: 'TYPE_2', value};
	},
	type3(value: string) {
		return {type: 'TYPE_3', payload: value};
	},
	type4(value: string, value2: number) {
		return {type: 'type4', value, value2};
	}
};

actions.type2.toString = () => 'TYPE_2';
actions.type4.toString = () => 'type4';

test('externalActionCreators. simple', (t) => {
	const model = build({reducer, actions});

	t.deepEqual(model.actions.type1(), {type: 'type1'});
	t.deepEqual(model.actions.type2('v2'), {type: 'TYPE_2', value: 'v2'});
	t.deepEqual(model.actions.type3('v3'), {type: 'TYPE_3', payload: 'v3'});
	t.deepEqual(model.actions.type4('v4', 4), {type: 'type4', value: 'v4', value2: 4});

	t.end();
});

test('externalActionCreators. child', (t) => {
	const model = build({reducer, actions});
	const parent = build()
		.children({child: model});

	t.deepEqual(parent.actions.child.type1(), {type: 'child.type1'});
	t.deepEqual(parent.actions.child.type2('v2'), {type: 'child.TYPE_2', value: 'v2'});
	t.deepEqual(parent.actions.child.type3('v3'), {type: 'child.TYPE_3', payload: 'v3'});
	t.deepEqual(parent.actions.child.type4('v4', 4), {type: 'child.type4', value: 'v4', value2: 4});

	t.end();
});

test('externalActionCreators. grand child', (t) => {
	const model = build({reducer, actions});
	const parent = build()
		.children({child: model});
	const grandParent = build()
		.children({parent});

	t.deepEqual(grandParent.actions.parent.child.type1(), {type: 'parent.child.type1'});
	t.deepEqual(grandParent.actions.parent.child.type2('v2'), {type: 'parent.child.TYPE_2', value: 'v2'});
	t.deepEqual(grandParent.actions.parent.child.type3('v3'), {type: 'parent.child.TYPE_3', payload: 'v3'});
	t.deepEqual(grandParent.actions.parent.child.type4('v4', 4), {type: 'parent.child.type4', value: 'v4', value2: 4});

	t.end();
});

test('externalActionCreators. sub actions', (t) => {
	const model = build({reducer, actions});
	const parent = build()
		.children({child: model});
	const grandParent = build()
		.children({parent1: parent, parent2: parent})
		.subActions({
			parent1: {
				child: (action, actions) => {
					if (action.type === 'parent1.child.TYPE_2') {
						return actions.parent2.child.type4(action.value, 10);
					}
					if (action.type === 'parent1.child.TYPE_3') {
						return actions.parent2.child.type4(action.payload, 10);
					}
				}
			}
		});

	t.deepEqual(
		grandParent.actions.parent1.child.type2('v2'),
		{
			type: 'parent1.child.TYPE_2',
			value: 'v2',
			actions: [
				{ type: 'parent2.child.type4', value: 'v2', value2: 10 }
			]
		}
	);

	t.deepEqual(
		grandParent.actions.parent1.child.type3('v3'),
		{
			type: 'parent1.child.TYPE_3',
			payload: 'v3',
			actions: [
				{ type: 'parent2.child.type4', value: 'v3', value2: 10 }
			]
		}
	);
	
	t.end();
});

test('externalActionCreators. types', (t) => {
	const model = build({reducer, actions});

	t.equal(model.actions.type1.toString(), 'type1');
	t.equal(String(model.actions.type2), 'TYPE_2');
	t.equal(model.actions.type3.toString(), 'type3');
	t.equal(String(model.actions.type4), 'type4');

	const parent = build()
		.children({child: {reducer, actions}});
	const grandParent = build()
		.children({parent1: parent, parent2: parent});

	t.equal(grandParent.actions.parent2.child.type1.toString(), 'parent2.child.type1');
	t.equal(String(grandParent.actions.parent2.child.type2), 'parent2.child.TYPE_2');
	t.equal(grandParent.actions.parent2.child.type3.toString(), 'parent2.child.type3');
	t.equal(String(grandParent.actions.parent2.child.type4), 'parent2.child.type4');

	t.end();
});

test('externalActionCreators. List', (t) => {
	const list = createList({reducer, actions})
		.handlers({
			add: (state) => ({items: [...state.items, reducer(undefined, {type: 'initaction'})]})
		});

	const parent = build()
		.children({child: list});
	const grandParent = build()
		.children({parent});

	t.deepEqual(
		grandParent.actions.parent.child.item(2).type1(),
		{
			type: 'parent.child.item.2.type1'
		}
	);

	t.deepEqual(
		grandParent.actions.parent.child.item(4).type2('v1'),
		{
			type: 'parent.child.item.4.TYPE_2',
			value: 'v1'
		}
	);

	t.deepEqual(
		grandParent.actions.parent.child.item(3).type3('v2'),
		{
			type: 'parent.child.item.3.TYPE_3',
			payload: 'v2'
		}
	);

	t.deepEqual(
		grandParent.actions.parent.child.item(3).type4('v2', 10),
		{
			type: 'parent.child.item.3.type4',
			value: 'v2',
			value2: 10
		}
	);

	t.end();
});

test('externalActionCreators. Map', (t) => {
	const list = createMap({reducer, actions})
		.handlers({
			add: (state, action: IAction<string>) => ({items: {...state.items, [action.payload]: reducer(undefined, {type: 'initaction'})}})
		});

	const parent = build()
		.children({child: list});
	const grandParent = build()
		.children({parent});

	t.deepEqual(
		grandParent.actions.parent.child.item('2').type1(),
		{
			type: 'parent.child.item.2.type1'
		}
	);

	t.deepEqual(
		grandParent.actions.parent.child.item('4').type2('v1'),
		{
			type: 'parent.child.item.4.TYPE_2',
			value: 'v1'
		}
	);

	t.deepEqual(
		grandParent.actions.parent.child.item('p3').type3('v2'),
		{
			type: 'parent.child.item.p3.TYPE_3',
			payload: 'v2'
		}
	);

	t.deepEqual(
		grandParent.actions.parent.child.item('3').type4('v2', 10),
		{
			type: 'parent.child.item.3.type4',
			value: 'v2',
			value2: 10
		}
	);

	t.end();
});
