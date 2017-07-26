"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var types_1 = require("./types");
var shallowEqual = require("fbjs/lib/shallowEqual");
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
        this._getStateToProps = function (state, props) { return (__assign({}, props, { state: state })); };
        this._getDispatchProps = function (dispatch) { return ({ dispatch: dispatch }); };
        this._builders = {};
        this._wrapChildDispatch = {};
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
    ComponentBuilder.prototype.setStateToProps = function (getProps) {
        this._getStateToProps = getProps;
    };
    ComponentBuilder.prototype.setDispatchToProps = function (getProps) {
        this._getDispatchProps = getProps;
    };
    ComponentBuilder.prototype.addChildBuilder = function (key, builder, wrapChildDispatch) {
        if (wrapChildDispatch === void 0) { wrapChildDispatch = function (origin, child) { return child; }; }
        this._childs[key] = builder;
        this._wrapChildDispatch[key] = wrapChildDispatch;
        return function (dispatch) { return wrapChildDispatch(dispatch, exports.wrapDispatch(dispatch, key)); };
    };
    ComponentBuilder.prototype.addBuilder = function (key, builder, wrapChildDispatch) {
        if (wrapChildDispatch === void 0) { wrapChildDispatch = function (origin, child) { return child; }; }
        this._builders[key] = builder;
        this._wrapChildDispatch[key] = wrapChildDispatch;
        return function (dispatch) { return wrapChildDispatch(dispatch, exports.wrapDispatch(dispatch, key)); };
    };
    ComponentBuilder.prototype.getController = function () {
        return new Controller(this._initState, this._builders, this._childs, this._handlers, this._subHandlers, this._getProps, this._getStateToProps, this._getDispatchProps, this._wrapChildDispatch);
    };
    return ComponentBuilder;
}());
var Controller = (function () {
    function Controller(_initState, _builders, _childs, _handlers, _subHandlers, _getProps, _stateToProps, _dispatchToProps, _wrapChildDispatch) {
        if (_builders === void 0) { _builders = {}; }
        if (_childs === void 0) { _childs = {}; }
        if (_handlers === void 0) { _handlers = {}; }
        if (_subHandlers === void 0) { _subHandlers = {}; }
        if (_wrapChildDispatch === void 0) { _wrapChildDispatch = {}; }
        this._initState = _initState;
        this._builders = _builders;
        this._childs = _childs;
        this._handlers = _handlers;
        this._subHandlers = _subHandlers;
        this._getProps = _getProps;
        this._stateToProps = _stateToProps;
        this._dispatchToProps = _dispatchToProps;
        this._wrapChildDispatch = _wrapChildDispatch;
        this._childDispatchs = {};
        this._init();
    }
    Controller.prototype._init = function () {
        this._builtGetProps = this._buildGetProps();
        this._builtInitState = this._buildInitState();
        this._builtReducer = this._buildReducer();
    };
    Controller.prototype.getComponent = function (View, propToViewProps, pure) {
        if (propToViewProps === void 0) { propToViewProps = function (props) { return ({}); }; }
        if (pure === void 0) { pure = true; }
        var getProps = this.getGetProps();
        var getChildDispatch = this._getChildDispatch.bind(this);
        var StateController = (function (_super) {
            __extends(StateController, _super);
            function StateController() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this._getChildProps = function (id) { return createChildProps(_this.props.doNotAccessThisInnerState[id], getChildDispatch(_this.props.doNotAccessThisInnerDispatch, id)); };
                return _this;
            }
            StateController.prototype.render = function () {
                var _a = this.props, doNotAccessThisInnerState = _a.doNotAccessThisInnerState, doNotAccessThisInnerDispatch = _a.doNotAccessThisInnerDispatch, props = __rest(_a, ["doNotAccessThisInnerState", "doNotAccessThisInnerDispatch"]);
                if (!pure || !shallowEqual(doNotAccessThisInnerState, this._state) || !shallowEqual(props, this._props)) {
                    this._state = doNotAccessThisInnerState;
                    this._props = props;
                    this._componentProps = __assign({}, getProps(this.props.doNotAccessThisInnerState, this.props.doNotAccessThisInnerDispatch, props), propToViewProps(this.props), { getChild: this._getChildProps });
                }
                return React.createElement(View, this._componentProps);
            };
            return StateController;
        }(React.Component));
        return StateController;
    };
    Controller.prototype.getGetProps = function () {
        return this._builtGetProps;
    };
    Controller.prototype.getStateToProps = function () {
        return this._stateToProps;
    };
    Controller.prototype.getDispatchToProps = function () {
        return this._dispatchToProps;
    };
    Controller.prototype._buildGetProps = function () {
        var _this = this;
        return function (state, dispatch, props) {
            var newProps = !!_this._getProps ?
                _this._getProps(state, dispatch, props) : __assign({}, _this._stateToProps(state, props), _this._dispatchToProps(dispatch, props));
            for (var builderKey in _this._builders) {
                newProps = __assign({}, newProps, (_a = {}, _a[builderKey] = _this._builders[builderKey].getGetProps()(state[builderKey], _this._getChildDispatch(dispatch, builderKey), __assign({}, props, newProps[builderKey])), _a));
            }
            return newProps;
            var _a;
        };
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
    Controller.prototype.getWrapDispatch = function (paramPath) {
        var _this = this;
        if (!paramPath) {
            throw new Error('The second parameter must be defined.');
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
                var childController = _this._builders[path[0]] || _this._childs[path[0]];
                if (!childController) {
                    return _this._getChildDispatch(dispatch, path[0]);
                }
                else {
                    return childController.getWrapDispatch(path.slice(1))(_this._getChildDispatch(dispatch, path[0]));
                }
            }
        };
    };
    Controller.prototype.getController = function (id) {
        return this._builders[id] || this._childs[id] || null;
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
function createChildProps(state, dispatch) {
    return {
        doNotAccessThisInnerState: state,
        doNotAccessThisInnerDispatch: dispatch
    };
}
exports.createChildProps = createChildProps;
function childPropsEquals(props1, props2) {
    return shallowEqual(props1.doNotAccessThisInnerState, props2.doNotAccessThisInnerState);
}
exports.childPropsEquals = childPropsEquals;
exports.wrapDispatch = function (dispatch, key) {
    return function (action) {
        dispatch({ type: joinKeys(key, action.type), payload: action.payload });
    };
};
function createBuilder() {
    return new ComponentBuilder();
}
exports.createBuilder = createBuilder;
//# sourceMappingURL=builder_1111.js.map