/// <reference types="react" />
import * as React from "react";
import { IAction, Reducer, IChildProps, ISubAction, Dispatch, ViewProps } from "./types";
export interface IController<P, S, ViewP extends object> {
    getInitState(): () => S;
    getComponent<FP, FR>(View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, propToViewProps: (props: FP) => FR, pure?: boolean): React.ComponentClass<P & IChildProps<S> & FR>;
    getComponent(View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>): React.ComponentClass<P & IChildProps<S>>;
    /**
     * Возвращает функцию, обрабатывающую действия
     * @returns Reducer
     */
    getReducer(): Reducer<S>;
    /**
     * Возвращает свойства представления компонента на основе его состояния
     * В отличие от getStateToProps и getDispathToProps возвращает полные свойства, включающие свойства всех дочерних компонентов
     * @param state текущее состояние
     * @param dispatch функция для вызова действий
     * @param props свойства, переданные компоненту
     */
    getGetProps(): (state: S, dispatch: Dispatch, props: P) => ViewP;
    /**
     * Возвращает свойства представления компонента на основе его состояния
     * @param state текущее состояние
     * @param props свойства, переданные компоненту
     */
    getStateToProps(): (state: S, props: P) => Partial<ViewP>;
    /**
     * Возвращает свойства представления компонента, связанные с генерацией действий
     * @param dispatch функция для вызова действий
     * @param props свойства, переданные компоненту
     */
    getDispatchToProps(): (dispatch: Dispatch, props: P) => Partial<ViewP>;
}
export interface IBuilder<P, S, ViewP extends object> {
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
    addHandler<T>(id: string, handler: (state: S, action: IAction<T>) => S): (payload?: T) => IAction<T>;
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для вызова действий
     */
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    addSubHandler(id: string, handler: (state: S, action: ISubAction<any>) => S): (dispatch: Dispatch, key: string) => Dispatch;
    /**
     * Задает функцию, которая возвращает свойства представления
     * Если это свойство задано, то setStateToProps и setDispatchToProps не используются
     * @param getProps функция, возвращающая свойства
     */
    setGetProps(getProps: (state: S, dispatch: Dispatch, props: P) => ViewP): void;
    /**
     * Задает функцию, которая возвращает свойства представления на основе текущего состояния
     * @param getProps функция, возвращающая свойства
     */
    setStateToProps(getProps: (state: S, props: P) => Partial<ViewP>): void;
    /**
     * Задает функцию, которая возвращает свойства представления
     * @param getProps функция, возвращающая свойства
     */
    setDispatchToProps(getProps: (dispatch: Dispatch, props: P) => Partial<ViewP>): void;
    /**
     * Добавляет дочерний компонент
     * @param key - индетификатор дочечернего компонента
     * @param builder - объект для построения дочернего компонента
     */
    addChildBuilder(key: string, builder: IController<any, any, any>, wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch): (dispatch: Dispatch) => Dispatch;
    /**
     * Добавляет расширяемый компонент
     * @param key - индетификатор расширяемого компонента
     * @param builder - объект для построения расширяемого компонента
     */
    addBuilder(key: string, builder: IController<any, any, any>, wrapChildDispatch?: (origin: Dispatch, child: Dispatch) => Dispatch): (dispatch: Dispatch) => Dispatch;
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
export declare function createChildProps<S>(state: S, dispatch: Dispatch): IChildProps<S>;
export declare function childPropsEquals<S>(props1: IChildProps<S>, props2: IChildProps<S>): boolean;
export declare const wrapDispatch: (dispatch: Dispatch, key: string) => Dispatch;
export declare function createBuilder<P, S>(): IBuilder<P, S, ViewProps<P, S>>;
export declare function createBuilder<P, S, ViewP extends object>(): IBuilder<P, S, ViewP>;
