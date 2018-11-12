"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var controller_1 = require("./controller");
function createList(model) {
    var list = controller_1.build({
        actions: {
            item: controller_1.createEffect(function (actions) { return function () { return actions; }; }, function (index) { return controller_1.wrapChildActionCreators(controller_1.wrapAction(controller_1.joinKeys('item', index)), model.actions); })
        },
        reducer: function (state, baseAction) {
            if (state === void 0) { state = { items: [] }; }
            if (baseAction === void 0) { baseAction = { type: '' }; }
            var _a = controller_1.unwrapAction(baseAction), action = _a.action, key = _a.key;
            if (key === 'item') {
                var _b = controller_1.unwrapAction(action), childAction = _b.action, childKey = _b.key;
                var childIndex = parseInt(childKey);
                if (isNaN(childIndex) || childIndex < 0 || childIndex > state.items.length - 1) {
                    return state;
                }
                var items = state.items.slice();
                items[childIndex] = model.reducer(items[childIndex], childAction);
                return tslib_1.__assign({}, state, { items: items });
            }
            else {
                return state;
            }
        },
    })
        .handlers({
        add: function (state, _a) {
            var _b = _a.payload, payload = _b === void 0 ? 1 : _b;
            var items = state.items.slice();
            for (var i = 0; i < payload; i++) {
                items.push(model.reducer());
            }
            return tslib_1.__assign({}, state, { items: items });
        },
        subtract: function (state, _a) {
            var _b = _a.payload, payload = _b === void 0 ? 1 : _b;
            var items = state.items.slice();
            for (var i = 0; i < payload; i++) {
                items.pop();
            }
            return tslib_1.__assign({}, state, { items: items });
        },
        remove: function (state, _a) {
            var payload = _a.payload;
            if (typeof payload !== 'number' || payload >= state.items.length) {
                return state;
            }
            var items = state.items.slice();
            items.splice(payload, 1);
            return tslib_1.__assign({}, state, { items: items });
        },
        insert: function (state, _a) {
            var payload = _a.payload;
            if (typeof payload !== 'number') {
                return state;
            }
            var items = state.items.slice();
            items.splice(payload, 0, model.reducer());
            return tslib_1.__assign({}, state, { items: items });
        },
    });
    return list;
}
exports.createList = createList;
