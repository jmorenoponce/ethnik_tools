
import $ from "jquery";

class RH_DomManager {


	constructor() {

		this._$elements = {

			parentCnt: 		false,
			playBtn: 		false,
			stopBtn: 		false,
			bpmSelector: 	false,
			volumeSelector: false
		}

		this._init();
	}


	_init() {

		this._getElements();
	}


	_getElements() {


	}


	render() {

	}


	refresh() {

	}
}

export default RH_DomManager;