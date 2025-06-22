import Settings from '../core/Settings.js';

/**
 * Factory class for creating metronome presets.
 * Implements Factory pattern for preset creation.
 */
class PresetFactory {
	constructor() {
		this._presets = {
			'classical': { bpm: 120, division: 1, accent: true },
			'jazz': { bpm: 140, division: 4, accent: true },
			'rock': { bpm: 120, division: 2, accent: true },
			'latin': { bpm: 100, division: 4, accent: true }
		};
	}

	createPreset(name) {
		return this._presets[name] || null;
	}

	getAvailablePresets() {
		return Object.keys(this._presets);
	}

	addPreset(name, config) {
		if (Settings.validatePreset(config)) {
			this._presets[name] = config;
		} else {
			console.error("Invalid preset configuration");
		}
	}
}

export default PresetFactory;