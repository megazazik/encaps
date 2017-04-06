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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
function getStandalone(reducer, Element) {
    var StandaloneStorage = (function (_super) {
        __extends(StandaloneStorage, _super);
        function StandaloneStorage(props) {
            var _this = _super.call(this, props) || this;
            _this._dispatch = function (action) {
                _this.setState(reducer(_this.state, action));
            };
            _this.state = reducer(undefined, undefined);
            return _this;
        }
        StandaloneStorage.prototype.render = function () {
            var stateProps = {
                doNotAccessThisInnerState: this.state,
                doNotAccessThisInnerDispatch: this._dispatch
            };
            return React.createElement(Element, __assign({}, this.props, stateProps));
        };
        return StandaloneStorage;
    }(React.Component));
    return StandaloneStorage;
}
exports.getStandalone = getStandalone;