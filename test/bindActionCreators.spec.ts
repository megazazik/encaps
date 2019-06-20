import test from 'tape';
import { build } from '../src/controller';
import { IAction } from '../src/types';
import { createList } from '../src/list';
import { createMap } from '../src/map';
import { bindActionCreators } from '../src/bindActionCreators';
import { spy } from 'sinon';

test('bindActionCreators. simple', (t) => {
	const { actions } = build()
		.initState(() => ({p1: 0, p2: ''}))
		.handlers({
			setP1: 'p1',
			setP2: 'p2',
			action3: (state) => state,
		})

	const dispatch = spy(() => {});

	const boundActions = bindActionCreators(actions, dispatch);

	t.equal(typeof boundActions, 'object');

	t.deepEqual(Object.keys(boundActions), ['setP1', 'setP2', 'action3']);
	t.equal(typeof boundActions.setP1, 'function');
	t.equal(typeof boundActions.setP2, 'function');
	t.equal(typeof boundActions.action3, 'function');

	t.ok(dispatch.notCalled);

	boundActions.setP1(14);

	t.ok(dispatch.calledOnce);
	t.deepEqual(dispatch.args[0][0], {type: 'setP1', payload: 14});

	boundActions.action3();
	t.ok(dispatch.calledTwice);
	t.deepEqual(dispatch.args[1][0], {type: 'action3', payload: undefined})

	t.end();
})

test('bindActionCreators. children', (t) => {
	const grandChild = build()
		.handlers({
			a1: (state) => state
		})

	const child = build()
		.initState(() => ({}))
		.handlers({
			a1: (state, action: IAction<number>) => state,
			a2: (state) => state,
		})
		.child('grandChild', grandChild);

	const { actions } = build()
		.initState(() => ({p1: 0}))
		.handlers({
			setP1: 'p1',
		})
		.children({child})

	const dispatch = spy(() => {});

	const boundActions = bindActionCreators(actions, dispatch);

	t.equal(typeof boundActions, 'object');

	t.deepEqual(Object.keys(boundActions), ['setP1', 'child']);
	t.equal(typeof boundActions.setP1, 'function');

	t.equal(typeof boundActions.child, 'object');
	t.deepEqual(Object.keys(boundActions.child), ['a1', 'a2', 'grandChild']);
	t.equal(typeof boundActions.child.a1, 'function');

	t.ok(dispatch.notCalled);

	boundActions.child.a1(14);

	t.ok(dispatch.calledOnce);
	t.deepEqual(dispatch.args[0][0], {type: 'child.a1', payload: 14});

	boundActions.child.grandChild.a1();
	t.ok(dispatch.calledTwice);
	t.deepEqual(dispatch.args[1][0], {type: 'child.grandChild.a1', payload: undefined});

	t.end();
})

test('bindActionCreators. map', (t) => {
	const child = build()
		.initState(() => ({p1: 0}))
		.handlers({setP1: 'p1'});

	const map = createMap(child);

	const dispatch = spy(() => {});

	const boundListActions = bindActionCreators(map.actions, dispatch);

	t.equal(typeof boundListActions, 'object');
	t.deepEqual(Object.keys(boundListActions), ['item', 'add', 'remove']);

	t.equal(typeof boundListActions.item, 'function');

	t.equal(typeof boundListActions.item('0'), 'object');
	t.equal(typeof boundListActions.item('0').setP1, 'function');

	t.end();
})

test('bindActionCreators. list', (t) => {
	/** @todo написать тесты */

	t.end();
})

test('bindActionCreators. effects', (t) => {
	const model = build()
		.initState(() => ({p1: 0}))
		.handlers({setP1: 'p1'})
		.effects({
			effect1: (actions, select) => () => ({myEffect: '123'})
		});

	const dispatch = spy(() => {});
	
	const boundActions = bindActionCreators(model.actions, dispatch);

	t.equal(typeof boundActions, 'object');
	t.deepEqual(Object.keys(boundActions), ['setP1', 'effect1']);

	t.equal(typeof boundActions.effect1, 'function');
	// t.equal(typeof boundActions.effect1(), 'function');
	t.deepEqual(boundActions.effect1(), 'function');

	t.end();
})
