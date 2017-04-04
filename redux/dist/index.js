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
var React = require("react");
var react_redux_1 = require("react-redux");
var encaps_component_factory_1 = require("encaps-component-factory");
var InnerStateHolder = function (props) {
    var stateProps = {
        doNotAccessThisInnerState: props.holderProps.code ? props.state[props.holderProps.code] : props.state,
        doNotAccessThisInnerDispatch: props.holderProps.code ? encaps_component_factory_1.wrapDispatch(props.dispatch, props.holderProps.code) : props.dispatch
    };
    return React.createElement(props.holderProps.Element, __assign({}, props.holderProps.elementProps, stateProps));
};
var connectedComponent = react_redux_1.connect(function (state, props) { return ({
    state: state,
    holderProps: props
}); }, function (dispatch) { return ({ dispatch: dispatch }); })(InnerStateHolder);
var ReduxStateHolder = function (props) {
    return React.createElement(connectedComponent, props);
};
exports.default = ReduxStateHolder;
