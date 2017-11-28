import { IAction, Dispatch } from 'encaps';
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

export type ComponentPath = string | string[];