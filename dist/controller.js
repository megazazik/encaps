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
    /** @deprecated Will be removed in the next version. Use initState instead. */
    Builder.prototype.setInitState = function (f) {
        if (console && typeof console.warn === 'function') {
            console.warn('"setInitState" method is deprecated and will be removed in the next version. Use "initState" instead.');
        }
        return this.initState(f);
    };
    Builder.prototype.initState = function (f) {
        var _this = this;
        /** @todo дополнять текущее состояние, а не перезаписывать */
        var initState = f(this._model.reducer());
        return new Builder(tslib_1.__assign({}, this._model, { reducer: subActionsReducer(function (state, action) {
                if (state === void 0) { state = initState; }
                return _this._model.reducer(state, action);
            }) }));
    };
    /** @deprecated Will be removed in the next version. Use handlers instead. */
    Builder.prototype.action = function (handlers) {
        if (console && typeof console.warn === 'function') {
            console.warn('"action" method is deprecated and will be removed in the next version. Use "handlers" instead.');
        }
        return this.handlers(handlers);
    };
    Builder.prototype.handlers = function (handlers) {
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
    Builder.prototype.children = function (
    /** ассоциативный массив дочерних моделей */
    children) {
        /** @todo оптимизировать */
        return Object.keys(children).reduce(function (newBuilder, key) { return newBuilder.child(key, children[key]); }, this);
    };
    Builder.prototype.subActions = function (wrappers) {
        return new Builder(tslib_1.__assign({}, this.model, { actions: addSubActions(this._model.actions, wrappers) }));
    };
    Builder.prototype.effect = function (
    /** тип действия */
    key, 
    /** Функция, которая создает действия не в виде простых объектов */
    effect) {
        var _this = this;
        var _a;
        return new Builder(tslib_1.__assign({}, this.model, { actions: tslib_1.__assign({}, this.model.actions, (_a = {}, _a[key] = createEffect(effect, function () { return _this.model.actions; }), _a)) }));
    };
    /**
     * Позволяет создавать любые действия, не только простые объекты
     * @returns новый строитель
     */
    Builder.prototype.effects = function (
    /** ассоциативный массив дочерних моделей */
    effects) {
        /** @todo оптимизировать */
        return Object.keys(effects).reduce(function (newBuilder, key) { return newBuilder.effect(key, effects[key]); }, this);
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
    var wrappedActions = Object.keys(actions).reduce(function (result, actionKey) {
        var _a, _b, _c;
        if (typeof actions[actionKey] === 'function') {
            if (isEffect(actions[actionKey])) {
                return (tslib_1.__assign({}, result, (_a = {}, _a[actionKey] = wrapEffect(function (actions) { return wrapChildActionCreators(wrap, actions); }, actions[actionKey]), _a)));
            }
            else {
                // обычные действия
                return (tslib_1.__assign({}, result, (_b = {}, _b[actionKey] = function (payload) { return wrap(actions[actionKey](payload)); }, _b)));
            }
        }
        else {
            // действия дочерних объектов
            return (tslib_1.__assign({}, result, (_c = {}, _c[actionKey] = wrapChildActionCreators(wrap, actions[actionKey]), _c)));
        }
    }, {});
    return wrappedActions;
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
var CheckEffectField = '__Encaps.ActionCreatorsGetter__';
var GetEffectParamsValue = '__Encaps.GetEffectParamsValue__';
function createEffect(effect, getActions) {
    var newEffect = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args[0] === GetEffectParamsValue) {
            return [effect, getActions];
        }
        else {
            return effect(getActions.apply(void 0, args)).apply(void 0, args);
        }
    };
    newEffect[CheckEffectField] = true;
    return newEffect;
}
exports.createEffect = createEffect;
function wrapEffect(wrapActions, effect) {
    var _a = effect(GetEffectParamsValue), originEffect = _a[0], getActions = _a[1];
    return createEffect(originEffect, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return wrapActions(getActions.apply(void 0, args));
    });
}
exports.wrapEffect = wrapEffect;
function isEffect(getter) {
    return !!getter[CheckEffectField];
}
exports.isEffect = isEffect;
/** @deprecated will be removed in the next version. Use createEffect instead. */
function markAsActionCreatorsGetter(getter) {
    if (console && typeof console.warn === 'function') {
        console.warn('"markAsActionCreatorsGetter" method is deprecated and will be removed in the next version. Use "createEffect" instead.');
    }
    getter[CheckEffectField] = true;
    return getter;
}
exports.markAsActionCreatorsGetter = markAsActionCreatorsGetter;
function build(model) {
    if (model === void 0) { model = { actions: {}, reducer: function (s) {
            if (s === void 0) { s = {}; }
            return (tslib_1.__assign({}, s));
        } }; }
    return new Builder(model);
}
exports.build = build;
