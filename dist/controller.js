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
var types_1 = require("./types");
/**
 * Класс для построения компонентов
 * @type S тип состояния
 */
var ComponentBuilder = (function () {
    function ComponentBuilder() {
        this._handlers = {};
        this._subHandlers = {};
        this._childDispatchs = {};
        this._children = {};
        this._wrapChildDispatch = {};
        this._selectState = function (state) { return state; };
        this._selectDispatch = function (dispatch) { return dispatch; };
    }
    ComponentBuilder.prototype.setInitState = function (f) {
        this._initState = f;
    };
    ComponentBuilder.prototype.action = function (id, handler) {
        this._handlers[id] = handler;
        return function (payload) { return ({ type: id, payload: payload }); };
    };
    ComponentBuilder.prototype.subAction = function (id, handler) {
        this._subHandlers[id] = handler;
        return function (dispatch, key) { return exports.wrapDispatch(dispatch, joinKeys(id, key)); };
    };
    ComponentBuilder.prototype.setSelectState = function (selectState) {
        this._selectState = selectState;
    };
    ComponentBuilder.prototype.setSelectDispatch = function (selectDispatch) {
        this._selectDispatch = selectDispatch;
    };
    ComponentBuilder.prototype.addChild = function (key, controller, wrapChildDispatch) {
        if (wrapChildDispatch === void 0) { wrapChildDispatch = function (origin, child) { return child; }; }
        this._children[key] = controller;
        this._wrapChildDispatch[key] = wrapChildDispatch;
        return function (dispatch) { return wrapChildDispatch(dispatch, exports.wrapDispatch(dispatch, key)); };
    };
    ComponentBuilder.prototype.getController = function () {
        return new Controller(this._initState, this._children, this._handlers, this._subHandlers, this._wrapChildDispatch, this._selectState, this._selectDispatch);
    };
    return ComponentBuilder;
}());
var Controller = (function () {
    function Controller(_initState, _children, _handlers, _subHandlers, _wrapChildDispatch, _selectState, _selectDispatch) {
        if (_children === void 0) { _children = {}; }
        if (_handlers === void 0) { _handlers = {}; }
        if (_subHandlers === void 0) { _subHandlers = {}; }
        if (_wrapChildDispatch === void 0) { _wrapChildDispatch = {}; }
        this._initState = _initState;
        this._children = _children;
        this._handlers = _handlers;
        this._subHandlers = _subHandlers;
        this._wrapChildDispatch = _wrapChildDispatch;
        this._selectState = _selectState;
        this._selectDispatch = _selectDispatch;
        this._childDispatchs = {};
        this._init();
    }
    Controller.prototype._init = function () {
        this._builtInitState = this._buildInitState();
        this._builtReducer = this._buildReducer();
        this._builtSelectState = this._buildSelectState();
    };
    Controller.prototype._getChildDispatch = function (dispatch, key) {
        if (!this._childDispatchs[key]) {
            this._childDispatchs[key] = this._wrapChildDispatch[key](dispatch, exports.wrapDispatch(dispatch, key));
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
            for (var builderKey in _this._children) {
                initState[builderKey] = initState[builderKey] || _this._children[builderKey].getInitState()();
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
            return _this._handlers.hasOwnProperty(key || baseAction.type) ?
                _this._handlers[key || baseAction.type](state, action) :
                _this._subHandlers.hasOwnProperty(key) ?
                    _this._subHandlers[key](state, getSubAction(action)) :
                    _this._children.hasOwnProperty(key) ? __assign({}, state, (_b = {}, _b[key] = _this._children[key].getReducer()(state[key], action), _b)) :
                        state;
            var _b;
        };
    };
    Controller.prototype.getWrapDispatch = function (paramPath) {
        var _this = this;
        if (!paramPath) {
            throw new Error("The 'path' parameter must be specified.");
        }
        var path = typeof paramPath === 'string' ? paramPath.split(types_1.ACTIONS_DELIMITER) : paramPath;
        return function (dispatch) {
            if (!path.length) {
                return dispatch;
            }
            else if (path.length === 1) {
                return _this._getChildDispatch(dispatch, path[0]);
            }
            else {
                var childController = _this._children[path[0]];
                if (!childController) {
                    return _this._getChildDispatch(dispatch, path[0]);
                }
                else {
                    return childController.getWrapDispatch(path.slice(1))(_this._getChildDispatch(dispatch, path[0]));
                }
            }
        };
    };
    Controller.prototype._buildSelectState = function () {
        var _this = this;
        return function (state) {
            return Object.keys(_this._children).reduce(function (publicState, builderKey) {
                return (__assign({}, publicState, (_a = {}, _a[builderKey] = _this._children[builderKey].getSelectState()(state[builderKey]), _a)));
                var _a;
            }, _this._selectState(state));
        };
    };
    Controller.prototype.getSelectState = function () {
        return this._builtSelectState;
    };
    Controller.prototype.getSelectDispatch = function () {
        return this._selectDispatch;
    };
    Controller.prototype.getController = function (id) {
        return this._children[id] || null;
    };
    return Controller;
}());
exports.unwrapAction = function (action) {
    return {
        key: action.type.substring(0, action.type.indexOf(types_1.ACTIONS_DELIMITER)),
        action: {
            payload: action.payload,
            type: action.type.substring(action.type.indexOf(types_1.ACTIONS_DELIMITER) + 1)
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
    return keys.join(types_1.ACTIONS_DELIMITER);
};
exports.wrapDispatch = function (dispatch, key) {
    return function (action) {
        dispatch({ type: joinKeys(key, action.type), payload: action.payload });
    };
};
function createBuilder() {
    return new ComponentBuilder();
}
exports.createBuilder = createBuilder;
//# sourceMappingURL=controller.js.map