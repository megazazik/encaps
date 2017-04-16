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
var PropTypes = require("prop-types");
var builder_1 = require("./builder");
var contextType = {
    state: PropTypes.any,
    dispatch: PropTypes.func
};
var Store = (function () {
    function Store(reducer) {
        this.reducer = reducer;
        this.state = reducer(undefined, undefined);
    }
    Store.prototype.dispatch = function (action) {
        this.state = this.reducer(this.state, action);
    };
    return Store;
}());
function createStore(reducer) {
    return new Store(reducer);
}
exports.createStore = createStore;
var Provider = (function (_super) {
    __extends(Provider, _super);
    function Provider(props) {
        var _this = _super.call(this, props) || this;
        _this.dispatch = function (action) {
            _this.props.store.dispatch(action);
            _this.setState(_this.props.store.state);
        };
        _this.state = props.store.state;
        return _this;
    }
    Provider.prototype.getChildContext = function () {
        return {
            state: this.props.store.state,
            dispatch: this.dispatch
        };
    };
    ;
    Provider.prototype.render = function () {
        return React.createElement("div", {}, this.props.children);
    };
    return Provider;
}(React.Component));
Provider.childContextTypes = contextType;
exports.Provider = Provider;
var ReactStateHolder = function (props, context) {
    var stateProps = {
        doNotAccessThisInnerState: props.code ? context.state[props.code] : context.state,
        doNotAccessThisInnerDispatch: function (action) { return props.code ? builder_1.wrapDispatch(context.dispatch, props.code)(action) : context.dispatch(action); }
    };
    return React.createElement(props.Element, __assign({}, stateProps, props.elementProps));
};
ReactStateHolder.contextTypes = contextType;
exports.getCreateStore = function () {
    return createStore;
};
exports.getProvider = function () {
    return Provider;
};
var StateHolder = ReactStateHolder;
var GlobalStateHolder = function (props) {
    return React.createElement(StateHolder, props);
};
exports.getStateHolder = function () {
    return GlobalStateHolder;
};
exports.setStateHolder = function (holder) {
    StateHolder = holder;
};
