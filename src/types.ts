export const ACTIONS_DELIMITER = ".";

export interface IAction<P> {
	type: string;
	payload?: P;
}

export interface ISubAction<P> extends IAction<P> {
	key: string;
}

export interface IActionCreator<T>{
	(payload?: T):  IAction<T>;
}

export interface ISubActionCreator<T>{
	(key: string, payload?: T):  IAction<T>;
}

export type Dispatch = (action: IAction<any>) => void;

export type Reducer<S, A = any> = (state: S, action: IAction<A>) => S;
export type SubReducer<S, A = any> = (state: S, action: ISubAction<A>) => S;

export type ComponentPath = string | string[];