export const ACTIONS_DELIMITER = ".";

export interface IAction<P> {
	type: string;
	payload?: P;
	actions?: Array<IAction<any>>;
}

export interface IActionCreator<T>{
	(payload?: T):  IAction<T>;
}

export type Reducer<S, A = any> = (state?: S, action?: IAction<A>) => S;