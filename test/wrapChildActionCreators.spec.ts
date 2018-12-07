import test from 'tape';
import { IAction } from '../src';
import { build, wrapChildActionCreators, createEffect, wrapAction } from '../src/controller';

test("createEffect", (t) => {
	t.plan(6);

	const actions = {
		a(p): IAction<any> { return {type: 'a', payload: p}; },
		b(p): IAction<any> { return {type: 'b', payload: p}; },
		e: createEffect(
			(wrappedActions) => {
				return (p) => {
					return Promise.resolve(wrappedActions.a(p * 2));
				};
			},
			() => actions,
			(state) => state
		)
	};

	t.deepEquals(
		actions.a(10),
		{type: 'a', payload: 10}
	);

	actions.e(10).then((action) => {
		t.deepEquals(
			action,
			{type: 'a', payload: 20}
		);
	});

	const parentActions = wrapChildActionCreators(wrapAction('Parent'), actions);

	t.deepEquals(
		parentActions.a(10),
		{type: 'Parent.a', payload: 10}
	);

	parentActions.e(10).then((action) => {
		t.deepEquals(
			action,
			{type: 'Parent.a', payload: 20}
		);
	});

	const grandParentActions = wrapChildActionCreators(wrapAction('GrandParent'), parentActions);

	t.deepEquals(
		grandParentActions.a(11),
		{type: 'GrandParent.Parent.a', payload: 11}
	);

	grandParentActions.e(10).then((action) => {
		t.deepEquals(
			action,
			{type: 'GrandParent.Parent.a', payload: 20}
		);
	});
});
