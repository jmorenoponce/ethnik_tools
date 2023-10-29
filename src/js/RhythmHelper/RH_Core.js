"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RH_Settings_js_1 = require("./RH_Settings.js");
var RH_DomManager_js_1 = require("./RH_DomManager.js");
var RH_ConsoleManager_js_1 = require("./RH_ConsoleManager.js");
var RH_Core = /** @class */ (function () {
    function RH_Core() {
        this._settings = new RH_Settings_js_1.default();
        this._console = new RH_ConsoleManager_js_1.default();
        this._dom = new RH_DomManager_js_1.default();
        this._intervalFnc = false;
        this._bpm = 0;
        this._division = 0;
        this._volume = 0;
        this._is_valid_settings = false;
        this._is_playing = false;
        this._initialize();
    }
    RH_Core.prototype.play = function () {
        if (!this._is_valid_settings) {
            return false;
        }
        this._is_playing = true;
        this._intervalFnc = this._setTimeLapse(this._bpm);
    };
    RH_Core.prototype.stop = function () {
        this._is_playing = false;
        clearInterval(this._intervalFnc);
    };
    RH_Core.prototype.setTempo = function (newTempo) {
        if (newTempo < RH_Settings_js_1.default.defaultParams.bpmMin || newTempo > RH_Settings_js_1.default.defaultParams.bpmMax) {
            return false;
        }
        this._bpm = newTempo;
        console.log('The Bpm is: ', this._settings.getTempoName(this._bpm) + ' [' + this._bpm + 'bpm]');
    };
    RH_Core.prototype.setDivision = function (division) {
        if (division < 0 || division > 16) {
            return false;
        }
        this._division = division;
        console.log('The pulse subdivision is: ', this._division);
    };
    RH_Core.prototype.tempoList = function () {
        return this._settings.getTempoList();
    };
    RH_Core.prototype.savePreset = function () {
    };
    RH_Core.prototype.loadPreset = function () {
    };
    RH_Core.prototype.reload = function () {
    };
    RH_Core.prototype.defaultPreset = function () {
    };
    RH_Core.prototype.exit = function () {
    };
    RH_Core.prototype._initialize = function () {
        console.log('Welcome to Rhythm Helper');
        this.setTempo(RH_Settings_js_1.default.defaultParams.bpmInitial);
        this.setDivision(RH_Settings_js_1.default.defaultParams.division);
        this._is_valid_settings = true;
        console.log('Please, write [play] [stop] [setbpm=value] [pulselist] [save] [reload] [exit]');
    };
    RH_Core.prototype._setTimeLapse = function (bpm) {
        var _this = this;
        var _bpmToMs = (60000 / bpm) * this._division;
        return setInterval(function () { _this._playSound(); }, _bpmToMs);
    };
    RH_Core.prototype._setEvents = function () {
    };
    RH_Core.prototype._on_play_click = function () {
    };
    RH_Core.prototype._on_stop_click = function () {
    };
    RH_Core.prototype._on_bpm_selector_click = function () {
    };
    RH_Core.prototype._render = function () {
        this._dom.render(this._bpm, this._settings.getTempoName(this._bpm));
    };
    RH_Core.prototype._playSound = function () {
        console.log('.');
    };
    return RH_Core;
}());
exports.default = RH_Core;
