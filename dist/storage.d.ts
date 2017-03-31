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
    constructor(props: IProps);
    static childContextTypes: {
        state: React.Requireable<any>;
        dispatch: React.Requireable<any>;
    };
    private dispatch;
    getChildContext(): {
        state: any;
        dispatch: (action: IAction<any>) => void;
    };
    render(): JSX.Element;
}
export interface IStateHolderProps {
    code?: string;
    Element: React.StatelessComponent<any> | React.ComponentClass<any>;
    elementProps: any;
}
export declare const getCreateStore: () => (reducer: Reducer<any>) => IStore;
export declare const getProvider: () => React.ComponentClass<IProps>;
export declare const getStateHolder: () => (props: IStateHolderProps) => JSX.Element;
export declare const setStateHolder: (holder: React.StatelessComponent<IStateHolderProps> | React.ComponentClass<IStateHolderProps>) => void;
