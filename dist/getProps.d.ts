import { IChildProps, Dispatch, IPublicActions } from './types';
import { IController } from './controller';
export interface IGetPropsParams<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP> {
    controller: IController<S, Actions, SubActions>;
    stateToProps: (state: S, props: P) => StateProps;
    dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps;
    mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP;
}
export declare function createConnectParams<S extends object, Actions, SubActions, P = {}, StateProps = S, ActionsProps = IPublicActions<Actions, SubActions>>(controller: IController<S, Actions, SubActions>, stateToProps?: (state: S, props: P) => StateProps, dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, P & StateProps & ActionsProps>;
export declare function createConnectParams<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(controller: IController<S, Actions, SubActions>, stateToProps: (state: S, props: P) => StateProps, dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps, mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP): IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>;
export declare function createActions<S extends object, A>(controller: IController<S, A>, dispatch: any): {};
export declare function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S>;
export declare function createGetChildDispatch(controller: IController<any>): (key: string, dispatch: Dispatch) => Dispatch;
