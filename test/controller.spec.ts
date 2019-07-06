import test from 'tape';
import { build, getSubActions, decomposeKeys } from '../src/controller';
import { IAction } from '../src/types';
import { spy } from 'sinon';

test("Simple actions", (t) => {
	const model = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
			number: (state, action: IAction<number>) => state,
		});

	t.deepEqual(model.actions.enable(false), {type: 'enable', payload: false});
	t.deepEqual(model.actions.enable(true), {type: 'enable', payload: true});
	t.deepEqual(model.actions.number(10), {type: 'number', payload: 10});

	t.end();
});

test("Initial State", (t) => {
	const builder1 = build()
		.initState((state) => ({...state, value: true}));

	const initState = spy((s) => ({...s, value2: 10}));
	const builder2 = builder1.initState(initState);

	t.deepEqual(builder1.reducer(), {value: true});
	t.deepEqual(builder2.reducer(), {value: true, value2: 10});
	t.deepEqual(initState.args[0][0], {value: true});

	t.end();
});

test("Reducers", (t) => {
	const value1Change = spy((state, {payload}: IAction<boolean>) => ({...state, value1: payload}));
	const value2Change = spy((state, action: IAction<number>) => ({...state, value2: action.payload}));
	const model = build()
		.initState((state) => ({...state, value1: false, value2: 1}))
		.handlers({
			value1Change,
			value2Change,
		});

	let newState = model.reducer(
		undefined,
		model.actions.value1Change(true)
	);
	
	t.equal(value1Change.callCount, 1);
	t.deepEqual(value1Change.args[0][0], {value1: false, value2: 1});
	t.deepEqual(newState, {value1: true, value2: 1});
	t.equal(value2Change.callCount, 0);

	newState = model.reducer(
		newState,
		model.actions.value2Change(10)
	);

	t.equal(value1Change.callCount, 1);
	t.deepEqual(value2Change.args[0][0], {value1: true, value2: 1});
	t.deepEqual(newState, {value1: true, value2: 10});
	t.equal(value2Change.callCount, 1);

	t.end();
});

test("Child actions", (t) => {
	const grandchild = build()
		.handlers({edit: (state, action: IAction<string>) => state});
	const child = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
		})
		.child('Grandchild', grandchild);

	const child2 = build()
		.handlers({
			enable2: (state, action: IAction<boolean>) => state,
		});

	const parent = build()
		.child('Child', child)
		.handlers({parendAction: (state, action: IAction<string>) => state})
		.child('Child2', child2);

	t.deepEqual(parent.actions.Child.enable(false), {type: 'Child.enable', payload: false});
	t.deepEqual(parent.actions.Child.enable(true), {type: 'Child.enable', payload: true});
	t.deepEqual(parent.actions.Child2.enable2(true), {type: 'Child2.enable2', payload: true});
	t.deepEqual(parent.actions.Child.Grandchild.edit('test'), {type: 'Child.Grandchild.edit', payload: 'test'});

	t.end();
});

test("Child state", (t) => {
	const grandchild = build()
		.initState(() => ({gcValue: false}));
	const child = build()
		.child('Grandchild', grandchild)
		.initState((state) => ({...state, cValue: ''}));

	const child2 = build()
		.initState((state) => ({...state, c2Value: 1}));

	const parent = build()
		.initState(() => ({parentField: 10}))
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
	const grandchild = build()
		.initState(() => ({gcValue: false}))
		.handlers({edit: (state, {payload}: IAction<boolean>) => ({...state, gcValue: payload})});
	const child = build()
		.initState((state) => ({...state, cValue: ''}))
		.child('Grandchild', grandchild)
		.handlers({
			change: (state, {payload}: IAction<string>) => ({...state, cValue: payload}),
		});

	const child2 = build()
		.initState((state) => ({...state, c2Value: 1}))
		.handlers({
			change2: (state, {payload}: IAction<number>) => ({...state, c2Value: payload}),
		});

	const parent = build()
		.child('Child', child)
		.initState((state) => ({...state, parentField: 10}))
		.handlers({
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

test("Child actions by children ", (t) => {
	const grandchild = build()
		.handlers({edit: (state, action: IAction<string>) => state});
	const child = build()
		.handlers({
			enable: (state, action: IAction<boolean>) => state,
		})
		.children({Grandchild: grandchild});

	const child2 = build()
		.handlers({
			enable2: (state, action: IAction<boolean>) => state,
		});

	const parent = build()
		.handlers({parendAction: (state, action: IAction<string>) => state})
		.children({Child: child, Child2: child2});

	t.deepEqual(parent.actions.Child.enable(false), {type: 'Child.enable', payload: false});
	t.deepEqual(parent.actions.Child.enable(true), {type: 'Child.enable', payload: true});
	t.deepEqual(parent.actions.Child2.enable2(true), {type: 'Child2.enable2', payload: true});
	t.deepEqual(parent.actions.Child.Grandchild.edit('test'), {type: 'Child.Grandchild.edit', payload: 'test'});

	t.end();
});

test("Child state by children", (t) => {
	const grandchild = build()
		.initState(() => ({gcValue: false}));
	const child = build()
		.children({Grandchild: grandchild})
		.initState((state) => ({...state, cValue: ''}));

	const child2 = build()
		.initState((state) => ({...state, c2Value: 1}));

	const parent = build()
		.initState(() => ({parentField: 10}))
		.children({Child: child, Child2: child2});

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