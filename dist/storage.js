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
            _this.dispatcher.notifyAll(_this.props.store.state);
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
// //--------------------------------------OLD_CODE-----------------------------------
// class ReactStateHolder extends React.PureComponent<IStateHolderProps, {}> {
// 	static defaultProps = {
// 		extractState: (state) => state
// 	}
// 	static contextTypes = contextType;
// 	private currentState: any;
// 	componentDidMount () {
// 		// TODO проверить, нельзя ли оптимизировать производительность
// 		this.context.subscribe(this.onStateChange);
// 	}
// 	componentWillUnmount () {
// 		this.context.unsubscribe(this.onStateChange);
// 	}
// 	private onStateChange = (state: any) => {
// 		if (this.currentState !== this.getState(state)) {
// 			this.forceUpdate();
// 		}
// 	};
// 	private getState (state: any): any {
// 		return this.props.extractState(this.props.code ? state[this.props.code] : state, this.props.elementProps);
// 	}
// 	render (): JSX.Element {
// 		this.currentState = this.getState(this.context.state);
// 		const stateProps: IChildProps<any> = {
// 			doNotAccessThisInnerState: this.currentState,
// 			doNotAccessThisInnerDispatch: (action: IAction<any>): void => this.props.code ? wrapDispatch(this.context.dispatch, this.props.code)(action) : this.context.dispatch(action)
// 		}
// 		return React.createElement(this.props.Element as any, {...stateProps, ...this.props.elementProps});
// 	}
// }
// let StateHolder: React.StatelessComponent<IStateHolderProps> | React.ComponentClass<IStateHolderProps> = ReactStateHolder;
// const GlobalStateHolder = (props: IStateHolderProps): JSX.Element => {
// 	return React.createElement(StateHolder as any, props);
// }
// export const getStateHolder = () => {
// 	return GlobalStateHolder;
// }
// export const setStateHolder = (holder: React.StatelessComponent<IStateHolderProps> | React.ComponentClass<IStateHolderProps>): void => {
// 	StateHolder = holder;
// }
//--------------------------------------OLD_CODE-----------------------------------
exports.getCreateStore = function () {
    return createStore;
};
exports.getProvider = function () {
    return Provider;
};
var ReactConnectedStateHolder = (function (_super) {
    __extends(ReactConnectedStateHolder, _super);
    function ReactConnectedStateHolder() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onStateChange = function (state) {
            if (_this.currentState != _this.getState(state)) {
                _this.forceUpdate();
            }
        };
        return _this;
    }
    ReactConnectedStateHolder.prototype.componentDidMount = function () {
        // TODO проверить, нельзя ли оптимизировать производительность
        this.context.subscribe(this.onStateChange);
    };
    ReactConnectedStateHolder.prototype.componentWillUnmount = function () {
        this.context.unsubscribe(this.onStateChange);
    };
    ReactConnectedStateHolder.prototype.getState = function (state) {
        return this.props.extractState(state, this.props.elementProps);
    };
    ReactConnectedStateHolder.prototype.getDispatch = function () {
        return this.props.extractDispatch(this.context.dispatch, this.props.elementProps);
    };
    ReactConnectedStateHolder.prototype.render = function () {
        this.currentState = this.getState(this.context.state);
        var stateProps = {
            doNotAccessThisInnerState: this.currentState,
            doNotAccessThisInnerDispatch: this.getDispatch()
        };
        return React.createElement(this.props.Element, __assign({}, stateProps, this.props.elementProps));
    };
    return ReactConnectedStateHolder;
}(React.PureComponent));
ReactConnectedStateHolder.defaultProps = {
    extractState: function (state) { return state; },
    extractDispatch: function (dispatch) { return dispatch; }
};
ReactConnectedStateHolder.contextTypes = contextType;
var currentConnect = connect;
function getConnect() {
    return currentConnect;
}
exports.getConnect = getConnect;
function setConect(connect) {
    currentConnect = connect;
}
exports.setConect = setConect;
function connect(stateToComponentState, dispatchToComponentDispatch) {
    var createComponent = function (Component) {
        return function (props) {
            return React.createElement(ReactConnectedStateHolder, {
                extractState: stateToComponentState,
                extractDispatch: dispatchToComponentDispatch,
                Element: Component,
                elementProps: props
            });
        };
    };
    return createComponent;
}
exports.connect = connect;
