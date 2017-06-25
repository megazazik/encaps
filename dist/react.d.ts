/// <reference types="react" />
import * as React from "react";
import { IChildProps, Dispatch, IParentProps } from "./types";
import { IController } from './controller';
export declare function createComponent<S extends object, Actions>(controller: IController<S, Actions>): <P>(View: React.StatelessComponent<P & IParentProps> | React.ComponentClass<P & IParentProps>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function createComponent<S extends object, Actions, P = {}, StateProps = {
    state: S;
}, ActionsProps = {
    actions: Actions;
}>(controller: IController<S, Actions>, stateToProps?: (state: S, props: P) => StateProps, dispatchToProps?: (dispatch: Dispatch, props: P) => ActionsProps): <VP = {}>(View: React.StatelessComponent<P & VP & StateProps & ActionsProps & IParentProps> | React.ComponentClass<P & VP & StateProps & ActionsProps & IParentProps>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function createComponent<S extends object, Actions, P, StateProps, ActionsProps, ViewP>(controller: IController<S, Actions>, stateToProps: (state: S, props: P) => StateProps, dispatchToProps: (dispatch: Dispatch, props: P) => ActionsProps, mergeProps: (stateProps: StateProps, dispatchProps: ActionsProps, props: P) => ViewP): (View: React.StatelessComponent<ViewP & IParentProps> | React.ComponentClass<ViewP & IParentProps>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function createActions<S extends object, A>(controller: IController<S, A>, dispatch: any): {};
export declare function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S>;
export declare function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean;
