/// <reference types="react" />
import * as React from "react";
import { IAction, Reducer, IChildProps, ISubAction } from "./types";
export interface IController<P, S, ViewP> {
    getInitState(): () => S;
    getComponent<FP, FR>(View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, propToViewProps: (props: FP) => FR, pure?: boolean): React.ComponentClass<P & IChildProps<S> & FR>;
    getComponent(View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>): React.ComponentClass<P & IChildProps<S>>;
    /**
     * Возвращает функцию, обрабатывающую действия
     * @returns Reducer
     */
    getReducer(): Reducer<S>;
    getGetProps(): (state: S, dispatch: (action: IAction<any>) => void, props: P) => ViewP;
}
export interface IBuilder<P, S, ViewP> {
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
    addHandler<T>(id: string, handler: (state: S, action: IAction<T>) => S): (payload: T) => IAction<T>;
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для вызова действий
     */
    addDispatchedHandler<T>(id: string, handler: (state: S, action: IAction<T>) => S): (dispatch: (action: IAction<any>) => void, payload: T) => void;
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    addSubHandler(id: string, handler: (state: S, action: ISubAction<any>) => S): (dispatch: (action: IAction<any>) => void, key: string) => (action: IAction<any>) => void;
    /**
     * Задает функцию, которая возвращает свойства представления
     * @param getProps функция, возвращающая свойства
     */
    setGetProps(getProps: (state: S, dispatch: (action: IAction<any>) => void, props: P) => ViewP): void;
    /**
     * Добавляет дочерний компонент
     * @param key - индетификатор дочечернего компонента
     * @param builder - объект для построения дочернего компонента
     */
    addChildBuilder(key: string, builder: IController<any, any, any>): (dispatch: (action: IAction<any>) => void) => (action: IAction<any>) => void;
    /**
     * Добавляет расширяемый компонент
     * @param key - индетификатор расширяемого компонента
     * @param builder - объект для построения расширяемого компонента
     */
    addBuilder(key: string, builder: IController<any, any, any>): (dispatch: (action: IAction<any>) => void) => (action: IAction<any>) => void;
    /**
     * Создает контроллер копмпонента
     * @returns объект для создани компонента
     */
    getController(): IController<P, S, ViewP>;
}
export declare const unwrapAction: (action: IAction<any>) => {
    action: IAction<any>;
    key: string;
};
export declare function createChildProps<S>(state: S, dispatch: (action: IAction<any>) => void): IChildProps<S>;
export declare const wrapDispatch: (dispatch: (action: IAction<any>) => void, key: string) => (action: IAction<any>) => void;
export declare function createBuilder<P, S, ViewP>(): IBuilder<P, S, ViewP>;
