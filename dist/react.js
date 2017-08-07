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
var getProps_1 = require("./getProps");
var shallowEqual = require("fbjs/lib/shallowEqual");
exports.shallowEqual = shallowEqual;
var COMPONENT_DISPLAY_NAME_SUFFIX = '_StateHolder';
function createComponent(controller, stateToProps, dispatchToProps, mergeProps) {
    return createContainer(getProps_1.createConnectParams(controller, stateToProps, dispatchToProps, mergeProps));
}
exports.createComponent = createComponent;
function childPropsEquals(props1, props2) {
    return shallowEqual(props1.doNotAccessThisInnerState, props2.doNotAccessThisInnerState);
}
exports.childPropsEquals = childPropsEquals;
function createContainer(connectParams) {
    function createContainerInner(View, needShallowEqual) {
        if (needShallowEqual === void 0) { needShallowEqual = true; }
        var StateController = (function (_super) {
            __extends(StateController, _super);
            function StateController() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this._getChildDispatch = getProps_1.createWrapDispatch();
                _this._connectParams = getProps_1.composeConnectParams(exports.parentConnectParams, connectParams);
                _this._firstCall = true;
                return _this;
            }
            StateController.prototype.shouldComponentUpdate = function (nextProps) {
                if (needShallowEqual && shallowEqual(nextProps, this.props)) {
                    return false;
                }
                var newComponentProps = this._getProps(nextProps);
                if (needShallowEqual && shallowEqual(newComponentProps, this._computedProps)) {
                    return false;
                }
                else {
                    this._computedProps = newComponentProps;
                    return true;
                }
            };
            StateController.prototype._getProps = function (props) {
                var s = props.doNotAccessThisInnerState, d = props.doNotAccessThisInnerDispatch, p = __rest(props, ["doNotAccessThisInnerState", "doNotAccessThisInnerDispatch"]);
                var _a = this._connectParams, stateToProps = _a.stateToProps, dispatchToProps = _a.dispatchToProps, mergeProps = _a.mergeProps;
                var stateProps = stateToProps(s, p);
                var dispatchProps = dispatchToProps(d, p);
                if (this._firstCall) {
                    if (typeof stateProps === 'function') {
                        this._connectParams.stateToProps = stateProps;
                        stateProps = stateProps(s, p);
                    }
                    if (typeof dispatchProps === 'function') {
                        this._connectParams.dispatchToProps = dispatchProps;
                        dispatchProps = dispatchProps(d, p);
                    }
                    this._firstCall = false;
                }
                return mergeProps(stateProps, dispatchProps, p);
            };
            StateController.prototype.render = function () {
                if (!this._computedProps) {
                    this._computedProps = this._getProps(this.props);
                }
                return React.createElement(View, this._computedProps);
            };
            StateController.displayName = (View.displayName || View.name) + COMPONENT_DISPLAY_NAME_SUFFIX;
            return StateController;
        }(React.Component));
        return StateController;
    }
    return createContainerInner;
}
exports.createContainer = createContainer;
exports.parentConnectParams = {
    stateToProps: function (fState, fProps) {
        var sData = {
            state: fState,
            dispatch: undefined,
            getChild: function (id) { return getProps_1.createChildProps(sData.state[id], sData.wrapDispatch(id, sData.dispatch)); },
            wrapDispatch: getProps_1.createWrapDispatch()
        };
        return function (state, props) {
            sData.state = state;
            return { __data__: sData };
        };
    },
    dispatchToProps: function (dispatch, props) { return ({ dispatch: dispatch }); },
    mergeProps: function (fromState, fromDispatch, props) {
        fromState.__data__.dispatch = fromDispatch.dispatch;
        return {
            getChild: fromState.__data__.getChild
        };
    }
};
//# sourceMappingURL=react.js.map