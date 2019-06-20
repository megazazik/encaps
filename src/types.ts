export const ACTIONS_DELIMITER = ".";
export const INIT_STATE_ACTIONS = "__encaps_init_state__"

export interface IAction<P> {
	type: string;
	payload?: P;
	actions?: Array<IAction<any>>;
}

export interface IActionCreator<T>{
	(payload?: T):  IAction<T>;
	type?: string
}

export type Reducer<S, A = any> = (state?: S, action?: IAction<A>) => S;

export type ModelState<T> = T extends {actions: any, reducer: (...args) => infer R} ? R : any;
export type ModelActions<T> = T extends {actions: infer A, reducer: (...args) => any} ? A : any;