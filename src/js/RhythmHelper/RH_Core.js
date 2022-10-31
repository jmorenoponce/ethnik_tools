import RH_Settings from "./RH_Settings.js";
import RH_DomManager from "./RH_DomManager.js";
import RH_ConsoleManager from "./RH_ConsoleManager.js";


class RH_Core {


	constructor() {

		this._settings = new RH_Settings();
		this._console = new RH_ConsoleManager();
		this._dom = new RH_DomManager();

		this._interface = '';

		this._intervalFnc = false;

		this._bpm = 0;
		this._pulse = 0;
		this._volume = 0;
		this._is_valid_settings = false;

		this._initialize();
	}


	play() {

		console.log("Let's play");
		this._intervalFnc = this._setTimeLapse(this._bpm);
	}


	stop() {

		console.log("I'm stopped");
		clearInterval(this._intervalFnc);
	}


	setBpm(newBpm) {

		if (newBpm < RH_Settings.defaultParams.bpmMin || newBpm > RH_Settings.defaultParams.bpmMax) {
			return false;
		}

		this._bpm = newBpm;
		console.log('The Bpm is: ', this._settings.getTempoName(this._bpm) + ' [' + this._bpm + 'bpm]');
	}


	setPulse(pulse) {

		if (pulse < 0 || pulse > 16) {

			return false;
		}

		this._pulse = pulse;
		console.log('The pulse subdivision is: ', this._pulse);
	}


	tempoList() {

		return this._settings.getTempoList();
	}


	savePreset() {


	}


	loadPreset() {


	}


	reload() {


	}


	defaultPreset() {


	}


	exit() {


	}


	_initialize() {

		console.log('Welcome to Rhythm Helper')

		this.setBpm(RH_Settings.defaultParams.bpmInitial);
		this.setPulse(RH_Settings.defaultParams.division);
		this._is_valid_settings = true;

		console.log('Please, write [play] [stop] [setbpm=value] [pulselist] [save] [reload] [exit]');
	}


	_setTimeLapse(bpm) {

		const _this = this;
		const _bpmToMs = (60000 / bpm) * this._pulse;

		return setInterval(function () {

			_this._playSound();
		}, _bpmToMs);
	}


	_setEvents() {


	}


	_on_play_click() {


	}


	_on_stop_click() {


	}


	_on_bpm_selector_click() {


	}


	_render() {

		this._dom.render(this._bpm, this._settings.getTempoName(this._bpm));
	}


	_playSound() {

		console.log('.');
	}
}

export default RH_Core;