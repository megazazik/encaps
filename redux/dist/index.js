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
var controller_1 = require("encaps/controller");
var connect_1 = require("encaps/connect");
var react_1 = require("encaps/react");
function connect(_a) {
    var _b = _a === void 0 ? {} : _a, path = _b.path, stateToProps = _b.stateToProps, dispatchToProps = _b.dispatchToProps, _c = _b.mergeProps, mergeProps = _c === void 0 ? function (state, dispatch, props) { return (__assign({}, state, dispatch, props)); } : _c, noConvertToComponentProps = _b.noConvertToComponentProps;
    var usedNoConvertToComponentProps = !!stateToProps || !!dispatchToProps || !!noConvertToComponentProps;
    var usedStateToProps = stateToProps || (function (state) { return state; });
    var usedDispatchToProps = dispatchToProps || (function (dispatch) { return dispatch; });
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
    return function (component, path) {
        if (path === void 0) { path = []; }
        var pathParts = typeof path === 'string' ? path.split(".") : path;
        var componentParams = pathParts.reduce(function (prevParams, pathPart) { return connect_1.wrapConnectParams(pathPart, prevParams); }, params);
        var connectParams = connect_1.composeConnectParams(react_1.parentConnectParams, componentParams);
        return react_redux_1.connect(connectParams.stateToProps, connectParams.dispatchToProps, connectParams.mergeProps)(component);
    };
}
exports.connectView = connectView;
exports.default = connect;
//# sourceMappingURL=index.js.map