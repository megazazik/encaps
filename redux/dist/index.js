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
var react_redux_1 = require("react-redux");
var controller_1 = require("encaps-component-factory/controller");
var getProps_1 = require("encaps-component-factory/getProps");
function connect(_a) {
    var _b = _a === void 0 ? {} : _a, path = _b.path, stateToProps = _b.stateToProps, dispatchToProps = _b.dispatchToProps, _c = _b.mergeProps, mergeProps = _c === void 0 ? function (state, dispatch, props) { return (__assign({}, state, dispatch, props)); } : _c, noConvertToComponentProps = _b.noConvertToComponentProps;
    var usedNoConvertToComponentProps = noConvertToComponentProps !== undefined
        ? noConvertToComponentProps
        : !!(stateToProps || dispatchToProps);
    var usedStateToProps = stateToProps || (function (state, props) { return state; });
    var usedDispatchToProps = dispatchToProps || (function (dispatch, props) { return dispatch; });
    var stateToViewProps = usedNoConvertToComponentProps ? function (s) { return s; } : function (s) { return ({ doNotAccessThisInnerState: s }); };
    var dispatchToViewProps = usedNoConvertToComponentProps ? function (d) { return d; } : function (d) { return ({ doNotAccessThisInnerDispatch: d }); };
    var cachedDispatch;
    var getDispatch = function (dispatch) {
        if (!cachedDispatch) {
            cachedDispatch = path ? controller_1.wrapDispatch(path, dispatch) : dispatch;
        }
        return cachedDispatch;
    };
    var getChildState = function (state) { return controller_1.getStatePart(path, state); };
    return react_redux_1.connect(function (state, props) { return stateToViewProps(usedStateToProps(getChildState(state), props)); }, function (dispatch, props) { return dispatchToViewProps(usedDispatchToProps(getDispatch(dispatch), props)); }, mergeProps);
}
exports.connect = connect;
function connectView(params) {
    var getChildDispatch = getProps_1.createWrapDispatch();
    return function (component, path) {
        var cachedDispatch;
        var getDispatch = function (dispatch) {
            if (!cachedDispatch) {
                cachedDispatch = path ? controller_1.wrapDispatch(path, dispatch) : dispatch;
            }
            return cachedDispatch;
        };
        var getChildState = path ? function (state) { return controller_1.getStatePart(path, state); } : function (state) { return state; };
        var createUniqueStateToProps = function () {
            var currentState;
            var currentDispatch;
            var getChild = function (id) { return getProps_1.createChildProps(currentState[id], getChildDispatch(id, currentDispatch)); };
            var setCurrents = function (state, dispatch) {
                currentState = state;
                currentDispatch = dispatch;
            };
            return function (state, props) {
                return ({
                    __state__: state,
                    __getChild__: getChild,
                    __setCurrents__: setCurrents,
                    stateProps: params.stateToProps(getChildState(state), props)
                });
            };
        };
        var mergeProps = function (fromState, fromDispatch, props) {
            fromState.__setCurrents__(fromState.__state__, fromDispatch.__dispatch__);
            return __assign({}, params.mergeProps(fromState.stateProps, fromDispatch.dispatchProps, props), { getChild: fromState.__getChild__ });
        };
        return react_redux_1.connect(createUniqueStateToProps, function (dispatch, props) { return ({
            __dispatch__: dispatch,
            dispatchProps: params.dispatchToProps(getDispatch(dispatch), props)
        }); }, mergeProps)(component);
    };
}
exports.connectView = connectView;
exports.default = connect;
//# sourceMappingURL=index.js.map