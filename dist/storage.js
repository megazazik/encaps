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
var events_1 = require("./events");
var contextType = {
    state: PropTypes.any,
    dispatch: PropTypes.func,
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func
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
        _this.dispatcher = new events_1.default();
        _this.dispatch = function (action) {
            _this.props.store.dispatch(action);
            _this.setState(_this.props.store.state);
            _this.dispatcher.notifyAll(null);
        };
        _this.subscribe = function (handler) {
            _this.dispatcher.add(handler);
        };
        _this.unsubscribe = function (handler) {
            _this.dispatcher.remove(handler);
        };
        _this.state = props.store.state;
        return _this;
    }
    Provider.prototype.getChildContext = function () {
        return {
            state: this.props.store.state,
            dispatch: this.dispatch,
            subscribe: this.subscribe,
            unsubscribe: this.unsubscribe,
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
var ReactStateHolder = (function (_super) {
    __extends(ReactStateHolder, _super);
    function ReactStateHolder() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.defaultProps = {
            extractState: function (state) { return state; }
        };
        _this.onStateChange = function (state) {
            if (_this.currentState != _this.getState()) {
                _this.forceUpdate();
            }
        };
        return _this;
    }
    ReactStateHolder.prototype.componentDidMount = function () {
        // TODO проверить, нельзя ли оптимизировать производительность
        this.context.subscribe(this.onStateChange);
    };
    ReactStateHolder.prototype.componentWillUnmount = function () {
        this.context.unsubscribe(this.onStateChange);
    };
    ReactStateHolder.prototype.getState = function () {
        return this.props.extractState(this.props.code ? this.context.state[this.props.code] : this.context.state);
    };
    ReactStateHolder.prototype.render = function () {
        var _this = this;
        this.currentState = this.getState();
        var stateProps = {
            doNotAccessThisInnerState: this.currentState,
            doNotAccessThisInnerDispatch: function (action) { return _this.props.code ? builder_1.wrapDispatch(_this.context.dispatch, _this.props.code)(action) : _this.context.dispatch(action); }
        };
        return React.createElement(this.props.Element, __assign({}, stateProps, this.props.elementProps));
    };
    return ReactStateHolder;
}(React.PureComponent));
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
