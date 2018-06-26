export const ACTIONS_DELIMITER = ".";

export interface IAction<P> {
	type: string;
	payload?: P;
}

export interface IActionCreator<T>{
	(payload?: T):  IAction<T>;
}

// export type Dispatch = (action: IAction<any>) => void;

export type Reducer<S, A = any> = (state?: S, action?: IAction<A>) => S;

// export type ComponentPath = string | string[];
