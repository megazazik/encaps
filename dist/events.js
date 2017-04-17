"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventDispatcher = (function () {
    function EventDispatcher() {
        this.handlers = [];
    }
    EventDispatcher.prototype.add = function (handler) {
        if (handler && this.handlers.indexOf(handler) == -1) {
            this.handlers.push(handler);
        }
    };
    EventDispatcher.prototype.remove = function (handler) {
        if (handler && this.handlers.indexOf(handler) >= 0) {
            this.handlers.splice(this.handlers.indexOf(handler), 1);
        }
    };
    EventDispatcher.prototype.notifyAll = function (data) {
        this.handlers.forEach(function (handler) { return handler(data); });
    };
    return EventDispatcher;
}());
exports.default = EventDispatcher;
