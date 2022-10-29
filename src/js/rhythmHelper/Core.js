
import Config from "./Config"
import DomManager from "./DomManager"

class Core {

	static _pulseNames = {

	}


	constructor() {

		this.bpm = 0;

		this.config = new Config();
		this.dom = new DomManager();


	}

	init() {

		console.log('The Core is initialized');

		console.log(this.config)
		console.log(this.dom);

	}
}

export default Core;