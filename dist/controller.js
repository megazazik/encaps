"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("./types");
/**
 * Класс для построения компонентов
 * @type S тип состояния
 * @type Actions действия компонента
 */
var Builder = /** @class */ (function () {
    function Builder(_controller) {
        this._controller = _controller;
    }
    Builder.prototype.setInitState = function (f) {
        var _this = this;
        var initState = f(this._controller.reducer());
        return new Builder(tslib_1.__assign({}, this._controller, { reducer: function (state, action) {
                if (state === void 0) { state = initState; }
                return _this._controller.reducer(state, action);
            } }));
    };
    Builder.prototype.action = function (handlers) {
        var _this = this;
        return new Builder({
            actions: tslib_1.__assign({}, this._controller.actions, Object.keys(handlers).reduce(function (actions, key) {
                var _a;
                return (tslib_1.__assign({}, actions, (_a = {}, _a[key] = function (payload) { return ({ type: key, payload: payload }); }, _a)));
            }, {})),
            reducer: function (state, action) {
                if (state === void 0) { state = _this._controller.reducer(); }
                if (action === void 0) { action = { type: '' }; }
                return handlers.hasOwnProperty(action.type)
                    ? handlers[action.type](state, action)
                    : _this._controller.reducer(state, action);
            },
        });
    };
    Builder.prototype.child = function (childKey, controller) {
        var _this = this;
        var _a, _b;
        var initState = tslib_1.__assign({}, this._controller.reducer(), (_a = {}, _a[childKey] = controller.reducer(), _a));
        return new Builder({
            actions: tslib_1.__assign({}, this._controller.actions, (_b = {}, _b[childKey] = wrapChildActions(wrapAction(childKey), controller.actions), _b)),
            reducer: function (state, baseAction) {
                if (state === void 0) { state = initState; }
                if (baseAction === void 0) { baseAction = { type: '' }; }
                var _a;
                var _b = unwrapAction(baseAction), key = _b.key, action = _b.action;
                return childKey === key
                    ? tslib_1.__assign({}, state, (_a = {}, _a[key] = controller.reducer(state[key], action), _a)) : _this._controller.reducer(state, baseAction);
            },
        });
    };
    Object.defineProperty(Builder.prototype, "controller", {
        get: function () {
            return tslib_1.__assign({}, this._controller);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Builder.prototype, "actions", {
        get: function () {
            return this.controller.actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Builder.prototype, "reducer", {
        get: function () {
            return this.controller.reducer;
        },
        enumerable: true,
        configurable: true
    });
    return Builder;
}());
var unwrapAction = function (action) {
    return {
        key: action.type.substring(0, action.type.indexOf(types_1.ACTIONS_DELIMITER)),
        action: {
            payload: action.payload,
            type: action.type.substring(action.type.indexOf(types_1.ACTIONS_DELIMITER) + 1)
        }
    };
};
function wrapChildActions(wrap, actions) {
    return Object.keys(actions).reduce(function (result, actionKey) {
        var _a, _b;
        if (typeof actions[actionKey] === 'function') {
            return (tslib_1.__assign({}, result, (_a = {}, _a[actionKey] = function (payload) { return wrap(actions[actionKey](payload)); }, _a)));
        }
        else {
            return (tslib_1.__assign({}, result, (_b = {}, _b[actionKey] = wrapChildActions(wrap, actions[actionKey]), _b)));
        }
    }, {});
}
function wrapAction(key) {
    return function (action) { return (tslib_1.__assign({}, action, { type: joinKeys(key, action.type) })); };
}
var joinKeys = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return keys.join(types_1.ACTIONS_DELIMITER);
};
function build(controller) {
    if (controller === void 0) { controller = { actions: {}, reducer: function (s) {
            if (s === void 0) { s = {}; }
            return (tslib_1.__assign({}, s));
        } }; }
    return new Builder(controller);
}
exports.build = build;
exports.builder = build();
//# sourceMappingURL=controller.js.map