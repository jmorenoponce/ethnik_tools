import Settings from "./Settings.js";
import DomManager from "./DomManager.js";
import ConsoleManager from "./ConsoleManager.js";


class Core {


	constructor() {

        this._settings = new Settings();
        this._console = new ConsoleManager();
        this._dom = new DomManager();

        this._is_valid_settings = false;
        this._is_playing = false;

        this._intervalFnc = null;

        this._bpm = 0;
        this._division = 0;
        this._volume = 0;

        this._initialize();
    }


    _initialize() {

        console.log("Welcome to Ethnik Tools");

        this.setTempo(Settings.defaultParams.bpmInitial);
        this.setDivision(Settings.defaultParams.division);
        this._is_valid_settings = true;
    }


    play() {

        if (!this._is_valid_settings) {
            return false;
        }

        this._is_playing = true;
        this._intervalFnc = this._setTimeLapse(this._bpm);
    }


    stop() {

        this._is_playing = false;
        clearInterval(this._intervalFnc);
    }


    setTempo(newTempo) {

        if (newTempo < Settings.defaultParams.bpmMin || newTempo > Settings.defaultParams.bpmMax) {
      	
		return false;
        }

        this._bpm = newTempo;
        
console.log("The Bpm is: ", this._settings.getTempoName(this._bpm) + " [" + this._bpm + "bpm]");
    }

    
    setDivision(division) {

        if (division < 0 || division > 16) {
            return false;
        }

        this._division = division;

console.log("The pulse subdivision is: ", this._division);
    }


    tempoList() {

console.log("hola");
        return this._settings.getTempoList();
    }


    savePreset() {}


    loadPreset() {}


    reload() {}


    defaultPreset() {}


    exit() {}


    _setTimeLapse(bpm) {

        const _this = this;
        const _bpmToMs = (60000 / bpm) * this._division;

        return setInterval(function () {
            _this._playSound();
        }, _bpmToMs);
    }


    _setEvents() {}


    _on_play_click() {}


    _on_stop_click() {}


    _on_bpm_selector_click() {}


    _render() {

        this._dom.render(this._bpm, this._settings.getTempoName(this._bpm));
    }


    _playSound() {

        console.log(".");
    }
}

export {
	Core
};