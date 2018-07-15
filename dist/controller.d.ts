import { IAction, Reducer, IActionCreator } from "./types";
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
     */
    setInitState<NewState extends State>(f: (state: State) => NewState): IBuilder<Actions, NewState>;
    /**
     * Добавляет действия
     * @returns новый строитель
     */
    action<AS extends Dictionary>(
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
     * Оборачивает функции, создающие действия
     * @returns новый строитель
     */
    subActions(
    /** ассоциативный массив функций, создающих дополнительные действия */
    wrapers: AdditionalActionCreators<Actions>): IBuilder<Actions, State>;
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
export declare function markAsActionCreatorsGetter(getter: any): any;
export declare function isActionCreatorsGetter(getter: any): boolean;
export declare function build(): IBuilder;
export declare function build<Actions extends IActionCreators, State>(model: IModel<Actions, State>): IBuilder<Actions, State>;
export {};
