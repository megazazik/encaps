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
        return function (key, payload) { return ({ type: exports.joinKeys(id, key), payload: payload }); };
    };
    ComponentBuilder.prototype.addChild = function (key, controller, wrapChildDispatch) {
        if (wrapChildDispatch === void 0) { wrapChildDispatch = function (origin, child) { return child; }; }
        this._children[key] = controller;
        this._wrapChildDispatch[key] = wrapChildDispatch;
        return function (dispatch) { return wrapChildDispatch(dispatch, exports.wrapDispatch(dispatch, key)); };
    };
    ComponentBuilder.prototype.getController = function () {
        return new Controller(this._initState, this._children, this._handlers, this._subHandlers, this._wrapChildDispatch);
    };
    return ComponentBuilder;
}());
var Controller = (function () {
    function Controller(_initState, _children, _handlers, _subHandlers, _wrapChildDispatch) {
        if (_children === void 0) { _children = {}; }
        if (_handlers === void 0) { _handlers = {}; }
        if (_subHandlers === void 0) { _subHandlers = {}; }
        if (_wrapChildDispatch === void 0) { _wrapChildDispatch = {}; }
        var _this = this;
        this._initState = _initState;
        this._children = _children;
        this._handlers = _handlers;
        this._subHandlers = _subHandlers;
        this._wrapChildDispatch = _wrapChildDispatch;
        this.getInitState = function () { return _this._builtGetInitState(); };
        this.getActions = function () { return (__assign({}, _this._builtActions)); };
        this._init();
    }
    Controller.prototype._init = function () {
        this._builtGetInitState = this._buildInitState();
        this._builtReducer = this._buildReducer();
        this._builtActions = this._buildActions();
    };
    Controller.prototype._getChildDispatch = function (dispatch, key) {
        return this._wrapChildDispatch[key](dispatch, exports.wrapDispatch(dispatch, key));
    };
    Controller.prototype._buildInitState = function () {
        var _this = this;
        return function () {
            var initState = !!_this._initState ? _this._initState() : {};
            for (var builderKey in _this._children) {
                initState[builderKey] = initState[builderKey] || _this._children[builderKey].getInitState();
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
            if (state === void 0) { state = _this.getInitState(); }
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
    Controller.prototype.getStatePart = function (paramPath) {
        if (!paramPath) {
            throw new Error("The 'path' parameter must be specified.");
        }
        var path = typeof paramPath === 'string' ? paramPath.split(types_1.ACTIONS_DELIMITER) : paramPath;
        return function (state) { return getStatePart(state, path); };
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
    Controller.prototype._buildActions = function () {
        return Object.keys(this._handlers).reduce(function (actions, action) {
            return (__assign({}, actions, (_a = {}, _a[action] = function (payload) { return ({ type: action, payload: payload }); }, _a)));
            var _a;
        }, Object.keys(this._subHandlers).reduce(function (actions, action) {
            return (__assign({}, actions, (_a = {}, _a[action] = function (key, payload) { return ({ type: exports.joinKeys(action, key), payload: payload }); }, _a)));
            var _a;
        }, {}));
    };
    Controller.prototype.getController = function (id) {
        return this._children[id] || null;
    };
    Controller.prototype.getChildren = function () {
        return __assign({}, this._children);
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
exports.joinKeys = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return keys.join(types_1.ACTIONS_DELIMITER);
};
exports.wrapDispatch = function (dispatch, key) {
    return function (action) {
        dispatch({ type: exports.joinKeys(key, action.type), payload: action.payload });
    };
};
function getStatePart(state, path) {
    return path.reduce(function (state, key) { return state[key]; }, state);
}
exports.getStatePart = getStatePart;
function getChildController(controller, path) {
    var keys = typeof path === 'string' ? path.split(types_1.ACTIONS_DELIMITER) : path;
    return keys.reduce(function (controller, key) { return controller.getController(key); }, controller);
}
exports.getChildController = getChildController;
function createBuilder() {
    return new ComponentBuilder();
}
exports.createBuilder = createBuilder;
//# sourceMappingURL=controller.js.map