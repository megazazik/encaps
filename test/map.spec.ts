import test from 'tape';
import { build, IAction } from '../src';
import { createMap } from '../src/map';

const grandChild = build()
	.initState(() => ({gc: false}))
	.handlers({
		gca: (state, {payload}: IAction<boolean>) => ({...state, gc: payload}),
	})
	.effect('testEffect', (actions, select) => (state) => ({action: actions.gca(true), state: select(state)}))

const child = build()
	.initState(() => ({v1: '', v2: 0}))
	.handlers({
		a1: (state, {payload}: IAction<string>) => ({...state, v1: payload}),
		a2: (state, {payload}: IAction<number>) => ({...state, v2: payload}),
	})
	.child('GrandChild', grandChild);

test("Map actions", (t) => {
	const list = createMap(child)
		.handlers({
			add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: child.reducer(undefined, {type: ''})}})
		});

	t.deepEqual(
		list.actions.add('new'),
		{type: 'add', payload: 'new'}
	);

	t.deepEqual(
		list.actions.item('Item').a1('i1a1'),
		{type: 'item.Item.a1', payload: 'i1a1'}
	);

	t.deepEqual(
		list.actions.item('item2').a2(12),
		{type: 'item.item2.a2', payload: 12}
	);

	t.deepEqual(
		list.actions.item('child').GrandChild.gca(true),
		{type: 'item.child.GrandChild.gca', payload: true}
	);

	t.end();
});

test("Map actions in parent", (t) => {
	const map = createMap(child)
		.handlers({
			add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: child.reducer(undefined, {type: ''})}})
		});

	const parent = build().child('map', map);

	t.deepEqual(
		parent.actions.map.add('new'),
		{type: 'map.add', payload: 'new'}
	);

	t.deepEqual(
		parent.actions.map.item('Item').a1('i1a1'),
		{type: 'map.item.Item.a1', payload: 'i1a1'}
	);

	t.deepEqual(
		parent.actions.map.item('item2').a2(12),
		{type: 'map.item.item2.a2', payload: 12}
	);

	t.deepEqual(
		parent.actions.map.item('child').GrandChild.gca(true),
		{type: 'map.item.child.GrandChild.gca', payload: true}
	);

	t.end();
});

test("Map actions in grand parent", (t) => {
	const map = createMap(child)
		.handlers({
			add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: child.reducer(undefined, {type: ''})}})
		});
	const parent = build().child('map', map);
	const grandParent = build().child('parent', parent);

	t.deepEqual(
		grandParent.actions.parent.map.add('new'),
		{type: 'parent.map.add', payload: 'new'}
	);

	t.deepEqual(
		grandParent.actions.parent.map.item('Item').a1('i1a1'),
		{type: 'parent.map.item.Item.a1', payload: 'i1a1'}
	);

	t.deepEqual(
		grandParent.actions.parent.map.item('item2').a2(12),
		{type: 'parent.map.item.item2.a2', payload: 12}
	);

	t.deepEqual(
		grandParent.actions.parent.map.item('child').GrandChild.gca(true),
		{type: 'parent.map.item.child.GrandChild.gca', payload: true}
	);

	t.end();
});

test("Map own actions reducer", (t) => {
	const list = createMap(child)
		.handlers({
			add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: child.reducer(undefined, {type: ''})}})
		});

	t.deepEqual(
		list.reducer(),
		{items: {}}
	);

	t.deepEqual(
		list.reducer(undefined, list.actions.add('item3')),
		{items: {item3: child.reducer()}}
	);

	t.deepEqual(
		list.reducer({items: {i: child.reducer()}}, list.actions.add('item2')),
		{items: {i: child.reducer(), item2: child.reducer()}}
	);

	t.end();
});

test('List child action reducer', (t) => {
	const list = createMap(child);

	t.deepEqual(
		list.reducer(
			{items: {i1: child.reducer(), i2: {v1: '', v2: 10, GrandChild: {gc: true}}, i3: child.reducer()}},
			list.actions.item('i1').a1('s1')
		),
		{items: {
			i1: {v1: 's1', v2: 0, GrandChild: {gc: false}},
			i2: {v1: '', v2: 10, GrandChild: {gc: true}},
			i3: child.reducer(),
		}}
	);

	t.deepEqual(
		list.reducer(
			{items: {i1: child.reducer(), i2: {v1: '', v2: 10, GrandChild: {gc: true}}, i3: child.reducer()}},
			list.actions.item('i2').a2(11)
		),
		{items: {
			i1: child.reducer(),
			i2: {v1: '', v2: 11, GrandChild: {gc: true}},
			i3: child.reducer(),
		}}
	);

	t.deepEqual(
		list.reducer(
			{items: {i1: child.reducer(), i2: {v1: '', v2: 10, GrandChild: {gc: true}}, i3: child.reducer()}},
			list.actions.item('i2').GrandChild.gca(false)
		),
		{items: {
			i1: child.reducer(),
			i2: {v1: '', v2: 10, GrandChild: {gc: false}},
			i3: child.reducer(),
		}}
	);

	t.deepEqual(
		list.reducer(
			{items: {i1: child.reducer(), i2: {v1: '', v2: 10, GrandChild: {gc: true}}, i3: child.reducer()}},
			list.actions.item('i4').GrandChild.gca(false)
		),
		{items: {
			i1: child.reducer(),
			i2: {v1: '', v2: 10, GrandChild: {gc: true}},
			i3: child.reducer(),
		}}
	);

	t.end();
});

