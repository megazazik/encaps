import { IAction, Reducer, ISubAction, Dispatch } from "./types";
export interface IController<S extends object, PublicActions = {}> {
    /**
     * Возвращает начальное состояние
     */
    readonly getInitState: () => S;
    /**
     * Возвращает функцию, обрабатывающую действия
     * @returns Reducer
     */
    getReducer(): Reducer<S>;
    /**
     * Возвращает функцию, которая принимает функцию dispatch текущего компонента
     * и возвращает функцию dispatch для дочернего компонента по заданному идентификатору
     * @param path идентификатор дочернего компонента, или массив идентификаторов
     * @param dispatch dispatch текущего компонента
     */
    getWrapDispatch(path: string | string[]): (dispatch: Dispatch) => Dispatch;
    /**
     * Возвращает функцию, которая принимает функцию dispatch текущего компонента
     * и возвращает функцию dispatch для дочернего компонента по заданному идентификатору
     * @param path идентификатор дочернего компонента, или массив идентификаторов
     * @param dispatch dispatch текущего компонента
     */
    getStatePart(path: string | string[]): (state: S) => any;
    /**
     * Возвращает функции, которые создают дейтсвия
     */
    readonly getActions: () => PublicActions;
    /**
     * Возвращает дочерний контроллер
     * @param id Идентификатор дочернего контроллера
     */
    getController<CS extends object = {}, CPubActions = any>(id: string): IController<CS, CPubActions> | null;
    /**
     * Возвращает ассоциативный массив дочерних контроллеров
     */
    getChildren(): {
        [key: string]: IController<any, any>;
    };
}
export interface IBuilder<S extends object, PublicActions = {}> {
    /**
     * Задает, функцию, которая возвращает начальное состояние
     * @param props свойства переданные элементу при инициализации
     */
    setInitState(f: () => S): void;
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    action<T>(id: string, handler: (state: S, action: IAction<T>) => S): (payload?: T) => IAction<T>;
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    subAction<T = any>(id: string, handler: (state: S, action: ISubAction<T>) => S): (key: string, payload?: T) => IAction<T>;
    /**
     * Добавляет расширяемый компонент
     * @param key - индетификатор расширяемого компонента
     * @param builder - объект для построения расширяемого компонента
     */
    addChild(key: string, controller: IController<any, any>, wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch): (dispatch: Dispatch) => Dispatch;
    /**
     * Создает контроллер копмпонента
     * @returns объект для создани компонента
     */
    getController(): IController<S, PublicActions>;
}
export declare const unwrapAction: (action: IAction<any>) => {
    action: IAction<any>;
    key: string;
};
export declare const joinKeys: (...keys: string[]) => string;
export declare const wrapDispatch: (dispatch: Dispatch, key: string) => Dispatch;
export declare function getStatePart(state: any, path: string[]): any;
export declare function getChildController(controller: IController<any, any>, path: string | string[]): IController<any, any>;
export declare function createBuilder<S extends object, Actions = {}>(): IBuilder<S, Actions>;
