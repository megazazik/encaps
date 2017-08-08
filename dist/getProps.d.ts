import { IChildProps, Dispatch, IPublicActions } from './types';
import { IController } from './controller';
export interface IGetPropsParams<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP> {
    stateToProps: ((state: S, props: P) => StateProps) | ((state: S, props: P) => (state: S, props: P) => StateProps);
    dispatchToProps: ((dispatch: Dispatch, props: P) => ActionsProps) | ((dispatch: Dispatch, props: P) => (dispatch: Dispatch, props: P) => ActionsProps);
    mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP;
}
export declare function createConnectParams<S extends object, Actions, SubActions, P = {}, StateProps = S, ActionsProps = IPublicActions<Actions, SubActions>>(controller: IController<S, Actions, SubActions>, stateToProps?: (state: S, props: P) => StateProps, dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, P & StateProps & ActionsProps>;
export declare function createConnectParams<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(controller: IController<S, Actions, SubActions>, stateToProps: (state: S, props: P) => StateProps, dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps, mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>;
export declare function createActions<S extends object, A>(controller: IController<S, A>, dispatch: any): {};
export declare function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S>;
export declare function createWrapDispatch(): (key: string, dispatch: Dispatch) => Dispatch;
export declare function getProps<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>({stateToProps, dispatchToProps, mergeProps}: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>, state: S, dispatch: Dispatch, props: P): ViewP;
export declare function composeConnectParams(...params: Array<IGetPropsParams<any, any, any, any, any, any, any>>): IGetPropsParams<any, any, any, any, any, any, any>;
export declare function wrapConnectParams<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(key: string, params: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>): IGetPropsParams<any, Actions, SubActions, P, StateProps, ActionsProps, ViewP>;
export declare function wrapStateToProps<OutS, S, P, SProps>(getState: (outState: OutS, props?: P) => S, stateToProps: ((state: S, props: P) => SProps) | ((state: S, props: P) => (state: S, props: P) => SProps)): (state: OutS, props: P) => (state: OutS, props: P) => SProps;
export declare function wrapDispatchToProps<P, DProps>(wrapDispatch: (dispatch: Dispatch, props?: P) => Dispatch, dispatchToProps: ((dispatch: Dispatch, props: P) => DProps) | ((dispatch: Dispatch, props: P) => (dispatch: Dispatch, props: P) => DProps)): (dispatch: Dispatch, props: P) => (dispatch: Dispatch, props: P) => DProps;
