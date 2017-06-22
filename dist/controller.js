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
        return function (key, payload) { return ({ type: joinKeys(id, key), payload: payload }); };
    };
    ComponentBuilder.prototype.setSelectState = function (selectState) {
        this._selectState = selectState;
    };
    ComponentBuilder.prototype.setSelectActions = function (selectDispatch) {
        this._selectActions = selectDispatch;
    };
    ComponentBuilder.prototype.addChild = function (key, controller, wrapChildDispatch) {
        if (wrapChildDispatch === void 0) { wrapChildDispatch = function (origin, child) { return child; }; }
        this._children[key] = controller;
        this._wrapChildDispatch[key] = wrapChildDispatch;
        return function (dispatch) { return wrapChildDispatch(dispatch, exports.wrapDispatch(dispatch, key)); };
    };
    ComponentBuilder.prototype.getController = function () {
        return new Controller(this._initState, this._children, this._handlers, this._subHandlers, this._wrapChildDispatch, this._selectState, this._selectActions);
    };
    return ComponentBuilder;
}());
var Controller = (function () {
    // private _builtSelectState: (state: S) => PublicState;
    // private _builtSelectActions: (dispatch: Dispatch) => PublicActions;
    function Controller(_initState, _children, _handlers, _subHandlers, _wrapChildDispatch, _selectState, _selectActions) {
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
        this._selectActions = _selectActions;
        this._init();
    }
    Controller.prototype._init = function () {
        this._builtInitState = this._buildInitState();
        this._builtReducer = this._buildReducer();
        // this._builtSelectState = this._buildSelectState();
        // this._builtSelectActions = this._buildSelectActions();
    };
    Controller.prototype._getChildDispatch = function (dispatch, key) {
        return this._wrapChildDispatch[key](dispatch, exports.wrapDispatch(dispatch, key));
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
    // _buildSelectState() {
    // 	return (state: S): PublicState => 
    // 		Object.keys(this._children).reduce(
    // 			(publicState, builderKey) => ({
    // 				...publicState as any,
    // 				[builderKey]: this._children[builderKey].getSelectState()(state[builderKey])
    // 			}),
    // 			this._selectState(state)
    // 		);
    // }
    Controller.prototype.getSelectState = function () {
        // return this._builtSelectState;
        return this._selectState;
    };
    Controller.prototype.getSelectActions = function () {
        var _this = this;
        return this._selectActions || (function (dispatch) {
            return Object.keys(_this._handlers).reduce(function (actions, action) {
                return (__assign({}, actions, (_a = {}, _a[action] = function (payload) { return dispatch(({ type: action, payload: payload })); }, _a)));
                var _a;
            }, Object.keys(_this._subHandlers).reduce(function (actions, action) {
                return (__assign({}, actions, (_a = {}, _a[action] = function (key, payload) { return dispatch(({ type: joinKeys(action, key), payload: payload })); }, _a)));
                var _a;
            }, {}));
        });
        // return this._builtSelectActions;
    };
    // _buildSelectActions() {
    // 	const selectActions = this._selectActions || ((dispatch: Dispatch) => 
    // 		Object.keys(this._children).reduce(
    // 			(actions, action) => actions, // todo implement
    // 			{} as any
    // 		));
    // 	return (dispatch: Dispatch): PublicActions => 
    // 		Object.keys(this._children).reduce(
    // 			(publicActions, builderKey) => ({
    // 				...publicActions as any,
    // 				[builderKey]: this._children[builderKey].getSelectActions()(this._getChildDispatch(dispatch, builderKey))
    // 			}),
    // 			selectActions(dispatch)
    // 		);
    // }
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