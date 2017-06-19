/// <reference types="react" />
import * as React from "react";
import { IChildProps, Dispatch } from "./types";
import { IController } from './controller';
export declare function createComponent<P, ViewP, S extends object, PublicS extends object, PublicD>(controller: IController<S, PublicS, PublicD>, stateToProps?: (state: PublicS, props: P) => Partial<ViewP>, dispatchToProps?: (dispatch: PublicD, props: P) => Partial<ViewP>, mergeProps?: (stateProps: Partial<ViewP>, dispatchProps: Partial<ViewP>) => ViewP): (View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function createComponent<P, ViewP, S extends object>(controller: IController<S, S, Dispatch>, stateToProps?: (state: S, props: P) => Partial<ViewP>, dispatchToProps?: (dispatch: Dispatch, props: P) => Partial<ViewP>, mergeProps?: (stateProps: Partial<ViewP>, dispatchProps: Partial<ViewP>) => ViewP): (View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, needShallowEqual?: boolean) => React.ComponentClass<P & IChildProps<S>>;
export declare function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S>;
export declare function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean;
