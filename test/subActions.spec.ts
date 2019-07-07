import test from 'tape';
import { build, getSubActions, decomposeKeys } from '../src/controller';
import { IAction } from '../src/types';
import { spy } from 'sinon';

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
		.initState((state) => ({...state, gc1: ''}))
		.handlers({
			gcChange: (state, {payload}: IAction<string>) => ({...state, gc1: payload})
		});

	const child = build()
		.initState((state) => ({...state, c1: ''}))
		.handlers({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.subActions({
			change: ({payload}, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: {
				gcChange: (action, actions) => actions.change(action.payload)
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

	t.equal(String(child.actions.change), 'change');
	t.equal(String(child.actions.GrandChild1.gcChange), 'GrandChild1.gcChange');

	const grandChild2 = build()
		.initState((state) => ({...state, gc2: 20}))
		.handlers({
			gcChange: (state, {payload}: IAction<number>) => ({...state, gc2: payload})
		});

	const child2 = build()
		.initState((state) => ({...state, c2: 1}))
		.handlers({
			change2: (state, {payload}: IAction<number>) => ({...state, c2: payload})
		})
		.child('GrandChild2', grandChild2)
		.subActions({
			change2: ({payload}, actions) => actions.GrandChild2.gcChange(payload),
			GrandChild2: {
				gcChange: ({payload}, actions) => actions.change2(payload)
			}
		})
		.model;

	const parent = build()
		.child('Child', child)
		.child('Child2', child2)
		.subActions({
			Child2: {
				GrandChild2: {
					gcChange: ({payload}) => ({type: 'test', payload}),
				}
			}
		})
		.subActions({
			Child: {
				change: ({payload}, actions) => actions.Child2.change2(payload.length)
			},
			Child2: {
				change2: ({payload}, actions) => actions.Child.change(payload + ''),
			}
		})
		
	t.equal(String(parent.actions.Child2.change2), 'Child2.change2');
	t.equal(String(parent.actions.Child.GrandChild1.gcChange), 'Child.GrandChild1.gcChange');

	t.deepEqual(
		parent.actions.Child.change('qwerty'),
		{
			type: 'Child.change',
			payload: 'qwerty',
			actions: [
				{ type: 'Child.GrandChild1.gcChange', payload: 'qwerty' },
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
								{ type: 'Child.GrandChild1.gcChange', payload: '11' }
							]
						},
					]
				},
				{ type: 'test', payload: 11 }
			]
		}
	);

	t.end();
});


