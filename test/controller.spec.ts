import test from 'tape';
import { build, IAction, getSubActions, decomposeKeys } from '../src';
import { spy } from 'sinon';

test("Simple actions", (t) => {
	const model = build()
		.action({
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
	const model = build()
		.setInitState((state) => ({...state, value1: false, value2: 1}))
		.action({
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
		.action({edit: (state, action: IAction<string>) => state});
	const child = build()
		.action({
			enable: (state, action: IAction<boolean>) => state,
		})
		.child('Grandchild', grandchild);

	const child2 = build()
		.action({
			enable2: (state, action: IAction<boolean>) => state,
		});

	const parent = build()
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
	const grandchild = build()
		.setInitState(() => ({gcValue: false}));
	const child = build()
		.child('Grandchild', grandchild)
		.setInitState((state) => ({...state, cValue: ''}));

	const child2 = build()
		.setInitState((state) => ({...state, c2Value: 1}));

	const parent = build()
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
	const grandchild = build()
		.setInitState(() => ({gcValue: false}))
		.action({edit: (state, {payload}: IAction<boolean>) => ({...state, gcValue: payload})});
	const child = build()
		.setInitState((state) => ({...state, cValue: ''}))
		.child('Grandchild', grandchild)
		.action({
			change: (state, {payload}: IAction<string>) => ({...state, cValue: payload}),
		});

	const child2 = build()
		.setInitState((state) => ({...state, c2Value: 1}))
		.action({
			change2: (state, {payload}: IAction<number>) => ({...state, c2Value: payload}),
		});

	const parent = build()
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

test("getSubActions", (t) => {
	t.deepEqual(
		getSubActions({type: 't1', payload: 1}),
		[{type: 't1', payload: 1}]
	);

	t.deepEqual(
		getSubActions({
			type: 't1',
			payload: 1,
			actions: [{type: 'c1'}]
		}),
		[
			{type: 't1', payload: 1},
			{type: 'c1'}
		]
	);

	t.deepEqual(
		getSubActions({
			type: 't1',
			payload: 1,
			actions: [{type: 'c1'}, {type: 'c2'}]
		}),
		[
			{type: 't1', payload: 1},
			{type: 'c1'},
			{type: 'c2'},
		]
	);

	t.deepEqual(
		getSubActions({
			type: 't1',
			payload: 1,
			actions: [
				{type: 'c1', actions: [{type: 'c11'}, {type: 'c12'}]},
				{type: 'c2', actions: [{type: 'c21'}, {type: 'c22'}]},
			]
		}),
		[
			{type: 't1', payload: 1},
			{type: 'c1'},
			{type: 'c11'},
			{type: 'c12'},
			{type: 'c2'},
			{type: 'c21'},
			{type: 'c22'},
		]
	);

	t.end();
});

test('decomposeKeys', (t) => {
	t.deepEqual(
		decomposeKeys({
			k1: 1,
			k2: 2,
			k3: {
				k31: 31,
				k32: 32,
				k33: {
					k331: 331,
					k332: {
						k3321: 3321
					}
				}
			},
			k4: {
				k41: 41
			}
		}),
		{
			k1: 1,
			k2: 2,
			['k3.k31']: 31,
			['k3.k32']: 32,
			['k3.k33.k331']: 331,
			['k3.k33.k332.k3321']: 3321,
			['k4.k41']: 41,
		}
	);

	t.end();
});

test("Wrap actions", (t) => {
	const grandChild1 = build()
		.setInitState((state) => ({...state, gc1: ''}))
		.action({
			gcChange: (state, {payload}: IAction<string>) => ({...state, gc1: payload})
		});

	const child = build()
		.setInitState((state) => ({...state, c1: ''}))
		.action({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.wrapActions({
			change: (payload, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: {
				gcChange: (payload, actions) => actions.change(payload)
			}
		})
		.model;
	
	t.deepEqual(
		child.actions.change('qwerty'),
		{
			type: 'change',
			payload: 'qwerty',
			actions: [
				{ type: 'GrandChild1.gcChange', payload: 'qwerty' }
			]
		}
	);

	t.deepEqual(
		child.actions.GrandChild1.gcChange('qwe'),
		{
			type: 'GrandChild1.gcChange',
			payload: 'qwe',
			actions: [
				{ type: 'change', payload: 'qwe' }
			]
		}
	);

	const grandChild2 = build()
		.setInitState((state) => ({...state, gc2: 20}))
		.action({
			gcChange: (state, {payload}: IAction<number>) => ({...state, gc2: payload})
		});

	const child2 = build()
		.setInitState((state) => ({...state, c2: 1}))
		.action({
			change2: (state, {payload}: IAction<number>) => ({...state, c2: payload})
		})
		.child('GrandChild2', grandChild2)
		.wrapActions({
			change2: (payload, actions) => actions.GrandChild2.gcChange(payload),
			GrandChild2: {
				gcChange: (payload, actions) => actions.change2(payload)
			}
		})
		.model;

	const parent = build()
		.child('Child', child)
		.child('Child2', child2)
		.wrapActions({
			Child2: {
				GrandChild2: {
					gcChange: (payload) => ({type: 'test', payload}),
				}
			}
		})
		.wrapActions({
			Child: {
				change: (payload, actions) => actions.Child2.change2(payload.length)
			},
			Child2: {
				change2: (payload, actions) => actions.Child.change(payload + ''),
			}
		})
		

	t.deepEqual(
		parent.actions.Child.change('qwerty'),
		{
			type: 'Child.change',
			payload: 'qwerty',
			actions: [
				{ type: 'Child.GrandChild1.gcChange', payload: 'qwerty', actions: [] },
				{
					type: 'Child2.change2',
					payload: 6,
					actions: [
						{
							type: 'Child2.GrandChild2.gcChange',
							payload: 6,
							actions: [{type: 'test', payload: 6}]
						}
					]
				}
			]
		}
	);

	t.deepEqual(
		parent.actions.Child.GrandChild1.gcChange('qwe'),
		{
			type: 'Child.GrandChild1.gcChange',
			payload: 'qwe',
			actions: [
				{
					type: 'Child.change',
					payload: 'qwe',
					actions: [
						{
							type: 'Child2.change2',
							payload: 3,
							actions: [
								{
									type: 'Child2.GrandChild2.gcChange',
									payload: 3,
									actions: [
										{
											type: 'test',
											payload: 3
										}
									]
								}
							]
						}
					],
				},
			]
		}
	);

	t.deepEqual(
		parent.actions.Child2.GrandChild2.gcChange(11),
		{
			type: 'Child2.GrandChild2.gcChange',
			payload: 11,
			actions: [
				{
					type: 'Child2.change2',
					payload: 11,
					actions: [
						{
							type: 'Child.change',
							payload: '11',
							actions: [
								{ type: 'Child.GrandChild1.gcChange', payload: '11', actions: [] }
							]
						},
					]
				},
				{ type: 'test', payload: 11, actions: [] }
			]
		}
	);

	t.end();
});

test("Sub actions reducer", (t) => {
	const grandChild1 = build()
		.setInitState((state) => ({...state, gc1: ''}))
		.action({
			gcChange: (state, {payload}: IAction<string>) => ({...state, gc1: payload})
		});

	const child = build()
		.setInitState((state) => ({...state, c1: ''}))
		.action({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.wrapActions({
			change: (payload, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: {
				gcChange: (payload, actions) => actions.change(payload)
			}
		})
		.model;
	
	const grandChild2 = build()
		.setInitState((state) => ({...state, gc2: 20}))
		.action({
			gcChange: (state, {payload}: IAction<number>) => ({...state, gc2: payload})
		});

	const child2 = build()
		.setInitState((state) => ({...state, c2: 1}))
		.action({
			change2: (state, {payload}: IAction<number>) => ({...state, c2: payload})
		})
		.child('GrandChild2', grandChild2)
		.wrapActions({
			change2: (payload, actions) => actions.GrandChild2.gcChange(payload),
			GrandChild2: {
				gcChange: (payload, actions) => actions.change2(payload)
			}
		})
		.model;

	const parent = build()
		.child('Child', child)
		.child('Child2', child2)
		.wrapActions({
			Child: {
				change: (payload, actions) => actions.Child2.change2(payload.length)
			},
			Child2: {
				change2: (payload, actions) => actions.Child.change(payload + ''),
			}
		})
		
	t.deepEqual(
		parent.reducer(),
		{
			Child: {
				c1: '',
				GrandChild1: {
					gc1: ''
				}
			},
			Child2: {
				c2: 1,
				GrandChild2: {
					gc2: 20
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(undefined, parent.actions.Child.change('test_string')),
		{
			Child: {
				c1: 'test_string',
				GrandChild1: {
					gc1: 'test_string'
				}
			},
			Child2: {
				c2: 11,
				GrandChild2: {
					gc2: 11
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(undefined, parent.actions.Child.GrandChild1.gcChange('test_string')),
		{
			Child: {
				c1: 'test_string',
				GrandChild1: {
					gc1: 'test_string'
				}
			},
			Child2: {
				c2: 11,
				GrandChild2: {
					gc2: 11
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(undefined, parent.actions.Child2.change2(30)),
		{
			Child: {
				c1: '30',
				GrandChild1: {
					gc1: '30'
				}
			},
			Child2: {
				c2: 30,
				GrandChild2: {
					gc2: 30
				}
			}
		}
	);

	t.deepEqual(
		parent.reducer(undefined, parent.actions.Child2.GrandChild2.gcChange(30)),
		{
			Child: {
				c1: '30',
				GrandChild1: {
					gc1: '30'
				}
			},
			Child2: {
				c2: 30,
				GrandChild2: {
					gc2: 30
				}
			}
		}
	);

	t.end();
});
