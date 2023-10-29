import RH_Settings from "./RH_Settings.js";
import RH_DomManager from "./RH_DomManager.js";
import RH_ConsoleManager from "./RH_ConsoleManager.js";


class RH_Core {

	private _settings: RH_Settings;
	private _console: RH_ConsoleManager;
	private _dom: RH_DomManager;

	private _intervalFnc: number;

	private _is_valid_settings: boolean;
	private _is_playing: boolean;

	private _bpm: number;
	private _division: number;
	private _volume: number;


	constructor() {

		this._settings = new RH_Settings();
		this._console = new RH_ConsoleManager();
		this._dom = new RH_DomManager();

		this._is_valid_settings = false;
		this._is_playing = false;

		this._intervalFnc = null;

		this._bpm = 0;
		this._division = 0;
		this._volume = 0;


		this._initialize();
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

		if (newTempo < RH_Settings.defaultParams.bpmMin || newTempo > RH_Settings.defaultParams.bpmMax) {
			return false;
		}

		this._bpm = newTempo;
		console.log('The Bpm is: ', this._settings.getTempoName(this._bpm) + ' [' + this._bpm + 'bpm]');
	}


	setDivision(division) {

		if (division < 0 || division > 16) {
			return false;
		}

		this._division = division;

console.log('The pulse subdivision is: ', this._division);

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

		this.setTempo(RH_Settings.defaultParams.bpmInitial);
		this.setDivision(RH_Settings.defaultParams.division);
		this._is_valid_settings = true;

		console.log('Please, write [play] [stop] [setbpm=value] [pulselist] [save] [reload] [exit]');
	}


	_setTimeLapse(bpm: number) {

		const _this = this;
		const _bpmToMs = (60000 / bpm) * this._division;

		return setInterval(function () { _this._playSound(); }, _bpmToMs);
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