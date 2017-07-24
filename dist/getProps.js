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
var controller_1 = require("./controller");
function createConnectParams(controller, stateToProps, dispatchToProps, mergeProps) {
    if (stateToProps === void 0) { stateToProps = function (state, props) { return removeChildFromState(controller, state); }; }
    if (dispatchToProps === void 0) { dispatchToProps = function (dispatch, props) { return createActions(controller, dispatch); }; }
    if (mergeProps === void 0) { mergeProps = function (sp, dp, p) { return (__assign({}, p, sp, dp)); }; }
    return {
        controller: controller,
        stateToProps: stateToProps,
        dispatchToProps: dispatchToProps,
        mergeProps: mergeProps
    };
}
exports.createConnectParams = createConnectParams;
;
function removeChildFromState(controller, state) {
    return Object.keys(controller.getChildren()).reduce(function (resultState, key) {
        delete resultState[key];
        return resultState;
    }, __assign({}, state));
}
;
function createActions(controller, dispatch) {
    // todo fix sub actions
    return Object.keys(controller.getActions()).reduce(function (actions, key) {
        return (__assign({}, actions, (_a = {}, _a[key] = function (payload) { return dispatch(controller.getActions()[key](payload)); }, _a)));
        var _a;
    }, {});
}
exports.createActions = createActions;
function createChildProps(state, dispatch) {
    return {
        doNotAccessThisInnerState: state,
        doNotAccessThisInnerDispatch: dispatch
    };
}
exports.createChildProps = createChildProps;
function createWrapDispatch() {
    var dispatches = {};
    return function (key, dispatch) {
        if (!dispatches[key]) {
            dispatches[key] = controller_1.wrapDispatch(key, dispatch);
        }
        return dispatches[key];
    };
}
exports.createWrapDispatch = createWrapDispatch;
//# sourceMappingURL=getProps.js.map