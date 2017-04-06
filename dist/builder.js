"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ACTIONS_DELIMITER = ".";
/**
 * Базовый класс для построения компонентов
 * @type P тип свойств
 * @type S тип состояния
 * @type ViewP тип свойств внутреннего представления
 */
var ComponentBuilder = (function () {
    function ComponentBuilder() {
        this._handlers = {};
        this._subHandlers = {};
        this._childDispatchs = {};
        this._childs = {};
        this._builders = {};
    }
    ComponentBuilder.prototype.getInitState = function () {
        var _this = this;
        return function () {
            var initState = !!_this._initState ? _this._initState() : {};
            for (var builderKey in _this._builders) {
                initState[builderKey] = _this._builders[builderKey].getInitState()();
            }
            for (var childKey in _this._childs) {
                initState[childKey] = _this._childs[childKey].getInitState()();
            }
            return initState;
        };
    };
    /**
     * Задает, функцию, которая возвращает начальное состояние
     * @param props свойства переданные элементу при инициализации
     */
    ComponentBuilder.prototype.setInitState = function (f) {
        this._initState = f;
    };
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    ComponentBuilder.prototype.addHandler = function (id, handler) {
        this._handlers[id] = handler;
        return function (payload) { return ({ type: id, payload: payload }); };
    };
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для вызова действий
     */
    ComponentBuilder.prototype.addDispatchedHandler = function (id, handler) {
        var actionCreator = this.addHandler(id, handler);
        return function (dispatch, payload) { return dispatch(actionCreator(payload)); };
    };
    /**
     * Добавляет обработчик действия
     * @param id идентификатор действия
     * @param handler обработчик действия
     * @returns метод для создания действий
     */
    ComponentBuilder.prototype.addSubHandler = function (id, handler) {
        this._subHandlers[id] = handler;
        return function (dispatch, key) { return exports.wrapDispatch(dispatch, joinKeys(id, key)); };
    };
    ComponentBuilder.prototype._getChildDispatch = function (dispatch, key) {
        if (!this._childDispatchs[key]) {
            this._childDispatchs[key] = exports.wrapDispatch(dispatch, key);
        }
        return this._childDispatchs[key];
    };
    /**
     * Задает функцию, которая возвращает свойства представления
     * @param getProps функция, возвращающая свойства
     */
    ComponentBuilder.prototype.setGetProps = function (getProps) {
        this._getProps = getProps;
    };
    ComponentBuilder.prototype.buildGetProps = function () {
        var _this = this;
        return function (state, dispatch, props) {
            var newProps = !!_this._getProps ? _this._getProps(state, dispatch, props) : {};
            for (var builderKey in _this._builders) {
                newProps = __assign({}, newProps, (_a = {}, _a[builderKey] = _this._builders[builderKey].buildGetProps()(state[builderKey], _this._getChildDispatch(dispatch, builderKey), __assign({}, props, newProps[builderKey])), _a));
            }
            for (var childKey in _this._childs) {
                newProps[childKey] = createChildProps(state[childKey], _this._getChildDispatch(dispatch, childKey));
            }
            return newProps;
            var _a;
        };
    };
    ComponentBuilder.prototype.getComponent = function (View, propToViewProps) {
        if (propToViewProps === void 0) { propToViewProps = function (props) { return ({}); }; }
        var getProps = this.buildGetProps();
        return function (props) {
            return React.createElement(View, __assign({}, getProps(props.doNotAccessThisInnerState, props.doNotAccessThisInnerDispatch, props), propToViewProps(props)));
        };
    };
    /**
     * Возвращает функцию, обрабатывающую действия
     * @returns Reducer
     */
    ComponentBuilder.prototype.getReducer = function () {
        var _this = this;
        return function (state, baseAction) {
            if (state === void 0) { state = _this.getInitState()(); }
            if (baseAction === void 0) { baseAction = { type: "", payload: null }; }
            var _a = exports.unwrapAction(baseAction), key = _a.key, action = _a.action;
            return _this._handlers.hasOwnProperty(key || baseAction.type) ? _this._handlers[key || baseAction.type](state, action) :
                _this._subHandlers.hasOwnProperty(key) ? _this._subHandlers[key](state, getSubAction(action)) :
                    _this._builders.hasOwnProperty(key) ? __assign({}, state, (_b = {}, _b[key] = _this._builders[key].getReducer()(state[key], action), _b)) :
                        _this._childs.hasOwnProperty(key) ? __assign({}, state, (_c = {}, _c[key] = _this._childs[key].getReducer()(state[key], action), _c)) :
                            state;
            var _b, _c;
        };
    };
    /**
     * Добавляет дочерний компонент
     * @param key - индетификатор дочечернего компонента
     * @param builder - объект для построения дочернего компонента
     */
    ComponentBuilder.prototype.addChildBuilder = function (key, builder) {
        this._childs[key] = builder;
        return function (dispatch) { return exports.wrapDispatch(dispatch, key); };
    };
    /**
     * Добавляет расширяемый компонент
     * @param key - индетификатор расширяемого компонента
     * @param builder - объект для построения расширяемого компонента
     */
    ComponentBuilder.prototype.addBuilder = function (key, builder) {
        this._builders[key] = builder;
        return function (dispatch) { return exports.wrapDispatch(dispatch, key); };
    };
    ComponentBuilder.prototype.cloneWithInitState = function (f) {
        var cloneBuilder = createBuilder();
        cloneBuilder._initState = f;
        cloneBuilder._childs = this._childs;
        cloneBuilder._handlers = this._handlers;
        cloneBuilder._subHandlers = this._subHandlers;
        cloneBuilder._builders = this._builders;
        cloneBuilder._getProps = this._getProps;
        return cloneBuilder;
    };
    return ComponentBuilder;
}());
exports.ComponentBuilder = ComponentBuilder;
exports.unwrapAction = function (action) {
    return {
        key: action.type.substring(0, action.type.indexOf(ACTIONS_DELIMITER)),
        action: {
            payload: action.payload,
            type: action.type.substring(action.type.indexOf(ACTIONS_DELIMITER) + 1)
        }
    };
};
var getSubAction = function (baseAction) {
    var _a = exports.unwrapAction(baseAction), key = _a.key, action = _a.action;
    return __assign({}, action, { key: key });
};
var joinKeys = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return keys.join(ACTIONS_DELIMITER);
};
function createChildProps(state, dispatch) {
    return {
        doNotAccessThisInnerState: state,
        doNotAccessThisInnerDispatch: dispatch
    };
}
exports.createChildProps = createChildProps;
exports.wrapDispatch = function (dispatch, key) {
    return function (action) {
        dispatch({ type: joinKeys(key, action.type), payload: action.payload });
    };
};
function createBuilder() {
    return new ComponentBuilder();
}
exports.createBuilder = createBuilder;
