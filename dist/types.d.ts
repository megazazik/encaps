export declare const ACTIONS_DELIMITER = ".";
export interface IAction<P> {
    type: string;
    payload?: P;
}
export interface IActionCreator<T> {
    (payload?: T): IAction<T>;
}
export declare type Reducer<S, A = any> = (state?: S, action?: IAction<A>) => S;
