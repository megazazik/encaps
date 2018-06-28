import { IAction, Reducer, IActionCreator } from "./types";
export interface Dictionary<T = any> {
    [key: string]: T;
}
export declare type IPublicActionCreators<Actions> = {
    [K in keyof Actions]: IActionCreator<Actions[K]>;
};
export interface IController<S extends Dictionary = {}, Actions extends Dictionary = {}, Children extends Dictionary<IController> = {}> {
    /**
     * @returns Функции, которые создают дейтсвия
     */
    readonly actions: IPublicActionCreators<Actions> & {
        [K in keyof Children]: Children[K]['actions'];
    };
    /**
     * @returns Reducer текущего контроллера
     */
    readonly reducer: Reducer<S>;
}
export interface IBuilder<S extends Dictionary = {}, Actions extends Dictionary = {}, Children extends Dictionary<IController> = {}> extends IController<S, Actions, Children> {
    readonly controller: IController<S, Actions, Children>;
    /**
     * Задает, функцию, которая возвращает начальное состояние
     * @returns новый строитель
     */
    setInitState<NS extends S>(f: (state: S) => NS): IBuilder<NS, Actions, Children>;
    /**
     * Добавляет действия
     * @returns новый строитель
     */
    action<AS extends Dictionary>(
    /** ассоциативный массив обработчиков действия */
    handlers: {
        [K in keyof AS]: (state: S, action: IAction<AS[K]>) => S;
    }): IBuilder<S, Actions & AS, Children>;
    /**
     * Добавляет дочерний контроллер
     * @returns новый строитель
     */
    child<K extends string, CS, A, C extends Dictionary<IController>>(
    /** идентификатор дочернего контроллера */
    key: K, 
    /** дочерний контроллер */
    controller: IController<CS, A, C> | IBuilder<CS, A, C>): IBuilder<S & {
        [P in K]: CS;
    }, Actions, Children & {
        [P in K]: IController<CS, A, C>;
    }>;
}
export declare function build(): IBuilder;
export declare function build<S, A, Children extends Dictionary<IController>>(controller: IController<S, A, Children>): IBuilder<S, A, Children>;
export declare const builder: IBuilder<{}, {}, {}>;
