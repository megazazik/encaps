import test from 'tape';
import { build } from '../src/controller';
import { IAction } from '../src/types';
import { createList } from '../src/list';
import { createMap } from '../src/map';

test("Simple actions", (t) => {
	const model = build()
		.initState(() => ({v: 0}))
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
			setV: 'v',
		});

	t.equal(model.actions.enable.toString(), 'enable');
	t.equal(String(model.actions.number), 'number');
	t.equal(String(model.actions.setV), 'setV');

	t.end();
});

test("Parent actions", (t) => {
	const model = build()
		.initState(() => ({v: 0}))
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
			setV: 'v',
		});

	const parent = build()
		.child('child', model);

	t.equal(parent.actions.child.enable.toString(), 'child.enable');
	t.equal(String(parent.actions.child.number), 'child.number');
	t.equal(String(parent.actions.child.setV), 'child.setV');

	const grandParent = build().children({parent});

	t.equal(grandParent.actions.parent.child.enable.toString(), 'parent.child.enable');
	t.equal(String(grandParent.actions.parent.child.number), 'parent.child.number');
	t.equal(String(grandParent.actions.parent.child.setV), 'parent.child.setV');

	t.end();
});

test("List actions", (t) => {
	const model = build()
		.initState(() => ({v: 0}))
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
			setV: 'v',
		});

	const list = createList(model);

	t.equal(list.actions.item(0).enable.toString(), 'item.0.enable');
	t.equal(String(list.actions.item(1).number), 'item.1.number');
	t.equal(String(list.actions.item(1).setV), 'item.1.setV');
	
	t.end();
});

test("Map actions", (t) => {
	const model = build()
		.initState(() => ({v: 0}))
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
			setV: 'v',
		});

	const list = createMap(model);

	t.equal(list.actions.item('0').enable.toString(), 'item.0.enable');
	t.equal(String(list.actions.item('i1').number), 'item.i1.number');
	t.equal(String(list.actions.item('i1').setV), 'item.i1.setV');

	t.end();
});
