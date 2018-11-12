import test from 'tape';
import { build, IAction } from '../src';
import { createList } from '../src/list';

const grandChild = build()
	.initState(() => ({gc: false}))
	.handlers({
		gca: (state, {payload}: IAction<boolean>) => ({...state, gc: payload}),
	})

const child = build()
	.initState(() => ({v1: '', v2: 0}))
	.handlers({
		a1: (state, {payload}: IAction<string>) => ({...state, v1: payload}),
		a2: (state, {payload}: IAction<number>) => ({...state, v2: payload}),
	})
	.child('GrandChild', grandChild);

test("List actions", (t) => {
	const list = createList(child);

	t.deepEqual(
		list.actions.add(1),
		{type: 'add', payload: 1}
	);

	t.deepEqual(
		list.actions.subtract(1),
		{type: 'subtract', payload: 1}
	);

	t.deepEqual(
		list.actions.insert(1),
		{type: 'insert', payload: 1}
	);

	t.deepEqual(
		list.actions.remove(1),
		{type: 'remove', payload: 1}
	);

	t.deepEqual(
		list.actions.item(1).a1('i1a1'),
		{type: 'item.1.a1', payload: 'i1a1'}
	);

	t.deepEqual(
		list.actions.item(1).a2(12),
		{type: 'item.1.a2', payload: 12}
	);

	t.deepEqual(
		list.actions.item(3).GrandChild.gca(true),
		{type: 'item.3.GrandChild.gca', payload: true}
	);

	t.end();
});

test("List actions in parent", (t) => {
	const list = createList(child);
	const parent = build().child('list', list);

	t.deepEqual(
		parent.actions.list.add(1),
		{type: 'list.add', payload: 1}
	);

	t.deepEqual(
		parent.actions.list.subtract(1),
		{type: 'list.subtract', payload: 1}
	);

	t.deepEqual(
		parent.actions.list.insert(1),
		{type: 'list.insert', payload: 1}
	);

	t.deepEqual(
		parent.actions.list.remove(1),
		{type: 'list.remove', payload: 1}
	);

	t.deepEqual(
		parent.actions.list.item(1).a1('i1a1'),
		{type: 'list.item.1.a1', payload: 'i1a1'}
	);

	t.deepEqual(
		parent.actions.list.item(1).a2(12),
		{type: 'list.item.1.a2', payload: 12}
	);

	t.deepEqual(
		parent.actions.list.item(3).GrandChild.gca(true),
		{type: 'list.item.3.GrandChild.gca', payload: true}
	);

	t.end();
});

test("List actions in grand parent", (t) => {
	const list = createList(child);
	const parent = build().child('list', list);
	const grandParent = build().child('parent', parent);

	t.deepEqual(
		grandParent.actions.parent.list.add(1),
		{type: 'parent.list.add', payload: 1}
	);

	t.deepEqual(
		grandParent.actions.parent.list.subtract(1),
		{type: 'parent.list.subtract', payload: 1}
	);

	t.deepEqual(
		grandParent.actions.parent.list.insert(1),
		{type: 'parent.list.insert', payload: 1}
	);

	t.deepEqual(
		grandParent.actions.parent.list.remove(1),
		{type: 'parent.list.remove', payload: 1}
	);

	t.deepEqual(
		grandParent.actions.parent.list.item(1).a1('i1a1'),
		{type: 'parent.list.item.1.a1', payload: 'i1a1'}
	);

	t.deepEqual(
		grandParent.actions.parent.list.item(1).a2(12),
		{type: 'parent.list.item.1.a2', payload: 12}
	);

	t.deepEqual(
		grandParent.actions.parent.list.item(3).GrandChild.gca(true),
		{type: 'parent.list.item.3.GrandChild.gca', payload: true}
	);

	t.end();
});

