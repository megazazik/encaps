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
var shallowEqual = require("fbjs/lib/shallowEqual");
var COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';
function createComponent(controller, stateToProps, dispatchToProps, mergeProps) {
    if (stateToProps === void 0) { stateToProps = function (state, p) { return (__assign({}, p, { state: state })); }; }
    if (dispatchToProps === void 0) { dispatchToProps = function (dispatch, p) { return (__assign({}, p, { dispatch: dispatch })); }; }
    if (mergeProps === void 0) { mergeProps = function (stateProps, dispatchProps) { return (__assign({}, stateProps, dispatchProps)); }; }
    return function (View, needShallowEqual) {
        if (needShallowEqual === void 0) { needShallowEqual = true; }
        var getProps = function (s, d, p) { return mergeProps(stateToProps(controller.getSelectState()(s), p), dispatchToProps(controller.getSelectDispatch()(d), p)); };
        var childDispatchs = {};
        var getChildDispatch = function (dispatch, key) {
            if (!childDispatchs[key]) {
                childDispatchs[key] = controller.getWrapDispatch(key)(dispatch);
            }
            return childDispatchs[key];
        };
        var StateController = (function (_super) {
            __extends(StateController, _super);
            function StateController() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this._getChildProps = function (id) { return createChildProps(_this.props.doNotAccessThisInnerState[id], getChildDispatch(_this.props.doNotAccessThisInnerDispatch, id)); };
                return _this;
            }
            StateController.prototype.render = function () {
                var _a = this.props, doNotAccessThisInnerState = _a.doNotAccessThisInnerState, doNotAccessThisInnerDispatch = _a.doNotAccessThisInnerDispatch, props = __rest(_a, ["doNotAccessThisInnerState", "doNotAccessThisInnerDispatch"]);
                if (!needShallowEqual || !shallowEqual(doNotAccessThisInnerState, this._state) || !shallowEqual(props, this._props)) {
                    this._state = doNotAccessThisInnerState;
                    this._props = props;
                    this._componentProps = __assign({}, getProps(this.props.doNotAccessThisInnerState, this.props.doNotAccessThisInnerDispatch, props), { getChild: this._getChildProps });
                }
                return React.createElement(View, this._componentProps);
            };
            return StateController;
        }(React.Component));
        StateController.displayName = View.displayName + COMPONENT_DISPLAY_NAME_SUFFIX;
        return StateController;
    };
}
exports.createComponent = createComponent;
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
//# sourceMappingURL=react.js.map