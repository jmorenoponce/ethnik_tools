"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RH_DomManager = /** @class */ (function () {
    function RH_DomManager() {
        this._$elements = {
            parentCnt: false,
            playBtn: false,
            stopBtn: false,
            bpmSelector: false,
            volumeSelector: false
        };
        this._init();
    }
    RH_DomManager.prototype._init = function () {
        this._getElements();
    };
    RH_DomManager.prototype._getElements = function () {
    };
    RH_DomManager.prototype.render = function () {
    };
    RH_DomManager.prototype.refresh = function () {
    };
    return RH_DomManager;
}());
exports.default = RH_DomManager;
