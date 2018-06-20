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
	const value1Change = spy((state, {payload}: IAction<boolean>) => ({...state, value1: payload}));
	const value2Change = spy((state, action: IAction<number>) => ({...state, value2: action.payload}));
	const controller = builder
		.setInitState((state) => ({...state, value1: false, value2: 1}))
		.action({
			value1Change,
			value2Change,
		});

	let newState = controller.reducer(
		undefined,
		controller.actions.value1Change(true)
	);
	
	t.equal(value1Change.callCount, 1);
	t.deepEqual(value1Change.args[0][0], {value1: false, value2: 1});
	t.deepEqual(newState, {value1: true, value2: 1});
	t.equal(value2Change.callCount, 0);

	newState = controller.reducer(
		newState,
		controller.actions.value2Change(10)
	);

	t.equal(value1Change.callCount, 1);
	t.deepEqual(value2Change.args[0][0], {value1: true, value2: 1});
	t.deepEqual(newState, {value1: true, value2: 10});
	t.equal(value2Change.callCount, 1);

	t.end();
});


