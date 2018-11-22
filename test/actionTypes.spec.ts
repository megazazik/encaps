import test from 'tape';
import { build } from '../src/controller';
import { IAction } from '../src/types';
import { createList } from '../src/list';
import { createMap } from '../src/map';

test("Simple actions", (t) => {
	const model = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
		});

	t.deepEqual(model.actions.enable.type, 'enable');
	t.deepEqual(model.actions.number.type, 'number');

	t.end();
});

test("Parent actions", (t) => {
	const model = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
		});

	const parent = build()
		.child('child', model);

	t.deepEqual(parent.actions.child.enable.type, 'child.enable');
	t.deepEqual(parent.actions.child.number.type, 'child.number');

	const grandParent = build().children({parent});

	t.deepEqual(grandParent.actions.parent.child.enable.type, 'parent.child.enable');
	t.deepEqual(grandParent.actions.parent.child.number.type, 'parent.child.number');

	t.end();
});

test("List actions", (t) => {
	const model = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
		});

	const list = createList(model);

	t.deepEqual(list.actions.item(0).enable.type, 'item.0.enable');
	t.deepEqual(list.actions.item(1).number.type, 'item.1.number');

	t.end();
});

test("Map actions", (t) => {
	const model = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
		});

	const list = createMap(model);

	t.deepEqual(list.actions.item('0').enable.type, 'item.0.enable');
	t.deepEqual(list.actions.item('i1').number.type, 'item.i1.number');

	t.end();
});
