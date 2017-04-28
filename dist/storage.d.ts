/// <reference types="react" />
import * as React from "react";
import { IAction, Reducer } from "./types";
export interface IStore {
    state: any;
    dispatch: (action: IAction<any>) => void;
}
export declare function createStore(reducer: Reducer<any>): IStore;
export interface IProps {
    store: IStore;
}
export interface IState {
    state: any;
}
export declare class Provider extends React.Component<IProps, IState> {
    private dispatcher;
    constructor(props: IProps);
    static childContextTypes: {
        state: any;
        dispatch: any;
        subscribe: any;
        unsubscribe: any;
    };
    private dispatch;
    private subscribe;
    private unsubscribe;
    getChildContext(): {
        state: any;
        dispatch: (action: IAction<any>) => void;
        subscribe: (handler: (state: any) => void) => void;
        unsubscribe: (handler: (state: any) => void) => void;
    };
    render(): JSX.Element;
}
export interface IStateHolderProps {
    code?: string;
    extractState?: (fullState: any, props: any) => any;
    extractDispatch?: (dispatch: any, props: any) => any;
    Element: React.StatelessComponent<any> | React.ComponentClass<any>;
    elementProps: any;
}
export declare const getCreateStore: () => (reducer: Reducer<any>) => IStore;
export declare const getProvider: () => React.ComponentClass<IProps>;
export declare type Connect = {
    (stateToComponentState?: (state: any, props: any) => any, dispatchToComponentDispatch?: (dispatch: (action: IAction<any>) => void, props: any) => any): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>;
};
export declare function getConnect(): Connect;
export declare function setConect(connect: Connect): void;
export declare function connect(stateToComponentState?: (state: any, props: any) => any, dispatchToComponentDispatch?: (dispatch: (action: IAction<any>) => void, props: any) => any): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>;
