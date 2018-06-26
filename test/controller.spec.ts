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

	t.deepEqual(builder1.reducer(), {value: true});
	t.deepEqual(builder2.reducer(), {value: true, value2: 10});
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

test("Child actions", (t) => {
	const grandchild = builder
		.action({edit: (state, action: IAction<string>) => state});
	const child = builder
		.action({
			enable: (state, action: IAction<boolean>) => state,
		})
		.child('Grandchild', grandchild);

	const child2 = builder
		.action({
			enable2: (state, action: IAction<boolean>) => state,
		});

	const parent = builder
		.child('Child', child)
		.action({parendAction: (state, action: IAction<string>) => state})
		.child('Child2', child2);

	t.deepEqual(parent.actions.Child.enable(false), {type: 'Child.enable', payload: false});
	t.deepEqual(parent.actions.Child.enable(true), {type: 'Child.enable', payload: true});
	t.deepEqual(parent.actions.Child2.enable2(true), {type: 'Child2.enable2', payload: true});
	t.deepEqual(parent.actions.Child.Grandchild.edit('test'), {type: 'Child.Grandchild.edit', payload: 'test'});

	t.end();
});

test("Child state", (t) => {
	const grandchild = builder
		.setInitState(() => ({gcValue: false}));
	const child = builder
		.child('Grandchild', grandchild)
		.setInitState((state) => ({...state, cValue: ''}));

	const child2 = builder
		.setInitState((state) => ({...state, c2Value: 1}));

	const parent = builder
		.setInitState(() => ({parentField: 10}))
		.child('Child', child)
		.child('Child2', child2);

	t.deepEqual(
		parent.reducer(), 
		{
			parentField: 10,
			Child2: {c2Value: 1},
			Child: {
				cValue: '',
				Grandchild: {
					gcValue: false
				}
			}
		}
	);

	t.end();
});

test("Child reducer", (t) => {
	const grandchild = builder
		.setInitState(() => ({gcValue: false}))
		.action({edit: (state, {payload}: IAction<boolean>) => ({...state, gcValue: payload})});
	const child = builder
		.setInitState((state) => ({...state, cValue: ''}))
		.child('Grandchild', grandchild)
		.action({
			change: (state, {payload}: IAction<string>) => ({...state, cValue: payload}),
		});

	const child2 = builder
		.setInitState((state) => ({...state, c2Value: 1}))
		.action({
			change2: (state, {payload}: IAction<number>) => ({...state, c2Value: payload}),
		});

	const parent = builder
		.child('Child', child)
		.setInitState((state) => ({...state, parentField: 10}))
		.action({
			parendAction: (state, {payload}: IAction<number>) => ({...state, parentField: payload})
		})
		.child('Child2', child2);

	t.deepEqual(
		parent.reducer(), 
		{
			parentField: 10,
			Child2: {c2Value: 1},
			Child: {
				cValue: '',
				Grandchild: {
					gcValue: false
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(undefined, parent.actions.parendAction(55)),
		{
			parentField: 55,
			Child2: {c2Value: 1},
			Child: {
				cValue: '',
				Grandchild: {
					gcValue: false
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(parent.reducer(), parent.actions.Child2.change2(66)),
		{
			parentField: 10,
			Child2: {c2Value: 66},
			Child: {
				cValue: '',
				Grandchild: {
					gcValue: false
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(parent.reducer(), parent.actions.Child.change('new')),
		{
			parentField: 10,
			Child2: {c2Value: 1},
			Child: {
				cValue: 'new',
				Grandchild: {
					gcValue: false
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(undefined, parent.actions.Child.Grandchild.edit(true)),
		{
			parentField: 10,
			Child2: {c2Value: 1},
			Child: {
				cValue: '',
				Grandchild: {
					gcValue: true
				}
			}
		}
	);

	t.end();
});

/** @todo написать тесты для обертки событий */
// test("Wrap actions", (t) => {
// 	const child = builder
// 		.setInitState((state) => ({...state, cValue: ''}))
// 		.action({
// 			change: (state, {payload}: IAction<string>) => ({...state, cValue: payload})
// 		});

// 	const child2 = builder
// 		.setInitState((state) => ({...state, c2Value: 1}))
// 		.action({
// 			change2: (state, {payload}: IAction<number>) => ({...state, c2Value: payload})
// 		});

// 	const parent = builder
// 		.child('Child', child)
// 		.child('Child2', child2);

// 	t.deepEqual(
// 		parent.initState, 
// 		{
// 			parentField: 10,
// 			Child2: {c2Value: 1},
// 			Child: {
// 				cValue: '',
// 				Grandchild: {
// 					gcValue: false
// 				}
// 			}
// 		}
// 	);

// 	t.end();
// });
