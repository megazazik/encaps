import test from 'tape';
import { builder, IAction } from '../src';
import { spy } from 'sinon';

test("Simple actions", (t) => {
	const controller = builder
		.action({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
		});

	t.deepEqual(controller.actions.enable(false), {type: 'enable', payload: false});
	t.deepEqual(controller.actions.enable(true), {type: 'enable', payload: true});
	t.deepEqual(controller.actions.number(10), {type: 'number', payload: 10});

	t.end();
});

test("Initial State", (t) => {
	const builder1 = builder
		.setInitState((state) => ({...state, value: true}));

	const initState = spy((s) => ({...s, value2: 10}));
	const builder2 = builder1.setInitState(initState);

	t.deepEqual(builder1.getInitState(), {value: true});
	t.deepEqual(builder2.getInitState(), {value: true, value2: 10});
	t.deepEqual(initState.args[0][0], {value: true});

	t.end();
});

test("Reducers", (t) => {
	const builder1 = builder
		.setInitState((state) => ({...state, value1: false, value2: 1}))
		.action({
			value1Change: (state, {payload}: IAction<boolean>) => ({...state, value1: payload}),
			value2Change: (state, action) => ({...state, value1: 10}),
		});

	t.ok(!!builder1);
	// t.deepEqual(builder1.getInitState(), {value: true});
	// t.deepEqual(builder2.getInitState(), {value: true, value2: 10});
	// t.deepEqual(initState.args[0][0], {value: true});

	t.end();
});

