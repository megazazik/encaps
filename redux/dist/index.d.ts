/// <reference types="react" />
import * as React from "react";
import { IAction } from "encaps-component-factory";
export declare function connect(stateToComponentState?: (state: any, props: any) => any, dispatchToComponentDispatch?: (dispatch: (action: IAction<any>) => void, props: any) => any): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>;
export declare function setReduxAsDefaultConnect(): void;
