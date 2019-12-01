export const ACTIONS_DELIMITER = ".";
export const INIT_STATE_ACTIONS = "__encaps_init_state__";

export type ICommonAction<
  Fields extends { [field: string]: any } = object
> = Fields & {
  type: string;
};

export type Action = ICommonAction<any> | IAction<any>;

export interface ICommonActionCreator<Fields, Agrs extends any[] = []> {
  (...args: Agrs): ICommonAction<Fields>;
}

export type IAction<P = undefined> = {
  type: string;
  /** @todo поместить в meta */
  actions?: Array<IAction<any> | ICommonAction<any>>;
} & Payload<P>;

type Payload<P> = P extends undefined ? { payload?: P } : { payload: P };

export interface IActionCreator<T, Agrs extends any[] = [T?]> {
  (...args: Agrs): IAction<T>;
}

export type Reducer<S, A = any> = (state?: S, action?: IAction<A>) => S;

export type ModelState<T> = T extends {
  actions: any;
  reducer: (...args) => infer R;
}
  ? R
  : any;
export type ModelActions<T> = T extends {
  actions: infer A;
  reducer: (...args) => any;
}
  ? A
  : any;
