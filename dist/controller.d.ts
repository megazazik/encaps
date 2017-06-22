import { IAction, Reducer, ISubAction, Dispatch } from "./types";
export interface IController<S extends object, PublicState extends object, PublicActions> {
    /**
     * Возвращает начальное состояние
     */
    getInitState(): () => S;
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
     * Возвращает публичное состояние компонента на основе его состояния
     * @param state текущее состояние
     */
    getSelectState(): (state: S) => PublicState;
    /**
     * Возвращает публичные свойства компонента, связанные с генерацией действий
     * @param dispatch функция для вызова действий
     */
    getSelectActions(): (dispatch: Dispatch) => PublicActions;
    /**
     * Возвращает дочерний контроллер
     * @param id Идентификатор дочернего контроллера
     */
    getController<CS extends object = any, CPubS extends object = any, CPubD = any>(id: string): IController<CS, CPubS, CPubD> | null;
}
export interface IBuilder<S extends object, PublicState extends object, PublicActions> {
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
    addChild(key: string, controller: IController<any, any, any>, wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch): (dispatch: Dispatch) => Dispatch;
    /**
     * Задает функцию, которая возвращает открытие свойства на основе текущего состояния
     * @param state текущее состояние
     */
    setSelectState(selectState: (state: S) => PublicState): void;
    /**
     * Задает функцию, которая возвращает открытие методы
     * @param dispatch функция, возбуждающия действия
     */
    setSelectActions(selectActions: (dispatch: Dispatch) => PublicActions): void;
    /**
     * Создает контроллер копмпонента
     * @returns объект для создани компонента
     */
    getController(): IController<S, PublicState, PublicActions>;
}
export declare const unwrapAction: (action: IAction<any>) => {
    action: IAction<any>;
    key: string;
};
export declare const wrapDispatch: (dispatch: Dispatch, key: string) => Dispatch;
export declare function getStatePart(state: any, path: string[]): any;
export declare function getChildController(controller: IController<any, any, any>, path: string | string[]): IController<any, any, any>;
export declare function createBuilder<S extends object>(): IBuilder<S, S, Dispatch>;
export declare function createBuilder<S extends object, PublicState extends object, PublicDispatch>(): IBuilder<S, PublicState, PublicDispatch>;
