export interface IAction<P> {
	type: string;
	payload: P;
}

export type Dispatch = (action: IAction<any>) => void;

export interface ISubAction<P> extends IAction<P> {
	key: string;
}

export type Reducer<S> = (state: S, action: IAction<any>) => S;

export interface IChildProps<S> {
	doNotAccessThisInnerState: S;
	doNotAccessThisInnerDispatch: (action: IAction<any>) => void;
}

export type ViewProps<P, S> = P & {state: S, dispatch: Dispatch};