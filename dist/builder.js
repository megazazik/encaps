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
        this._childs = {};
        this._handlers = {};
        this._subHandlers = {};
        this._childDispatchs = {};
        this._builders = {};
    }
    ComponentBuilder.prototype.setInitState = function (f) {
        this._initState = f;
    };
    ComponentBuilder.prototype.addHandler = function (id, handler) {
        this._handlers[id] = handler;
        return function (payload) { return ({ type: id, payload: payload }); };
    };
    ComponentBuilder.prototype.addDispatchedHandler = function (id, handler) {
        var actionCreator = this.addHandler(id, handler);
        return function (dispatch, payload) { return dispatch(actionCreator(payload)); };
    };
    ComponentBuilder.prototype.addSubHandler = function (id, handler) {
        this._subHandlers[id] = handler;
        return function (dispatch, key) { return exports.wrapDispatch(dispatch, joinKeys(id, key)); };
    };
    ComponentBuilder.prototype.setGetProps = function (getProps) {
        this._getProps = getProps;
    };
    ComponentBuilder.prototype.addChildBuilder = function (key, builder) {
        this._childs[key] = builder;
        return function (dispatch) { return exports.wrapDispatch(dispatch, key); };
    };
    ComponentBuilder.prototype.addBuilder = function (key, builder) {
        this._builders[key] = builder;
        return function (dispatch) { return exports.wrapDispatch(dispatch, key); };
    };
    ComponentBuilder.prototype.getController = function () {
        return new Controller(this._initState, this._builders, this._childs, this._handlers, this._subHandlers, this._getProps);
    };
    return ComponentBuilder;
}());
var Controller = (function () {
    function Controller(_initState, _builders, _childs, _handlers, _subHandlers, _getProps) {
        if (_builders === void 0) { _builders = {}; }
        if (_childs === void 0) { _childs = {}; }
        if (_handlers === void 0) { _handlers = {}; }
        if (_subHandlers === void 0) { _subHandlers = {}; }
        this._initState = _initState;
        this._builders = _builders;
        this._childs = _childs;
        this._handlers = _handlers;
        this._subHandlers = _subHandlers;
        this._getProps = _getProps;
        this._childDispatchs = {};
        this._init();
    }
    Controller.prototype._init = function () {
        this._builtGetProps = this._buildGetProps();
        this._builtInitState = this._buildInitState();
        this._builtReducer = this._buildReducer();
    };
    Controller.prototype.getComponent = function (View, propToViewProps) {
        if (propToViewProps === void 0) { propToViewProps = function (props) { return ({}); }; }
        var getProps = this.getGetProps();
        return function (props) {
            return React.createElement(View, __assign({}, getProps(props.doNotAccessThisInnerState, props.doNotAccessThisInnerDispatch, props), propToViewProps(props)));
        };
    };
    Controller.prototype.getGetProps = function () {
        return this._builtGetProps;
    };
    Controller.prototype._buildGetProps = function () {
        var _this = this;
        return function (state, dispatch, props) {
            var newProps = !!_this._getProps ? _this._getProps(state, dispatch, props) : {};
            for (var builderKey in _this._builders) {
                newProps = __assign({}, newProps, (_a = {}, _a[builderKey] = _this._builders[builderKey].getGetProps()(state[builderKey], _this._getChildDispatch(dispatch, builderKey), __assign({}, props, newProps[builderKey])), _a));
            }
            for (var childKey in _this._childs) {
                newProps[childKey] = createChildProps(state[childKey], _this._getChildDispatch(dispatch, childKey));
            }
            return newProps;
            var _a;
        };
    };
    Controller.prototype._getChildDispatch = function (dispatch, key) {
        if (!this._childDispatchs[key]) {
            this._childDispatchs[key] = exports.wrapDispatch(dispatch, key);
        }
        return this._childDispatchs[key];
    };
    Controller.prototype.getInitState = function () {
        return this._builtInitState;
    };
    Controller.prototype._buildInitState = function () {
        var _this = this;
        return function () {
            var initState = !!_this._initState ? _this._initState() : {};
            for (var builderKey in _this._builders) {
                initState[builderKey] = initState[builderKey] || _this._builders[builderKey].getInitState()();
            }
            for (var childKey in _this._childs) {
                initState[childKey] = initState[childKey] || _this._childs[childKey].getInitState()();
            }
            return initState;
        };
    };
    Controller.prototype.getReducer = function () {
        return this._builtReducer;
    };
    Controller.prototype._buildReducer = function () {
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
    return Controller;
}());
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
