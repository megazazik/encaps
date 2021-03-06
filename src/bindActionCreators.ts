import { isCustomActionCreator, IActionCreators, isActionCreatorFactory } from './controller';

function bindActionCreator (actionCreator, dispatch) {
	return function() {
		return dispatch(actionCreator.apply(this, arguments))
	}
}


export type ChangeReturnType<F extends (...args: any[]) => any, R> = F extends (...args: infer Args) => any ? (...args: Args) => R : never;

export type BoundActionCreators<Creators extends IActionCreators> = {
	[K in keyof Creators]: Creators[K] extends (...args) => {type: string}
		? ChangeReturnType<Creators[K], void>
		: Creators[K] extends (...args) => IActionCreators
			? ChangeReturnType<Creators[K], BoundActionCreators<ReturnType<Creators[K]>>>
			: Creators[K] extends IActionCreators
					? BoundActionCreators<Creators[K]>
					: Creators[K] extends (...args) => any
						? ChangeReturnType<Creators[K], void>
						: Creators[K]
}

export function bindActionCreators<P extends IActionCreators>(
	actionCreators: P,
	dispatch: (action: any) => any
): BoundActionCreators<P> {
	const wrappedActions: any = Object.keys(actionCreators).reduce(
		(result, actionKey) => {
			if (typeof actionCreators[actionKey] === 'function') {
				if (isCustomActionCreator(actionCreators[actionKey])) {
					if (isActionCreatorFactory(actionCreators[actionKey] as any)) {
						const getBoundActionCreators = (...args) =>
							bindActionCreators((actionCreators[actionKey] as any)(...args), dispatch);

						return ({
							...result,
							[actionKey]: getBoundActionCreators
						});
					} else {
						// диспатчим результаты эффектов, например, thunks
						const boundActionCreator = bindActionCreator(actionCreators[actionKey], dispatch);
						return ({ ...result, [actionKey]: boundActionCreator });
					}
				} else {
					// обычные действия
					const boundActionCreator = bindActionCreator(actionCreators[actionKey], dispatch);
					return ({ ...result, [actionKey]: boundActionCreator });
				}
			} else {
				// действия дочерних объектов
				return ({ ...result, [actionKey]: bindActionCreators(actionCreators[actionKey] as IActionCreators, dispatch) });
			}
		},
		{}
	);
	return wrappedActions;
}
