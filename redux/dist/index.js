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
var encaps_component_factory_1 = require("encaps-component-factory");
function connect(params) {
    if (params === void 0) { params = {}; }
    var usedParams = __assign({ stateToProps: function (state, props) { return state; }, dispatchToProps: function (dispatch, props) { return dispatch; }, path: [], noConvertToComponentProps: false }, params);
    var path;
    if (typeof usedParams.path === 'string') {
        path = usedParams.path.split(encaps_component_factory_1.ACTIONS_DELIMITER);
    }
    else {
        path = usedParams.path;
    }
    var stateToViewProps = usedParams.noConvertToComponentProps ? function (s) { return s; } : function (s) { return ({ doNotAccessThisInnerState: s }); };
    var controllerStateToProps = usedParams.controller ? getChildController(usedParams.controller, path).getStateToProps() : function (s, p) { return s; };
    var dispatchToViewProps = usedParams.noConvertToComponentProps ? function (d) { return d; } : function (d) { return ({ doNotAccessThisInnerDispatch: d }); };
    var controllerDispatchToProps = usedParams.controller ? getChildController(usedParams.controller, path).getDispatchToProps() : function (s, p) { return s; };
    var getChildDispatch = usedParams.controller ? usedParams.controller.getWrapDispatch() : function (d, p) { return d; };
    return react_redux_1.connect(function (state, props) { return stateToViewProps(usedParams.stateToProps(controllerStateToProps(getStatePart(state, path), props), props)); }, function (dispatch, props) { return dispatchToViewProps(usedParams.dispatchToProps(controllerDispatchToProps(getChildDispatch(dispatch, path), props), props)); });
}
exports.connect = connect;
function getStatePart(state, path) {
    return path.reduce(function (state, key) { return state[key]; }, state);
}
function getChildController(controller, path) {
    return path.reduce(function (controller, key) { return controller.getController(key); }, controller);
}
exports.default = connect;
//# sourceMappingURL=index.js.map