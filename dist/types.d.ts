export declare const ACTIONS_DELIMITER = ".";
export interface IAction<P> {
    type: string;
    payload: P;
}
export declare type Dispatch = (action: IAction<any>) => void;
export interface ISubAction<P> extends IAction<P> {
    key: string;
}
export declare type Reducer<S> = (state: S, action: IAction<any>) => S;
export interface IChildProps<S> {
    doNotAccessThisInnerState: S;
    doNotAccessThisInnerDispatch: (action: IAction<any>) => void;
}
export declare type GetChildProps = (id: string) => IChildProps<any>;
export interface IParentProps {
    getChild: GetChildProps;
}
export declare type ViewProps<P, S> = P & {
    state: S;
    dispatch: Dispatch;
} & IParentProps;
