"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_redux_1 = require("react-redux");
function connect(stateToComponentState, dispatchToComponentDispatch) {
    if (stateToComponentState === void 0) { stateToComponentState = function (state) { return state; }; }
    if (dispatchToComponentDispatch === void 0) { dispatchToComponentDispatch = function (dispatch) { return dispatch; }; }
    return react_redux_1.connect(function (state, props) { return ({ doNotAccessThisInnerState: stateToComponentState(state, props) }); }, function (dispatch, props) { return ({ doNotAccessThisInnerDispatch: dispatchToComponentDispatch(dispatch, props) }); });
}
exports.connect = connect;
exports.default = connect;
//# sourceMappingURL=index.js.map