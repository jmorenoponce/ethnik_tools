import Settings from '../core/Settings.js';


/**
 * The PresetFactory class provides functionality to manage and create musical presets.
 * It includes methods to retrieve predefined presets, add new presets, and list available presets.
 */
class PresetFactory {

	constructor() {

		this._presets = {
			'classical': {bpm: 120, division: 1, accent: true},
			'jazz': {bpm: 140, division: 4, accent: true},
			'rock': {bpm: 120, division: 2, accent: true},
			'latin': {bpm: 100, division: 4, accent: true}
		};
	}


	/**
	 * Retrieves a preset by its name.
	 *
	 * @param {string} name - The name of the preset to retrieve.
	 * @return {Object|null} The preset object if found, or null if no preset exists with the given name.
	 */
	createPreset(name) {

		return this._presets[name] || null;
	}


	/**
	 * Retrieves the list of available presets.
	 *
	 * @return {string[]} An array of preset names available in the system.
	 */
	getAvailablePresets() {

		return Object.keys(this._presets);
	}


	/**
	 * Adds a new preset to the internal presets collection if the configuration is valid.
	 *
	 * @param {string} name - The name of the preset to be added.
	 * @param {Object} config - The configuration object for the preset.
	 * @return {void}
	 */
	addPreset(name, config) {

		if (Settings.validatePreset(config)) {
			this._presets[name] = config;
		} else {
			console.error("Invalid preset configuration");
		}
	}
}

export default PresetFactory;