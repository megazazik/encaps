import { IAction, Reducer, SubReducer, Dispatch, IActionCreator, ISubActionCreator, ComponentPath } from "./types";
export interface IActionTypes {
    [key: string]: any;
}
export declare type IPublicActions<Actions, SubActions> = {
    [K in keyof Actions]: IActionCreator<Actions[K]>;
} & {
    [SK in keyof SubActions]: ISubActionCreator<SubActions[SK]>;
};
export interface IController<S extends object = {}, Actions extends IActionTypes = {}, SubActions extends IActionTypes = {}> {
    /**
     * Возвращает начальное состояние
     */
    getInitState(): S;
    /**
     * Возвращает функции, которые создают дейтсвия
     */
    getActions(): IPublicActions<Actions, SubActions>;
    /**
     * Возвращает функцию, обрабатывающую действия
     * @returns Reducer
     */
    getReducer(): Reducer<S>;
    /**
     * Возвращает функцию dispatch для дочернего компонента по заданному идентификатору
     * @param path идентификатор дочернего компонента, или массив идентификаторов
     * @param dispatch dispatch текущего компонента
     */
    /**
     * Возвращает состояние дочернего компонента по заданному идентификатору
     * @param path идентификатор дочернего компонента, или массив идентификаторов
     * @param state состояние текущего компонента
     */
    /**
     * Возвращает ассоциативный массив дочерних контроллеров
     */
    getChildren(): {
        [key: string]: IController<any, any, any>;
    };
}
export interface IBuilder<S extends object = {}, Actions extends IActionTypes = {}, SubActions extends IActionTypes = {}> {
    /**
     * Задает, функцию, которая возвращает начальное состояние
     */
    setInitState<NS extends object>(f: () => NS): IBuilder<S & NS, Actions, SubActions>;
    /**
     * Добавляет обработчик действия
     * @param handlers ассоциативный массив обработчиков действия
     */
    action<AS extends IActionTypes>(handlers: {
        [K in keyof AS]: Reducer<S, AS[K]>;
    } & {
        [key: string]: Reducer<any, any>;
    }): IBuilder<S, Actions & AS, SubActions>;
    /**
     * Добавляет обработчик параметризированных действий
     * @param handlers ассоциативный массив обработчиков действия
     */
    subAction<AS extends IActionTypes>(handlers: {
        [K in keyof AS]: SubReducer<S, AS[K]>;
    } & {
        [key: string]: SubReducer<any, any>;
    }): IBuilder<S, Actions, SubActions & AS>;
    /**
     * Добавляет дочерний компонент
     * @param key индетификатор дочернего компонента
     * @param controller контроллер дочернего компонента
     * @param wrapChildDispatch функция, оборачивающая dispatch дочернего компонента
     */
    addChild(key: string, controller: IController<any, any>): IBuilder<S, Actions, SubActions>;
    /**
     * Создает контроллер компонента
     * @returns объект для создани компонента
     */
    getController(): IController<S, Actions, SubActions>;
}
export declare const unwrapAction: (action: IAction<any>) => {
    action: IAction<any>;
    key: string;
};
export declare const joinKeys: (...keys: string[]) => string;
export declare const wrapDispatch: (key: string | string[], dispatch: Dispatch) => Dispatch;
export declare function getStatePart(path: ComponentPath, state: any): any;
export declare function getChildController(controller: IController<any, any>, path: ComponentPath): IController<any, any>;
export declare function createBuilder(): IBuilder;
