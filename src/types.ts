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

export interface IChildProps<S> {
	doNotAccessThisInnerState: S;
	doNotAccessThisInnerDispatch: (action: IAction<any>) => void;
}

export type GetChildProps = (id: string) => IChildProps<any>;

export interface IParentProps {
	getChild: GetChildProps;
}

export type ViewProps<P, S> = P & {state: S, dispatch: Dispatch} & IParentProps;

export type IPublicActions<Actions, SubActions> = {[K in keyof Actions]: (p: Actions[K]) => void} &
	{[SK in keyof SubActions]: (key: string, p: SubActions[SK]) => void};