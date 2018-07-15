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
    function Builder(_model) {
        this._model = _model;
    }
    Builder.prototype.setInitState = function (f) {
        var _this = this;
        /** @todo дополнять текущее состояние, а не перезаписывать */
        var initState = f(this._model.reducer());
        return new Builder(tslib_1.__assign({}, this._model, { reducer: subActionsReducer(function (state, action) {
                if (state === void 0) { state = initState; }
                return _this._model.reducer(state, action);
            }) }));
    };
    Builder.prototype.action = function (handlers) {
        var _this = this;
        /** @todo дополнять текущее состояние, а не перезаписывать */
        return new Builder({
            actions: tslib_1.__assign({}, this._model.actions, Object.keys(handlers).reduce(function (actions, key) {
                var _a;
                return (tslib_1.__assign({}, actions, (_a = {}, _a[key] = function (payload) { return ({ type: key, payload: payload }); }, _a)));
            }, {})),
            reducer: subActionsReducer(function (state, action) {
                if (state === void 0) { state = _this._model.reducer(); }
                if (action === void 0) { action = { type: '' }; }
                return handlers.hasOwnProperty(action.type)
                    ? handlers[action.type](state, action)
                    : _this._model.reducer(state, action);
            }),
        });
    };
    Builder.prototype.child = function (childKey, model) {
        var _this = this;
        var _a, _b;
        /** @todo дополнять текущее состояние, а не перезаписывать? */
        var initState = tslib_1.__assign({}, this._model.reducer(), (_a = {}, _a[childKey] = model.reducer(), _a));
        return new Builder({
            actions: tslib_1.__assign({}, this._model.actions, (_b = {}, _b[childKey] = wrapChildActionCreators(wrapAction(childKey), model.actions), _b)),
            reducer: subActionsReducer(function (state, baseAction) {
                if (state === void 0) { state = initState; }
                if (baseAction === void 0) { baseAction = { type: '' }; }
                var _a;
                var _b = exports.unwrapAction(baseAction), key = _b.key, action = _b.action;
                return childKey === key
                    ? tslib_1.__assign({}, state, (_a = {}, _a[key] = model.reducer(state[key], action), _a)) : _this._model.reducer(state, baseAction);
            }),
        });
    };
    Builder.prototype.subActions = function (wrappers) {
        return new Builder(tslib_1.__assign({}, this.model, { actions: addSubActions(this._model.actions, wrappers) }));
    };
    Object.defineProperty(Builder.prototype, "model", {
        get: function () {
            return tslib_1.__assign({}, this._model);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Builder.prototype, "actions", {
        get: function () {
            return this.model.actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Builder.prototype, "reducer", {
        get: function () {
            return this.model.reducer;
        },
        enumerable: true,
        configurable: true
    });
    return Builder;
}());
function subActionsReducer(reducer) {
    return function (state, action) {
        if (action === void 0) { action = { type: '' }; }
        return getSubActions(action).reduce(function (prevState, action) { return reducer(prevState, action); }, state);
    };
}
function getSubActions(action) {
    var _a;
    var _b = action.actions, actions = _b === void 0 ? [] : _b, baseAction = tslib_1.__rest(action, ["actions"]);
    return (_a = [baseAction]).concat.apply(_a, (actions.map(getSubActions)));
}
exports.getSubActions = getSubActions;
exports.unwrapAction = function (action) {
    return {
        key: action.type.substring(0, action.type.indexOf(types_1.ACTIONS_DELIMITER)),
        action: {
            payload: action.payload,
            type: action.type.substring(action.type.indexOf(types_1.ACTIONS_DELIMITER) + 1)
        }
    };
};
function wrapChildActionCreators(wrap, actions) {
    return Object.keys(actions).reduce(function (result, actionKey) {
        var _a, _b, _c;
        if (typeof actions[actionKey] === 'function') {
            if (isActionCreatorsGetter(actions[actionKey])) {
                return (tslib_1.__assign({}, result, (_a = {}, _a[actionKey] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return wrapChildActionCreators(wrap, actions[actionKey].apply(actions, args));
                }, _a)));
            }
            else {
                return (tslib_1.__assign({}, result, (_b = {}, _b[actionKey] = function (payload) { return wrap(actions[actionKey](payload)); }, _b)));
            }
        }
        else {
            return (tslib_1.__assign({}, result, (_c = {}, _c[actionKey] = wrapChildActionCreators(wrap, actions[actionKey]), _c)));
        }
    }, {});
}
exports.wrapChildActionCreators = wrapChildActionCreators;
function wrapAction(key) {
    var wrap = function (action) {
        var newAction = tslib_1.__assign({}, action, { type: exports.joinKeys(key, action.type) });
        if (action.actions) {
            newAction.actions = action.actions.map(wrap);
        }
        return newAction;
    };
    return wrap;
}
exports.wrapAction = wrapAction;
exports.joinKeys = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return keys.join(types_1.ACTIONS_DELIMITER);
};
function addSubActions(actions, wrappers) {
    var wrappersList = decomposeKeys(wrappers);
    return wrapChildActionCreators(function wrapAction(action) {
        var subActinos = (action.actions || []).map(wrapAction);
        return tslib_1.__assign({}, action, { actions: wrappersList.hasOwnProperty(action.type)
                ? subActinos.concat([wrappersList[action.type](action.payload, actions)]) : subActinos });
    }, actions);
}
exports.addSubActions = addSubActions;
function decomposeKeys(list, parentKey) {
    if (parentKey === void 0) { parentKey = ''; }
    return Object.keys(list).reduce(function (result, key) {
        var _a;
        if (typeof list[key] === 'object') {
            return tslib_1.__assign({}, result, decomposeKeys(list[key], parentKey ? exports.joinKeys(parentKey, key) : key));
        }
        else {
            return tslib_1.__assign({}, result, (_a = {}, _a[parentKey ? exports.joinKeys(parentKey, key) : key] = list[key], _a));
        }
    }, {});
}
exports.decomposeKeys = decomposeKeys;
/** @todo продумать, как по-другому определять, что функция возвращает создателей действий, а не действия */
var ActionCreatorsGetter = '__ActionCreatorsGetter__';
function markAsActionCreatorsGetter(getter) {
    getter[ActionCreatorsGetter] = true;
    return getter;
}
exports.markAsActionCreatorsGetter = markAsActionCreatorsGetter;
function isActionCreatorsGetter(getter) {
    return !!getter[ActionCreatorsGetter];
}
exports.isActionCreatorsGetter = isActionCreatorsGetter;
function build(model) {
    if (model === void 0) { model = { actions: {}, reducer: function (s) {
            if (s === void 0) { s = {}; }
            return (tslib_1.__assign({}, s));
        } }; }
    return new Builder(model);
}
exports.build = build;