test('Map parent actions', (t) => {
	const list = createMap(child)
		.handlers({
			add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: child.reducer(undefined, {type: ''})}})
		});

	const parent = build()
	.child('List', list);

	t.deepEqual(
		parent.actions.List.add('i1'),
		{type: 'List.add', payload: 'i1'}
	);

	t.deepEqual(
		parent.actions.List.item('i1').a1('a1'),
		{type: 'List.item.i1.a1', payload: 'a1'}
	);

	t.deepEqual(
		parent.actions.List.item('i3').GrandChild.gca(true),
		{type: 'List.item.i3.GrandChild.gca', payload: true}
	);

	t.end();
});

test('Map parent action reducer', (t) => {
	const list = createMap(child);

	const parent = build()
	.child('List', list);

	t.deepEqual(
		parent.reducer(),
		{List: {items: {}}}
	);

	t.deepEqual(
		parent.reducer(
			{List: {items: {i1: child.reducer()}}},
			parent.actions.List.item('i1').a1('s1')
		),
		{List: {items: {i1: {v1: 's1', v2: 0, GrandChild: {gc: false}}}}}
	);

	t.end();
});


test('Sub actions creators', (t) => {
	const listItem = build()
		.initState((state) => ({...state, li: 'b'}))
		.handlers({
			liChange: (state, {payload}: IAction<string>) => ({...state, li: payload})
		});

	
	const grandChild1 = createMap(listItem)
		.handlers({
			add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: listItem.reducer(undefined, {type: ''})}})
		});

	const child = build()
		.initState((state) => ({...state, c1: 'a'}))
		.handlers({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.subActions({
			change: ({payload}, actions) => actions.GrandChild1.item(payload).liChange(payload),
			GrandChild1: {
				add: ({payload}, actions) => actions.change(payload)
			}
		})
		.model;

	t.deepEqual(
		child.reducer(
			child.reducer(undefined, child.actions.GrandChild1.add('test_string')), 
			child.actions.change('test_string')
		),
		{
			c1: 'test_string',
			GrandChild1: {items:{test_string: {li: 'test_string'}}}
		},
	);

	t.end();
});

/** @todo разнести тесты на select и actions*/
test('map child effect', (t) => {
	const childList = createMap(child);
	
	t.deepEqual(
		childList.actions.item('c2').GrandChild.testEffect(
			{
				items: {
					c0: { v1: '', v2: 0, GrandChild: {} },
					csdf: { v1: '', v2: 0, GrandChild: {} },
					c2: { v1: '', v2: 0, GrandChild: {value: 111} } 
				}
			}
		),
		{
			action: {type: 'item.c2.GrandChild.gca', payload: true},
			state: {value: 111}
		}
	);

	t.deepEqual(
		childList.actions.item("c5").GrandChild.testEffect(
			{
				items: [
					{ v1: '', v2: 0, GrandChild: {} },
					{ v1: '', v2: 0, GrandChild: {} },
					{ v1: '', v2: 0, GrandChild: {value: 111} } 
				]
			}
		),
		{
			action: {type: 'item.c5.GrandChild.gca', payload: true},
			state: undefined
		}
	);

	const parentList = createMap(childList);

	t.deepEqual(
		parentList.actions.item('c1').item('cg2').GrandChild.testEffect(
			{
				items: {
					c0: {},
					c1: {
						items: {
							gc0: { v1: '', v2: 0, GrandChild: {} },
							gc1: { v1: '', v2: 0, GrandChild: {} },
							cg2: { v1: '', v2: 0, GrandChild: {value: 121} }
						}
					}
				}
			}
		),
		{
			action: {type: 'item.c1.item.cg2.GrandChild.gca', payload: true},
			state: {value: 121}
		}
	);

	t.end();
});