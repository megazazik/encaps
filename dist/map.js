"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var controller_1 = require("./controller");
function createMap(model) {
    var map = controller_1.build({
        actions: {
            item: controller_1.createEffect(function (actions) { return function () { return actions; }; }, function (index) { return controller_1.wrapChildActionCreators(controller_1.wrapAction(controller_1.joinKeys('item', index)), model.actions); })
        },
        reducer: function (state, baseAction) {
            if (state === void 0) { state = { items: {} }; }
            if (baseAction === void 0) { baseAction = { type: '' }; }
            var _a = controller_1.unwrapAction(baseAction), action = _a.action, key = _a.key;
            if (key === 'item') {
                var _b = controller_1.unwrapAction(action), childAction = _b.action, childKey = _b.key;
                if (!childKey || !state.items.hasOwnProperty(childKey)) {
                    return state;
                }
                var items = tslib_1.__assign({}, state.items);
                items[childKey] = model.reducer(items[childKey], childAction);
                return tslib_1.__assign({}, state, { items: items });
            }
            else {
                return state;
            }
        },
    })
        .handlers({
        add: function (state, _a) {
            var payload = _a.payload;
            var items = tslib_1.__assign({}, state.items);
            if (!payload || items.hasOwnProperty(payload)) {
                return state;
            }
            items[payload] = model.reducer();
            return tslib_1.__assign({}, state, { items: items });
        },
        remove: function (state, _a) {
            var payload = _a.payload;
            if (!state.items.hasOwnProperty(payload)) {
                return state;
            }
            var _b = tslib_1.__assign({}, state.items), _c = payload, removed = _b[_c], items = tslib_1.__rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
            return tslib_1.__assign({}, state, { items: items });
        },
    });
    return map;
}
exports.createMap = createMap;
