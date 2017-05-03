/// <reference types="react" />
import * as React from "react";
import { Dispatch } from "encaps-component-factory";
export declare function connect(stateToComponentState?: (state: any, props: any) => any, dispatchToComponentDispatch?: (dispatch: Dispatch, props: any) => Dispatch): (component: React.StatelessComponent<any> | React.ComponentClass<any>) => React.StatelessComponent<any>;
export default connect;
