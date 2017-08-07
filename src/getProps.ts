import { IChildProps, IParentProps, Dispatch, IPublicActions, GetChildProps } from './types';
import { IController, wrapDispatch } from './controller';

/** @todo добавить в объявление возможность возвращать функцию из stateToProps и dispatchToProps */
export interface IGetPropsParams<
	S extends object,
	Actions,
	SubActions,
	P,
	StateProps,
	ActionsProps,
	ViewP
> {
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
	/** @todo fix sub actions */
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

const TEMP_FIELD_NAME = "__temp_field_name__";

interface IStateParams {
	stateToPropsList: Array<(state, props) => any>;
	firstCall: boolean;
	state: any;
	[key: string]: any
}

interface IDispatchParams {
	dispatchToPropsList: Array<(dispatch, props) => any>;
	dispatch: any;
	[key: string]: any
}

export function composeConnectParams(
	...params: Array<IGetPropsParams<any, any, any, any, any, any, any>>
): IGetPropsParams<any, any, any, any, any, any, any> {
	
	const stateToProps = (state, props) => {
		const sData: IStateParams = {
			stateToPropsList: params.map((param) => param.stateToProps),
			firstCall: true,
			state
		};

		return (state, props) => sData.stateToPropsList.reduce(
			(prev, stateToProps, index) => ({
				...prev,
				[TEMP_FIELD_NAME + index]: stateToProps(state, props)
			}),
			sData
		)
	};

	const dispatchToProps = (dispatch, props) => {
		const dData: IDispatchParams = {
			dispatch,
			dispatchToPropsList: params.map((param) => param.dispatchToProps)
		}
		
		return (dispatch, props) => dData.dispatchToPropsList.reduce(
			(prev, dispatchToProps, index) => ({
				...prev,
				[TEMP_FIELD_NAME + index]: dispatchToProps(dispatch, props)
			}),
			dData
		);
	};

	const mergeProps = (stateData: IStateParams, dispatchData: IDispatchParams, props) => {
		if (stateData.firstCall) {
			params.forEach((param, index) => {
				if (typeof stateData[TEMP_FIELD_NAME + index] === 'function') {
					stateData.stateToPropsList[index] = stateData[TEMP_FIELD_NAME + index];
					stateData[TEMP_FIELD_NAME + index] = stateData[TEMP_FIELD_NAME + index](
						stateData.state, 
						props
					)
				}

				if (typeof dispatchData[TEMP_FIELD_NAME + index] === 'function') {
					dispatchData.dispatchToPropsList[index] = dispatchData[TEMP_FIELD_NAME + index];
					dispatchData[TEMP_FIELD_NAME + index] = dispatchData[TEMP_FIELD_NAME + index](
						dispatchData.dispatch, 
						props
					)
				}
			});
			stateData.firstCall = false;
		}
		
		return params.reduce(
			(prev, param, index) => ({
				...prev,
				...param.mergeProps(
					stateData[TEMP_FIELD_NAME + index],
					dispatchData[TEMP_FIELD_NAME + index],
					props
				)
			}),
			{}
		);
	};

	return {
		stateToProps,
		dispatchToProps,
		mergeProps
	}
}

export function wrapConnectParams(
	key: string,
	params: IGetPropsParams<any, any, any, any, any, any, any>
): IGetPropsParams<any, any, any, any, any, any, any> {
	const keyGetState = (s: any) => s[key];
	const keyWrapDispatch = (d: Dispatch) => wrapDispatch(key, d);
	
	return {
		stateToProps: wrapStateToProps(keyGetState, params.stateToProps),
		dispatchToProps: wrapDispatchToProps(keyWrapDispatch, params.dispatchToProps),
		mergeProps:  (stateP, dispatchP, props) => ({[key]: params.mergeProps(stateP, dispatchP, props)}) 
	}
}

export function wrapStateToProps<OutS, S, P, SProps>(
	getState: (outState: OutS, props?: P) => S,
	stateToProps: (state: S, props: P) => SProps
): (state: OutS, props: P) => (state: OutS, props: P) => SProps {
	return (state, props) => {
		let sp = stateToProps;
		return (state, props) => {
			let res = sp(getState(state, props), props);
			if (typeof res === 'function') {
				sp = res;
				res = sp(getState(state, props), props)
			}
			return res;
		};
	}
}

export function wrapDispatchToProps<P, DProps>(
	wrapDispatch: (dispatch: Dispatch, props?: P) => Dispatch,
	dispatchToProps: (dispatch: Dispatch, props: P) => DProps
): (dispatch: Dispatch, props: P) => (dispatch: Dispatch, props: P) => DProps {
	return (dispatch, props) => {
		let dp = dispatchToProps;
		let savedDispatch;
		let computedDispatch;
		return (dispatch, props) => {
			if (savedDispatch !== dispatch) {
				computedDispatch = wrapDispatch(dispatch, props);
				savedDispatch = dispatch;
			}

			let res = dp(computedDispatch, props);
			if (typeof res === 'function') {
				dp = res;
				res = dp(computedDispatch, props)
			}
			return res;
		};
	}
}