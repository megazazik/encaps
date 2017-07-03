/// <reference types="react" />
import * as React from "react";
import { IController } from "encaps-component-factory/controller";
export interface IConnectParams {
    stateToProps: (stateProps: any, props: any) => any;
    dispatchToProps: (dispatchProps: any, props: any) => any;
    controller: IController<any, any, any>;
    path: string | string[];
    noConvertToComponentProps: boolean;
}
export declare function connect(params?: Partial<IConnectParams>): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>;
export default connect;
