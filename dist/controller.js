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
 * @type Actions действия компонента
 * @type SubActions параметризированные действия компонента
 */
var ComponentBuilder = (function () {
    function ComponentBuilder(state) {
        this._state = state || {
            initState: function () { return ({}); },
            handlers: {},
            subHandlers: {},
            children: {}
        };
    }
    ComponentBuilder.prototype.setInitState = function (f) {
        return new ComponentBuilder(__assign({}, copyBuilderState(this._state), { initState: f }));
    };
    ComponentBuilder.prototype.action = function (handlers) {
        var copy = copyBuilderState(this._state);
        return new ComponentBuilder(__assign({}, copy, { handlers: __assign({}, copy.handlers, handlers) }));
    };
    ComponentBuilder.prototype.subAction = function (handlers) {
        var copy = copyBuilderState(this._state);
        return new ComponentBuilder(__assign({}, copy, { subHandlers: __assign({}, copy.subHandlers, handlers) }));
    };
    ComponentBuilder.prototype.addChild = function (key, controller) {
        var copy = copyBuilderState(this._state);
        return new ComponentBuilder(__assign({}, copy, { children: __assign({}, copy.children, (_a = {}, _a[key] = controller, _a)) }));
        var _a;
    };
    ComponentBuilder.prototype.getController = function () {
        return new Controller(copyBuilderState(this._state));
    };
    return ComponentBuilder;
}());
var Controller = (function () {
    function Controller(_state) {
        var _this = this;
        this._state = _state;
        this.getInitState = function () { return _this._builtGetInitState(); };
        this.getActions = function () { return (__assign({}, _this._builtActions)); };
        this._init();
    }
    Controller.prototype._init = function () {
        this._builtGetInitState = this._buildInitState();
        this._builtReducer = this._buildReducer();
        this._builtActions = this._buildActions();
    };
    Controller.prototype._buildInitState = function () {
        var _this = this;
        return function () {
            var initState = !!_this._state.initState ? _this._state.initState() : {};
            for (var builderKey in _this._state.children) {
                initState[builderKey] = initState[builderKey] || _this._state.children[builderKey].getInitState();
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
            return _this._state.handlers.hasOwnProperty(key || baseAction.type) ?
                _this._state.handlers[key || baseAction.type](state, action) :
                _this._state.subHandlers.hasOwnProperty(key) ?
                    _this._state.subHandlers[key](state, getSubAction(action)) :
                    _this._state.children.hasOwnProperty(key) ? __assign({}, state, (_b = {}, _b[key] = _this._state.children[key].getReducer()(state[key], action), _b)) :
                        state;
            var _b;
        };
    };
    Controller.prototype._buildActions = function () {
        return Object.keys(this._state.handlers).reduce(function (actions, action) {
            return (__assign({}, actions, (_a = {}, _a[action] = function (payload) { return ({ type: action, payload: payload }); }, _a)));
            var _a;
        }, Object.keys(this._state.subHandlers).reduce(function (actions, action) {
            return (__assign({}, actions, (_a = {}, _a[action] = function (key, payload) { return ({ type: exports.joinKeys(action, key), payload: payload }); }, _a)));
            var _a;
        }, {}));
    };
    Controller.prototype.getChildren = function () {
        return __assign({}, this._state.children);
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
function copyBuilderState(state) {
    return {
        initState: state.initState,
        handlers: __assign({}, state.handlers),
        subHandlers: __assign({}, state.subHandlers),
        children: __assign({}, state.children)
    };
}
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
exports.wrapDispatch = function (key, dispatch) {
    return function (action) {
        return dispatch({ type: exports.joinKeys(Array.isArray(key) ? key.join(types_1.ACTIONS_DELIMITER) : key, action.type), payload: action.payload });
    };
};
function getStatePart(path, state) {
    if (!path) {
        return state;
    }
    var paths;
    if (typeof path === 'string') {
        paths = path.split(types_1.ACTIONS_DELIMITER);
    }
    else {
        paths = path;
    }
    return paths.reduce(function (state, key) { return state[key]; }, state);
}
exports.getStatePart = getStatePart;
function createChildProps(state, dispatch) {
    return {
        doNotAccessThisInnerState: state,
        doNotAccessThisInnerDispatch: dispatch
    };
}
exports.createChildProps = createChildProps;
function getChildController(controller, path) {
    var keys = typeof path === 'string' ? path.split(types_1.ACTIONS_DELIMITER) : path;
    return keys.reduce(function (controller, key) { return controller.getChildren()[key]; }, controller);
}
exports.getChildController = getChildController;
function createBuilder() {
    // TODO fix declaration error
    return new ComponentBuilder();
}
exports.createBuilder = createBuilder;
//# sourceMappingURL=controller.js.map