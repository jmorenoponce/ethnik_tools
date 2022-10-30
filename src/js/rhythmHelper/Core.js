
import Config from "./Config.js"
import DomManager from "./DomManager.js"

class Core {

	static _pulseNames = {
		//
	}


	constructor() {

		this._config = new Config();
		this._dom = new DomManager();

		// this.actualBpm = this._config.params.initialBpm;

		this.init();
	}

	init() {


		this.bpm = 0;

		console.log('The Core is initialized');

		console.log(this._config)
		console.log(this._dom);
	}
}

export default Core;