export interface IAction<P> {
    type: string;
    payload: P;
}
export declare type Dispatch = (action: IAction<any>) => void;
export interface ISubAction<P> extends IAction<P> {
    key: string;
}
export declare type Reducer<S> = (state: S, action: IAction<any>) => S;
export interface IChildProps {
    doNotAccessThisInnerState?: {};
    doNotAccessThisInnerDispatch?: (action: IAction<any>) => void;
}
