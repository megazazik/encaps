export declare const ACTIONS_DELIMITER = ".";
export interface IAction<P> {
    type: string;
    payload?: P;
    actions?: Array<IAction<any>>;
}
export interface IActionCreator<T> {
    (payload?: T): IAction<T>;
    type?: string;
}
export declare type Reducer<S, A = any> = (state?: S, action?: IAction<A>) => S;
export declare type ModelState<T> = T extends {
    actions: any;
    reducer: (...args: any[]) => infer R;
} ? R : any;
export declare type ModelActions<T> = T extends {
    actions: infer A;
    reducer: (...args: any[]) => any;
} ? A : any;
