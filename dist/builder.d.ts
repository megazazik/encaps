/// <reference types="react" />
import * as React from "react";
import { IAction, Reducer, IChildProps, ISubAction } from "./types";
/**
 * Базовый класс для построения компонентов
 * @type P тип свойств
 * @type S тип состояния
 * @type ViewP тип свойств внутреннего представления
 */
export declare class ComponentBuilder<P, S, ViewP> {
    protected _initState: () => S;
    getInitState(): () => S;
    /**
     * Задает, функцию, которая возвращает начальное состояние
     * @param props свойства переданные элементу при инициализации
     */
    setInitState(f: () => S): void;
    protected _handlers: {
        [id: string]: Reducer<S>;
    };
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
    private _subHandlers;
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    addSubHandler(id: string, handler: (state: S, action: ISubAction<any>) => S): (dispatch: (action: IAction<any>) => void, key: string) => (action: IAction<any>) => void;
    private _childDispatchs;
    private _getChildDispatch(dispatch, key);
    private _getProps;
    /**
     * Задает функцию, которая возвращает свойства представления
     * @param getProps функция, возвращающая свойства
     */
    setGetProps(getProps: (state: S, dispatch: (action: IAction<any>) => void, props: P) => ViewP): void;
    buildGetProps(): (state: S, dispatch: (action: IAction<any>) => void, props: P) => ViewP;
    /**
     * Создает компонент
     * @param view представление, используемое для отображения
     * @returns Созданный компонен
     */
    getComponent<FP, FR>(View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>, propToViewProps: (props: FP) => FR): React.StatelessComponent<P & IChildProps & FR>;
    getComponent(View: React.StatelessComponent<ViewP> | React.ComponentClass<ViewP>): React.StatelessComponent<P & IChildProps>;
    /**
     * Возвращает функцию, обрабатывающую действия
     * @returns Reducer
     */
    getReducer(): Reducer<S>;
    protected _childs: {
        [key: string]: ComponentBuilder<any, any, any>;
    };
    /**
     * Добавляет дочерний компонент
     * @param key - индетификатор дочечернего компонента
     * @param builder - объект для построения дочернего компонента
     */
    addChildBuilder(key: string, builder: ComponentBuilder<any, any, any>): (dispatch: (action: IAction<any>) => void) => (action: IAction<any>) => void;
    protected _builders: {
        [key: string]: ComponentBuilder<any, any, any>;
    };
    /**
     * Добавляет расширяемый компонент
     * @param key - индетификатор расширяемого компонента
     * @param builder - объект для построения расширяемого компонента
     */
    addBuilder(key: string, builder: ComponentBuilder<any, any, any>): (dispatch: (action: IAction<any>) => void) => (action: IAction<any>) => void;
    cloneWithInitState(f: () => S): ComponentBuilder<P, S, ViewP>;
}
export declare const unwrapAction: (action: IAction<any>) => {
    action: IAction<any>;
    key: string;
};
export declare const createChildProps: (state: any, dispatch: (action: IAction<any>) => void) => IChildProps;
export declare const wrapDispatch: (dispatch: (action: IAction<any>) => void, key: string) => (action: IAction<any>) => void;
export declare function createBuilder<P, S, ViewP>(): ComponentBuilder<P, S, ViewP>;
