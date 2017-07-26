import { IChildProps, IParentProps, Dispatch, IPublicActions, GetChildProps } from './types';
import { IController, wrapDispatch } from './controller';

export interface IGetPropsParams<
	S extends object,
	Actions,
	SubActions,
	P,
	StateProps,
	ActionsProps,
	ViewP
> {
	controller: IController<S, Actions, SubActions>;
	stateToProps: (state: S, props: P) => StateProps;
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps;
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP;
}

export function createConnectParams<
	S extends object,
	Actions,
	SubActions,
	P = {},
	StateProps = S,
	ActionsProps = IPublicActions<Actions, SubActions>
>(
	controller: IController<S, Actions, SubActions>,
	stateToProps?: (state: S, props: P) => StateProps,
	dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps
): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, P & StateProps & ActionsProps>;


export function createConnectParams<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(
	controller: IController<S, Actions, SubActions>,
	stateToProps: (state: S, props: P) => StateProps,
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps,
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>;

export function createConnectParams<
	S extends object,
	Actions,
	SubActions,
	P = {},
	StateProps = S,
	ActionsProps = IPublicActions<Actions, SubActions>,
	ViewP = P & StateProps & ActionsProps
>(
	controller: IController<S, Actions, SubActions>,
	stateToProps: (state: S, props: P) => StateProps
		= (state, props) => removeChildFromState(controller, state),
	dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps
		= (dispatch, props) => createActions(controller, dispatch) as any,
	mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP
		= (sp, dp, p) => ({...p as any, ...sp as any, ...dp as any})
): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP> {
	return {
		controller,
		stateToProps,
		dispatchToProps,
		mergeProps
	};
};

function removeChildFromState<S extends object>(controller: IController<S, any, any>, state: S) {
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

export function createWrapDispatch() {
	const dispatches: {[key: string]: Dispatch} = {};

	return (key: string, dispatch: Dispatch) => {
		if (!dispatches[key]) {
			dispatches[key] = wrapDispatch(key, dispatch);
		}
		return dispatches[key];	
	};
}

export function getProps<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(
	{
		stateToProps,
		dispatchToProps,
		mergeProps
	}: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>,
	state: S,
	dispatch: Dispatch,
	props: P
): ViewP {
	return mergeProps(
		stateToProps(state, props),
		dispatchToProps(dispatch, props),
		props
	);
}