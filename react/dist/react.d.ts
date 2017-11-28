/// <reference types="react" />
import * as React from "react";
import { IChildProps, IParentProps, IPublicActions } from "./types";
import { IController, Dispatch } from 'encaps';
import { IGetPropsParams } from './connect';
import shallowEqual = require('fbjs/lib/shallowEqual');
export { shallowEqual };
export declare function createComponent<S extends object, Actions, SubActions, P = {}, StateProps = S, ActionsProps = IPublicActions<Actions, SubActions>>(controller: IController<S, Actions, SubActions>, stateToProps?: (state: S, props: P) => StateProps, dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps): (View: React.ComponentType<P & StateProps & ActionsProps & IParentProps>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function createComponent<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(controller: IController<S, Actions, SubActions>, stateToProps: (state: S, props: P) => StateProps, dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps, mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP): (View: React.ComponentType<ViewP & IParentProps>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean;
export declare function createContainer<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(connectParams: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>): {
    <VP>(View: React.ComponentType<ViewP & VP & IParentProps>, needShallowEqual?: boolean): React.ComponentClass<P & VP & IChildProps<S>>;
    (View: React.ComponentType<ViewP & IParentProps>, needShallowEqual?: boolean): React.ComponentClass<P & IChildProps<S>>;
};
export declare const parentConnectParams: IGetPropsParams<any, any, any, any, any, any, IParentProps>;
export declare function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S>;
