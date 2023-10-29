"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RH_Settings = /** @class */ (function () {
    function RH_Settings() {
    }
    RH_Settings.prototype.getTempoList = function () {
    };
    RH_Settings.prototype.getTempoName = function (bpm) {
        for (var _k in RH_Settings.tempoNames) {
            if (bpm >= RH_Settings.tempoNames[_k][0] && bpm <= RH_Settings.tempoNames[_k][1]) {
                return _k;
            }
        }
    };
    /**
     * Predefined preset parameters
     * @type {{volume: number, bpmMax: number, bpmInitial: number, bpmMin: number, soundFile: string}}
     */
    RH_Settings.defaultParams = {
        bpmMin: 20,
        bpmMax: 218,
        bpmInitial: 100,
        division: 1,
        volume: 70,
        soundFile: './defaultAssets/sounds/rhythmHelper_classic_sound.ogg'
    };
    /**
     * Declares the min and max limits for each traditional tempo names
     * @type {{larghissimo: number[], lento: number[], moderato: number[], andante: number[], prestissimo: number[], allegretto: number[], allegro: number[], largo: number[], vivace: number[], adagio: number[], presto: number[]}}
     * @private
     */
    RH_Settings.tempoNames = {
        larghissimo: [20, 39],
        largo: [40, 59],
        lento: [60, 67],
        adagio: [68, 79],
        andante: [80, 99],
        moderato: [100, 111],
        allegretto: [112, 127],
        allegro: [128, 159],
        vivace: [160, 169],
        presto: [170, 199],
        prestissimo: [200, 218]
    };
    return RH_Settings;
}());
exports.default = RH_Settings;
