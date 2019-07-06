import test from 'tape';
import { build } from '../src/controller';
import { IAction } from '../src/types';

test('controllerStringsAsHandlers', (t) => {
	const { actions, reducer } = build()
		.initState(() => ({value: 0}))
		.handlers({
			add: (state, action: IAction<number>) => ({...state, value: state.value + action.payload}),
			simpleHandler: 'value',
		});

	t.equal(typeof actions.simpleHandler, 'function', 'Should create action creator');
	t.deepEqual(actions.simpleHandler(10), {type: 'simpleHandler', payload: 10}, 'Should create correct action');
	t.deepEqual(actions.simpleHandler(), {type: 'simpleHandler', payload: undefined}, 'Should create empty action');
	t.deepEqual(
		reducer({value: 0}, {type: 'simpleHandler', payload: 10}),
		{value: 10},
		'Should process action correctly'
	);

	const state = {value: 10};
	t.equal(
		reducer(state, {type: 'simpleHandler', payload: 10}),
		state,
		'Should return previous state if it does not change'
	);

	t.deepEqual(reducer({value: 2}, actions.add(3)), {value: 5}, 'Other creators should stil works');

	t.end();
});


test("controllerStringsAsHandlers. Wrap actions", (t) => {
	const grandChild1 = build()
		.initState((state) => ({...state, gc1: ''}))
		.handlers({
			gcChange: 'gc1'
		});

	const child = build()
		.initState((state) => ({...state, c1: ''}))
		.handlers({
			change: 'c1'
		})
		.child('GrandChild1', grandChild1)
		.subActions({
			change: ({payload}, actions) => actions.GrandChild1.gcChange(payload),
			GrandChild1: {
				gcChange: ({payload}, actions) => actions.change(payload)
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
		.initState((state) => ({...state, gc2: 20}))
		.handlers({
			gcChange: 'gc2'
		});

	const child2 = build()
		.initState((state) => ({...state, c2: 1}))
		.handlers({
			change2: 'c2'
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

