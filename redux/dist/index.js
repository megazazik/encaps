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
var controller_1 = require("encaps-component-factory/controller");
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
    // todo remove this if it is unnecessary
    var controllerStateToProps = function (s, p) { return s; };
    var dispatchToViewProps = usedParams.noConvertToComponentProps ? function (d) { return d; } : function (d) { return ({ doNotAccessThisInnerDispatch: d }); };
    // todo remove this if it is unnecessary, or use getActions
    var controllerDispatchToProps = function (s, p) { return s; };
    // const controllerDispatchToProps = usedParams.controller ? getChildController(usedParams.controller, path).getDispatchToProps() : (s, p) => s;
    var getChildDispatch = usedParams.controller ? usedParams.controller.getWrapDispatch(path) : function (d) { return d; };
    return react_redux_1.connect(function (state, props) { return stateToViewProps(usedParams.stateToProps(controllerStateToProps(controller_1.getStatePart(state, path), props), props)); }, function (dispatch, props) { return dispatchToViewProps(usedParams.dispatchToProps(controllerDispatchToProps(getChildDispatch(dispatch), props), props)); });
}
exports.connect = connect;
// function getChildController(controller: IController<any, any, any>, path: string[]): IController<any, any, any> {
// 	return path.reduce((controller, key) => controller.getController(key), controller);
// }
exports.default = connect;
//# sourceMappingURL=index.js.map