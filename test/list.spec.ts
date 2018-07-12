import test from 'tape';
import { build, IAction } from '../src';
import { createList } from '../src/list';

const grandChild = build()
.setInitState(() => ({gc: false}))
.action({
	gca: (state, {payload}: IAction<boolean>) => ({...state, gc: payload}),
})

const child = build()
.setInitState(() => ({v1: '', v2: 0}))
.action({
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
