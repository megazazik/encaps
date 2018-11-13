import { IAction, Reducer, IActionCreator, ModelActions, ModelState } from "./types";
export interface Dictionary<T = any> {
    [key: string]: T;
}
export declare type IPublicActionCreators<Actions> = {
    [K in keyof Actions]: IActionCreator<Actions[K]>;
};
export interface IActionCreators {
    [key: string]: (IActionCreator<any> | IActionCreators | ((...args: any[]) => IActionCreators));
}
export interface IModel<Actions extends IActionCreators = {}, State = {}> {
    /**
     * Функции, которые создают дейтсвия
     */
    readonly actions: Actions;
    /**
     * Reducer текущего контроллера
     */
    readonly reducer: Reducer<State>;
}
declare type AdditionalActionCreators<Creators, BaseCreators = Creators> = {
    [K in keyof Creators]?: Creators[K] extends IActionCreator<infer U> ? ((payload: U, actions: BaseCreators) => IAction<any>) : AdditionalActionCreators<Creators[K], BaseCreators>;
};
export interface IBuilder<Actions extends IActionCreators = {}, State = {}> extends IModel<Actions, State> {
    readonly model: IModel<Actions, State>;
    /**
     * Задает, функцию, которая возвращает начальное состояние
     * @returns новый строитель
     *
     * @deprecated Will be removed in the next version. Use initState instead.
     */
    setInitState<NewState extends State>(f: (state: State) => NewState): IBuilder<Actions, NewState>;
    /**
     * Задает, функцию, которая возвращает начальное состояние
     * @returns новый строитель
     */
    initState<NewState extends State>(f: (state: State) => NewState): IBuilder<Actions, NewState>;
    /**
     * Добавляет действия
     * @returns новый строитель
     *
     * @deprecated Will be removed in the next version. Use handlers instead.
     */
    action<AS extends Dictionary>(
    /** ассоциативный массив обработчиков действия */
    handlers: {
        [K in keyof AS]: (state: State, action: IAction<AS[K]>) => State;
    }): IBuilder<Actions & IPublicActionCreators<AS>, State>;
    /**
     * Добавляет действия
     * @returns новый строитель
     */
    handlers<AS extends Dictionary>(
    /** ассоциативный массив обработчиков действия */
    handlers: {
        [K in keyof AS]: (state: State, action: IAction<AS[K]>) => State;
    }): IBuilder<Actions & IPublicActionCreators<AS>, State>;
    /**
     * Добавляет дочерний контроллер
     * @returns новый строитель
     */
    child<K extends string, CActions extends IActionCreators, CState>(
    /** идентификатор дочернего контроллера */
    key: K, 
    /** дочерний контроллер */
    model: IModel<CActions, CState> | IBuilder<CActions, CState>): IBuilder<Actions & {
        [P in K]: CActions;
    }, State & {
        [P in K]: CState;
    }>;
    /**
     * Добавляет дочерний контроллер
     * @returns новый строитель
     */
    children<AS extends Dictionary<IModel | IBuilder>>(
    /** ассоциативный массив дочерних моделей */
    children: AS): IBuilder<Actions & {
        [C in keyof AS]: ModelActions<AS[C]>;
    }, State & {
        [C in keyof AS]: ModelState<AS[C]>;
    }>;
    /**
     * Оборачивает функции, создающие действия
     * @returns новый строитель
     */
    subActions(
    /** ассоциативный массив функций, создающих дополнительные действия */
    wrapers: AdditionalActionCreators<Actions>): IBuilder<Actions, State>;
    /**
     * Позволяет создавать любые действия, не только простые объекты
     * @returns новый строитель
     */
    effect<K extends string, P extends any[], A>(
    /** тип действия */
    key: K, 
    /** Функция, которая создает действия не в виде простых объектов */
    effect: (actions: Actions) => (...args: P) => A): IBuilder<Actions & {
        [F in K]: (...args: P) => A;
    }, State>;
    /**
     * Позволяет создавать любые действия, не только простые объекты
     * @returns новый строитель
     */
    effects<EF extends Dictionary<(actions: Actions) => (...args: any[]) => any>>(
    /** ассоциативный массив дочерних моделей */
    effects: EF): IBuilder<Actions & {
        [C in keyof EF]: ReturnType<EF[C]>;
    }, State>;
}
export declare function getSubActions(action: IAction<any>): IAction<any>[];
export declare const unwrapAction: (action: IAction<any>) => {
    action: IAction<any>;
    key: string;
};
export declare function wrapChildActionCreators(wrap: (action: IAction<any>) => IAction<any>, actions: any): any;
export declare function wrapAction(key: string): <A>(action: IAction<A>) => {
    type: string;
    payload?: A;
    actions?: IAction<any>[];
};
export declare const joinKeys: (...keys: string[]) => string;
export declare function addSubActions<T extends IActionCreators>(actions: T, wrappers: AdditionalActionCreators<T>): T;
export declare function decomposeKeys(list: object, parentKey?: string): {
    [key: string]: any;
};
export declare function createEffect(effect: (actions: any) => any, getActions: (...agrs: any[]) => any): (...args: any[]) => any;
export declare function wrapEffect(wrapActions: any, effect: any): (...args: any[]) => any;
export declare function isEffect(getter: any): boolean;
/** @deprecated will be removed in the next version. Use createEffect instead. */
export declare function markAsActionCreatorsGetter(getter: any): any;
export declare function build(): IBuilder;
export declare function build<Actions extends IActionCreators, State>(model: IModel<Actions, State>): IBuilder<Actions, State>;
export {};