test("Wrap actions. Via function", (t) => {
	const grandChild1 = build()
		.initState((state) => ({...state, gc1: ''}))
		.handlers({
			gcChange: (state, {payload}: IAction<string>) => ({...state, gc1: payload}),
			gc1: 'gc1',
			gc2: 'gc1',
		});

	const child = build()
		.initState((state) => ({...state, c1: ''}))
		.handlers({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.subActions({
			change: ({payload}, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: (action, actions) => {
				if (action.type === 'GrandChild1.gc2') {
					return [actions.change(action.payload), {type: 'testAction'}];
				} else if (action.type === 'GrandChild1.gcChange') {
					return actions.change(action.payload)
				} else {
					return null;
				}
			},
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

	t.deepEqual(
		child.actions.GrandChild1.gc2('qwe2'),
		{
			type: 'GrandChild1.gc2',
			payload: 'qwe2',
			actions: [
				{ type: 'change', payload: 'qwe2' },
				{ type: 'testAction' }
			]
		}
	);

	t.deepEqual(
		child.actions.GrandChild1.gc1('qwe'),
		{
			type: 'GrandChild1.gc1',
			payload: 'qwe'
		}
	);

	const simpleParent = build()
		.children({child})
		.initState((state) => ({...state, field: 1}))
		.handlers({setField: 'field'})
		.subActions({
			setField: (action, actions) => actions.child.GrandChild1.gc2(action.payload + ''),
			child: (action, actions) => {
				if (action.type === 'child.GrandChild1.gc1') {
					return actions.setField(1);
				}
			}
		});

	t.deepEqual(
		simpleParent.actions.child.change('qwerty'),
		{
			type: 'child.change',
			payload: 'qwerty',
			actions: [
				{ type: 'child.GrandChild1.gcChange', payload: 'qwerty' }
			]
		}
	);

	t.deepEqual(
		simpleParent.actions.child.GrandChild1.gcChange('qwe'),
		{
			type: 'child.GrandChild1.gcChange',
			payload: 'qwe',
			actions: [
				{ type: 'child.change', payload: 'qwe' }
			]
		}
	);

	t.deepEqual(
		simpleParent.actions.child.GrandChild1.gc2('qwe2'),
		{
			type: 'child.GrandChild1.gc2',
			payload: 'qwe2',
			actions: [
				{ type: 'child.change', payload: 'qwe2' },
				{ type: 'child.testAction' }
			]
		}
	);

	t.deepEqual(
		simpleParent.actions.child.GrandChild1.gc1('qwe'),
		{
			type: 'child.GrandChild1.gc1',
			payload: 'qwe',
			actions: [
				{type: 'setField', payload: 1}
			]
		}
	);

	t.deepEqual(
		simpleParent.actions.setField(12),
		{
			type: 'setField',
			payload: 12,
			actions: [
				{
					type: 'child.GrandChild1.gc2',
					payload: '12',
					actions: [
						{ type: 'child.change', payload: '12' },
						{ type: 'child.testAction' }
					]
				}
			]
		}
	);

	t.end();
});

test("Wrap actions. Via function. Several child", (t) => {
	const grandChild1 = build()
		.initState((state) => ({...state, gc1: ''}))
		.handlers({
			gcChange: (state, {payload}: IAction<string>) => ({...state, gc1: payload}),
			gc1: 'gc1',
			gc2: 'gc1',
		});

	const child = build()
		.initState((state) => ({...state, c1: ''}))
		.handlers({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.subActions({
			change: ({payload}, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: (action, actions) => {
				if (action.type === 'GrandChild1.gc2') {
					return [actions.change(action.payload), {type: 'testAction'}];
				} else if (action.type === 'GrandChild1.gcChange') {
					return actions.change(action.payload)
				} else {
					return null;
				}
			},
		})
		.model;

	t.equal(String(child.actions.change), 'change');
	t.equal(String(child.actions.GrandChild1.gcChange), 'GrandChild1.gcChange');

	const grandChild2 = build()
	.initState((state) => ({...state, gc2: 20}))
	.handlers({
		gcChange: (state, {payload}: IAction<number>) => ({...state, gc2: payload})
	});

	const child2 = build()
		.initState((state) => ({...state, c2: 1}))
		.handlers({
			change2: (state, {payload}: IAction<number>) => ({...state, c2: payload})
		})
		.child('GrandChild2', grandChild2)
		.subActions({
			change2: ({payload}, actions) => actions.GrandChild2.gcChange(payload),
			GrandChild2: (action, actions) => {
				if (action.type === 'GrandChild2.gcChange')	{
					return actions.change2(action.payload)
				}
			}
		})
		.model;

	const parent = build()
		.child('Child', child)
		.child('Child2', child2)
		.subActions({
			Child2: (action, actions) => {
				if (action.type === 'Child2.GrandChild2.gcChange') {
					return {type: 'test', payload: action.payload};
				}
			}
		})
		.subActions({
			Child: (action, actions) => {
				if (action.type === 'Child.change') {
					return actions.Child2.change2(action.payload.length);
				}
			},
			Child2: (action, actions) => {
				if (action.type === 'Child2.change2') {
					return actions.Child.change(action.payload + '');
				}
			},
		})
		
	t.equal(String(parent.actions.Child2.change2), 'Child2.change2');
	t.equal(String(parent.actions.Child.GrandChild1.gcChange), 'Child.GrandChild1.gcChange');

	t.deepEqual(
		parent.actions.Child.change('qwerty'),
		{
			type: 'Child.change',
			payload: 'qwerty',
			actions: [
				{ type: 'Child.GrandChild1.gcChange', payload: 'qwerty' },
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
								{ type: 'Child.GrandChild1.gcChange', payload: '11' }
							]
						},
					]
				},
				{ type: 'test', payload: 11 }
			]
		}
	);

	t.end();
})


test("Sub actions reducer", (t) => {
	const grandChild1 = build()
		.initState((state) => ({...state, gc1: ''}))
		.handlers({
			gcChange: (state, {payload}: IAction<string>) => ({...state, gc1: payload})
		});

	const child = build()
		.initState((state) => ({...state, c1: ''}))
		.handlers({
			change: (state, {payload}: IAction<string>) => ({...state, c1: payload})
		})
		.child('GrandChild1', grandChild1)
		.subActions({
			change: ({payload}, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: {
				gcChange: (action, actions) => actions.change(action.payload)
			}
		})
		.model;
	
	const grandChild2 = build()
		.initState((state) => ({...state, gc2: 20}))
		.handlers({
			gcChange: (state, {payload}: IAction<number>) => ({...state, gc2: payload})
		});

	const child2 = build()
		.initState((state) => ({...state, c2: 1}))
		.handlers({
			change2: (state, {payload}: IAction<number>) => ({...state, c2: payload})
		})
		.child('GrandChild2', grandChild2)
		.subActions({
			change2: ({payload}, actions) => actions.GrandChild2.gcChange(payload),
			GrandChild2: {
				gcChange: ({payload}, actions) => actions.change2(payload)
			}
		})
		.model;

	const parent = build()
		.child('Child', child)
		.child('Child2', child2)
		.subActions({
			Child: {
				change: ({payload}, actions) => actions.Child2.change2(payload.length)
			},
			Child2: {
				change2: ({payload}, actions) => actions.Child.change(payload + ''),
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
