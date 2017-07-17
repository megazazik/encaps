import { IChildProps, IParentProps, Dispatch, IPublicActions, GetChildProps } from './types';
import { IController } from './controller';

export interface IGetStateParams<
	S extends object,
	Actions,
	SubActions,
	P,
	StateProps,
	ActionsProps,
	ViewP
> {
	controller: IController<S, Actions, SubActions>,
	stateToProps: (state: S, props: P) => StateProps,
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps,
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
}

export function createConnectParams<
	S extends object,
	Actions,
	SubActions,
	P = {},
	StateProps = S,
	ActionsProps = {actions: IPublicActions<Actions, SubActions>},
	ViewP = P & StateProps & ActionsProps & IParentProps
>(
	controller: IController<S, Actions, SubActions>,
	params: {
		stateToProps?: (state: S, props: P) => StateProps,
		dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps,
		mergeProps?: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
	} = {}
): IGetStateParams<
	S,
	Actions,
	SubActions,
	P,
	StateProps,
	ActionsProps,
	ViewP
> {
	return {
		controller,
		stateToProps: params.stateToProps || ((state, props) => removeChildFromState(controller, state)),
		dispatchToProps: params.dispatchToProps || ((dispatch, props) => ({actions: createActions(controller, dispatch)} as any)),
		mergeProps: params.mergeProps || ((sp, dp, p) => ({...p as any, ...sp as any, ...dp as any}))
	};
};

export function removeChildFromState<S extends object>(controller: IController<S, any, any>, state: S) {
	return Object.keys(controller.getChildren()).reduce(
		(resultState, key) => {
			delete resultState[key];
			return resultState;
		},
		{...state as any}
	);
};

export function createActions<S extends object, A>(controller: IController<S, A>, dispatch) {
	// todo fix sub actions
	return Object.keys(controller.getActions()).reduce(
		(actions, key) => ({...actions, [key]: (payload?) => dispatch(controller.getActions()[key](payload))}),
		{}
	);
}

export function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S> {
	return {
		doNotAccessThisInnerState: state,
		doNotAccessThisInnerDispatch: dispatch
	};
}