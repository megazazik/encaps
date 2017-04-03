export interface IAction<P> {
	type: string;
	payload: P;
}

export type Dispatch = (action: IAction<any>) => void;

export interface ISubAction<P> extends IAction<P> {
	key: string;
}

export type Reducer<S> = (state: S, action: IAction<any>) => S;

export interface IChildProps {
	doNotAccessThisInnerState?: {};
	doNotAccessThisInnerDispatch?: (action: IAction<any>) => void;
}