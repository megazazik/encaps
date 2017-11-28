/// <reference types="react" />
import * as React from "react";
import { Dispatch, ComponentPath } from "encaps";
import { IGetPropsParams, IParentProps } from "encaps-react";
export interface IConnectParams {
    stateToProps?: (state: any, props: any) => any;
    dispatchToProps?: (dispatch: Dispatch, props: any) => any;
    mergeProps?: (stateProps: any, dispatchProps: any, props: any) => any;
    path?: ComponentPath;
    noConvertToComponentProps?: boolean;
}
export declare function connect({path, stateToProps, dispatchToProps, mergeProps, noConvertToComponentProps}?: IConnectParams): (component: React.ComponentType<any>) => React.StatelessComponent<any>;
export declare function connectView<S extends object, Actions, SubActions, P, StateProps, ActionsProps, ViewP>(params: IGetPropsParams<S, Actions, SubActions, P, StateProps, ActionsProps, ViewP>): <VP = {}>(component: React.ComponentType<ViewP & VP & IParentProps>, path?: ComponentPath) => React.StatelessComponent<P & VP>;
export default connect;
