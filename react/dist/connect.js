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
var encaps_1 = require("encaps");
function createConnectParams(controller, stateToProps, dispatchToProps, mergeProps) {
    if (stateToProps === void 0) { stateToProps = function (state, props) { return removeChildFromState(controller, state); }; }
    if (dispatchToProps === void 0) { dispatchToProps = function (dispatch, props) { return createActions(controller, dispatch); }; }
    if (mergeProps === void 0) { mergeProps = function (sp, dp, p) { return (__assign({}, p, sp, dp)); }; }
    return {
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
    /** @todo fix sub actions */
    return Object.keys(controller.getActions()).reduce(function (actions, key) {
        return (__assign({}, actions, (_a = {}, _a[key] = function (payload) { return dispatch(controller.getActions()[key](payload)); }, _a)));
        var _a;
    }, {});
}
exports.createActions = createActions;
function createWrapDispatch() {
    var dispatches = {};
    return function (key, dispatch) {
        if (!dispatches[key]) {
            dispatches[key] = encaps_1.wrapDispatch(key, dispatch);
        }
        return dispatches[key];
    };
}
exports.createWrapDispatch = createWrapDispatch;
function getProps(_a, state, dispatch, props) {
    var stateToProps = _a.stateToProps, dispatchToProps = _a.dispatchToProps, mergeProps = _a.mergeProps;
    var stateProps = stateToProps(state, props);
    var dispatchProps = dispatchToProps(dispatch, props);
    return mergeProps(typeof stateProps === 'function' ? stateProps(state, props) : stateProps, typeof dispatchProps === 'function' ? dispatchProps(dispatch, props) : dispatchProps, props);
}
exports.getProps = getProps;
var TEMP_FIELD_NAME = "__temp_field_name__";
function composeConnectParams() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var stateToProps = function (state, props) {
        var sData = {
            stateToPropsList: params.map(function (param) { return param.stateToProps; }),
            firstCall: true,
            state: state
        };
        return function (state, props) { return sData.stateToPropsList.reduce(function (prev, stateToProps, index) {
            return (__assign({}, prev, (_a = {}, _a[TEMP_FIELD_NAME + index] = stateToProps(state, props), _a)));
            var _a;
        }, sData); };
    };
    var dispatchToProps = function (dispatch, props) {
        var dData = {
            dispatch: dispatch,
            dispatchToPropsList: params.map(function (param) { return param.dispatchToProps; })
        };
        return function (dispatch, props) { return dData.dispatchToPropsList.reduce(function (prev, dispatchToProps, index) {
            return (__assign({}, prev, (_a = {}, _a[TEMP_FIELD_NAME + index] = dispatchToProps(dispatch, props), _a)));
            var _a;
        }, dData); };
    };
    var mergeProps = function (stateData, dispatchData, props) {
        if (stateData.firstCall) {
            params.forEach(function (param, index) {
                if (typeof stateData[TEMP_FIELD_NAME + index] === 'function') {
                    stateData.stateToPropsList[index] = stateData[TEMP_FIELD_NAME + index];
                    stateData[TEMP_FIELD_NAME + index] = stateData[TEMP_FIELD_NAME + index](stateData.state, props);
                }
                if (typeof dispatchData[TEMP_FIELD_NAME + index] === 'function') {
                    dispatchData.dispatchToPropsList[index] = dispatchData[TEMP_FIELD_NAME + index];
                    dispatchData[TEMP_FIELD_NAME + index] = dispatchData[TEMP_FIELD_NAME + index](dispatchData.dispatch, props);
                }
            });
            stateData.firstCall = false;
        }
        return params.reduce(function (prev, param, index) { return (__assign({}, prev, param.mergeProps(stateData[TEMP_FIELD_NAME + index], dispatchData[TEMP_FIELD_NAME + index], props))); }, {});
    };
    return {
        stateToProps: stateToProps,
        dispatchToProps: dispatchToProps,
        mergeProps: mergeProps
    };
}
exports.composeConnectParams = composeConnectParams;
function wrapConnectParams(key, params) {
    var keyGetState = function (s) { return s[key]; };
    var keyWrapDispatch = function (d) { return encaps_1.wrapDispatch(key, d); };
    return {
        stateToProps: wrapStateToProps(keyGetState, params.stateToProps),
        dispatchToProps: wrapDispatchToProps(keyWrapDispatch, params.dispatchToProps),
        mergeProps: params.mergeProps
    };
}
exports.wrapConnectParams = wrapConnectParams;
function wrapStateToProps(getState, stateToProps) {
    return function (state, props) {
        var sp = stateToProps;
        return function (state, props) {
            var res = sp(getState(state, props), props);
            if (typeof res === 'function') {
                sp = res;
                res = sp(getState(state, props), props);
            }
            return res;
        };
    };
}
exports.wrapStateToProps = wrapStateToProps;
function wrapDispatchToProps(wrapDispatch, dispatchToProps) {
    return function (dispatch, props) {
        var dp = dispatchToProps;
        var savedDispatch;
        var computedDispatch;
        return function (dispatch, props) {
            if (savedDispatch !== dispatch) {
                computedDispatch = wrapDispatch(dispatch, props);
                savedDispatch = dispatch;
            }
            var res = dp(computedDispatch, props);
            if (typeof res === 'function') {
                dp = res;
                res = dp(computedDispatch, props);
            }
            return res;
        };
    };
}
exports.wrapDispatchToProps = wrapDispatchToProps;
//# sourceMappingURL=connect.js.map