test("List own actions reducer", (t) => {
	const list = createList(child);

	t.deepEqual(
		list.reducer(),
		{items: []}
	);

	t.deepEqual(
		list.reducer(undefined, list.actions.add()),
		{items: [child.reducer()]}
	);

	t.deepEqual(
		list.reducer(undefined, list.actions.add(3)),
		{items: [child.reducer(), child.reducer(), child.reducer()]}
	);

	t.deepEqual(
		list.reducer({items: [child.reducer()]}, list.actions.add(1)),
		{items: [child.reducer(), child.reducer()]}
	);

	t.deepEqual(
		list.reducer(undefined, list.actions.subtract(3)),
		{items: []}
	);

	t.deepEqual(
		list.reducer({items: [child.reducer(), child.reducer(), child.reducer()]}, list.actions.subtract()),
		{items: [child.reducer(), child.reducer()]}
	);

	t.deepEqual(
		list.reducer({items: [child.reducer(), child.reducer(), child.reducer()]}, list.actions.subtract(2)),
		{items: [child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.remove(0)
		),
		{items: [{v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.remove(1)
		),
		{items: [child.reducer(), child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.remove(2)
		),
		{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.remove(3)
		),
		{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			undefined,
			list.actions.insert(0)
		),
		{items: [child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			undefined,
			list.actions.insert(3)
		),
		{items: [child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			{items: [{v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.insert(0)
		),
		{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			{items: [{v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.insert(1)
		),
		{items: [{v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer(), child.reducer()]}
	);

	t.deepEqual(
		list.reducer(
			{items: [{v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.insert(2)
		),
		{items: [{v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer(), child.reducer()]}
	);

	t.end();
});

test('List child action reducer', (t) => {
	const list = createList(child);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.item(0).a1('s1')
		),
		{items: [
			{v1: 's1', v2: 0, GrandChild: {gc: false}},
			{v1: '', v2: 10, GrandChild: {gc: true}},
			child.reducer(),
		]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.item(1).a2(11)
		),
		{items: [
			child.reducer(),
			{v1: '', v2: 11, GrandChild: {gc: true}},
			child.reducer(),
		]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.item(1).GrandChild.gca(false)
		),
		{items: [
			child.reducer(),
			{v1: '', v2: 10, GrandChild: {gc: false}},
			child.reducer(),
		]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.item(2).a1('s2')
		),
		{items: [
			child.reducer(),
			{v1: '', v2: 10, GrandChild: {gc: true}},
			{v1: 's2', v2: 0, GrandChild: {gc: false}},
		]}
	);

	t.deepEqual(
		list.reducer(
			{items: [child.reducer(), {v1: '', v2: 10, GrandChild: {gc: true}}, child.reducer()]},
			list.actions.item(3).a1('s2')
		),
		{items: [
			child.reducer(),
			{v1: '', v2: 10, GrandChild: {gc: true}},
			child.reducer(),
		]}
	);

	t.end();
});

test('List parent actions', (t) => {
	const list = createList(child);

	const parent = build()
	.child('List', list);

	t.deepEqual(
		parent.actions.List.add(3),
		{type: 'List.add', payload: 3}
	);

	t.deepEqual(
		parent.actions.List.insert(2),
		{type: 'List.insert', payload: 2}
	);

	t.deepEqual(
		parent.actions.List.item(3).a1('a1'),
		{type: 'List.item.3.a1', payload: 'a1'}
	);

	t.deepEqual(
		parent.actions.List.item(3).GrandChild.gca(true),
		{type: 'List.item.3.GrandChild.gca', payload: true}
	);

	t.end();
});

test('List parent action reducer', (t) => {
	const list = createList(child);

	const parent = build()
	.child('List', list);

	t.deepEqual(
		parent.reducer(),
		{List: {items: []}}
	);

	t.deepEqual(
		parent.reducer(
			{List: {items: [child.reducer()]}},
			parent.actions.List.item(0).a1('s1')
		),
		{List: {items: [{v1: 's1', v2: 0, GrandChild: {gc: false}}]}}
	);

	t.end();
});


test('Nested lists actions', (t) => {
	const childList = createList(child);

	const parentList = createList(childList);

	t.deepEqual(
		parentList.actions.item(10).add(3),
		{type: 'item.10.add', payload: 3}
	);

	t.deepEqual(
		parentList.actions.item(10).item(5).GrandChild.gca(true),
		{type: 'item.10.item.5.GrandChild.gca', payload: true}
	);

	const grandParent = build().child('List', parentList);

	t.deepEqual(
		grandParent.actions.List.item(10).add(3),
		{type: 'List.item.10.add', payload: 3}
	);

	t.deepEqual(
		grandParent.actions.List.item(10).item(5).GrandChild.gca(true),
		{type: 'List.item.10.item.5.GrandChild.gca', payload: true}
	);

	t.end();
});

test('Nested lists reducer', (t) => {
	const childList = createList(child);

	const parentList = createList(childList);

	t.deepEqual(
		parentList.reducer(),
		{items: []}
	);

	t.deepEqual(
		parentList.reducer(undefined, parentList.actions.add()),
		{items: [{items:[]}]}
	);

	t.deepEqual(
		parentList.reducer(
			{items: [{items:[]}]},
			parentList.actions.item(0).add()
		),
		{items: [{items:[{ v1: '', v2: 0, GrandChild: {gc: false} }]}]}
	);

	t.deepEqual(
		parentList.reducer(
			{items: [{items:[{ v1: '', v2: 0, GrandChild: {gc: false} }]}]},
			parentList.actions.item(0).item(0).GrandChild.gca(true)
		),
		{items: [{items:[{ v1: '', v2: 0, GrandChild: {gc: true} }]}]}
	);

	t.end();
});