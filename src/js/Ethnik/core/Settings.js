/**
 * The `Settings` class manages and provides default parameters, tempo names,
 * division names, and validation methods for a rhythm helper application.
 * It also includes debugging capabilities and utility functions for
 * handling presets and configurations.
 */
class Settings {

	static debug = false;

	static audioConstants = {

		frequencies: {
			downbeat: 1000,
			beat: 800,
			subdivision: 600
		},
		durations: {
			downbeat: 120,
			beat: 100,
			subdivision: 80
		}
	};

	static performanceConstants = {

		driftWarningThreshold: 10,
		highSeverityThreshold: 20,
		debounceTime: 50
	};


	/**
	 * An object containing the default configuration parameters for the application.
	 *
	 * Properties:
	 * - bpmMin: Minimum beats per minute (BPM) value.
	 * - bpmMax: Maximum beats per minute (BPM) value.
	 * - bpmInitial: Initial beats per minute (BPM) value on load.
	 * - division: The subdivision or multiplier used for setting tempo granularity.
	 * - volume: Default volume level expressed as a percentage (0-100).
	 * - soundFile: Path to the default sound file used for feedback or metronome sound.
	 * - lookahead: Time in milliseconds to look ahead when scheduling audio events.
	 * - maxHistorySize: Maximum number of entries to maintain in the history log.
	 * - debounceTime: Debouncing time in milliseconds to handle rapid user interactions.
	 * - tapTimeoutMs: Time in milliseconds to reset the tap tempo timeout.
	 *
	 * This object acts as a configuration preset for initializing application state
	 * or default behaviors.
	 */
	static defaultParams = {

		bpmMin: 		20,
		bpmMax: 		218,
		bpmInitial: 	100,
		division:		1,
		volume: 		70,
		soundFile: 		'./defaultAssets/sounds/rhythmHelper_classic_sound.ogg',
		lookahead:		15.0,
		maxHistorySize:	100,
		debounceTime:	50,
		tapTimeoutMs:	3000
	}


	/**
	 * Represents a mapping of tempo names to their corresponding BPM (Beats Per Minute) ranges.
	 * Each property of the object corresponds to a tempo name, with the value being an array
	 * representing the minimum and maximum BPM for that tempo.
	 *
	 * Properties:
	 * - larghissimo: [20, 39] - Extremely slow tempo.
	 * - largo: [40, 59] - Very slow, broad tempo.
	 * - lento: [60, 67] - Slowly, sustained tempo.
	 * - adagio: [68, 79] - Slow and stately tempo.
	 * - andante: [80, 99] - Walking pace, moderate tempo.
	 * - moderato: [100, 111] - Moderately paced tempo.
	 * - allegretto: [112, 127] - Moderately fast tempo.
	 * - allegro: [128, 159] - Fast, lively tempo.
	 * - vivace: [160, 169] - Lively and brisk tempo.
	 * - presto: [170, 199] - Very fast tempo.
	 * - prestissimo: [200, 218] - Extremely fast tempo.
	 */
	static tempoNames = {

		larghissimo: 	[20, 39],
		largo:			[40, 59],
		lento:			[60, 67],
		adagio:			[68, 79],
		andante:		[80, 99],
		moderato:		[100, 111],
		allegretto:		[112, 127],
		allegro:		[128, 159],
		vivace:			[160, 169],
		presto:			[170, 199],
		prestissimo:	[200, 218]
	}


	/**
	 * An object that maps numerical division keys to their corresponding musical note division names.
	 * The keys represent division factors, and the values are the names of the respective musical note divisions.
	 *
	 * Properties:
	 * - 1: Represents "Negras (1/4)"
	 * - 2: Represents "Corcheas (1/8)"
	 * - 3: Represents "Tresillos"
	 * - 4: Represents "Semicorcheas (1/16)"
	 * - 6: Represents "Seisillos"
	 * - 8: Represents "Fusas (1/32)"
	 * - 12: Represents "Docesillos"
	 * - 16: Represents "Semicorcheas cuádruples"
	 */
	static divisionNames = {

		1: "Negras (1/4)",
		2: "Corcheas (1/8)",
		3: "Tresillos",
		4: "Semicorcheas (1/16)",
		6: "Seisillos",
		8: "Fusas (1/32)",
		12: "Docesillos",
		16: "Semicorcheas cuádruples"
	}


	/**
	 * Logs a debug message to the console if debugging is enabled.
	 *
	 * @param {...any} args - The arguments to be logged. These can be any type and are passed to `console.log`.
	 * @return {void} This method does not return a value.
	 */
	static log(...args) {

		if (this.debug) {
			console.log('[DEBUG]', new Date().toISOString(), ...args);
		}
	}


	/**
	 * Retrieves the list of tempo names from the application settings.
	 *
	 * @return {Array} An array containing the names of tempos available in the settings.
	 */
	static getTempoList() {

		return Settings.tempoNames;
	}


	/**
	 * Retrieves the tempo name corresponding to a given beats per minute (BPM) value.
	 *
	 * @param {number} bpm - The beats per minute value to evaluate.
	 * @return {string} The tempo name corresponding to the BPM value, or 'unknown' if no match is found.
	 */
	static getTempoName(bpm) {

		for (const tempoName in Settings.tempoNames) {

			const [min, max] = Settings.tempoNames[tempoName];
			if (bpm >= min && bpm <= max) {
				return tempoName;
			}
		}

		return 'unknown';
	}


	/**
	 * Retrieves the name of the division based on the given division identifier.
	 *
	 * @param {string|number} division - The identifier for the division.
	 * @return {string} The name of the division associated with the given identifier, or a default formatted name if not found.
	 */
	static getDivisionName(division) {

		return Settings.divisionNames[division] || `División ${division}`;
	}


	/**
	 * Checks if the provided BPM (beats per minute) value is valid.
	 *
	 * A BPM value is considered valid if it is a number and falls within
	 * the predefined minimum and maximum BPM range defined in the Settings.
	 *
	 * @param {number} bpm - The BPM value to be validated.
	 * @return {boolean} True if the bpm is valid, otherwise false.
	 */
	static isValidBpm(bpm) {

		return !isNaN(bpm) && bpm >= Settings.defaultParams.bpmMin && bpm <= Settings.defaultParams.bpmMax;
	}


	/**
	 * Checks if the provided division value is valid.
	 *
	 * A valid division is a number between 1 and 16 (inclusive).
	 *
	 * @param {number} division - The division value to validate.
	 * @return {boolean} Returns true if the division is valid, otherwise false.
	 */
	static isValidDivision(division) {

		return !isNaN(division) && division >= 1 && division <= 16;
	}


	/**
	 * Validates if the given volume is within the acceptable range.
	 *
	 * @param {number} volume - The volume value to be validated.
	 * @return {boolean} Returns true if the volume is a number between 0 and 100 (inclusive), otherwise false.
	 */
	static isValidVolume(volume) {

		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Validates a given preset object to ensure it meets specific configuration requirements.
	 *
	 * @param {Object} preset - The preset object to be validated.
	 * @param {number} preset.bpm - The beats per minute (bpm) value of the preset.
	 * @param {string} preset.division - The division value of the preset.
	 * @param {boolean} preset.accent - The accent flag indicating specific configuration.
	 * @return {boolean} Returns true if the preset is valid; otherwise, returns false.
	 */
	static validatePreset(preset) {

		if (!preset || typeof preset !== 'object') {
			this.log('Invalid preset: not an object');
			return false;
		}

		const isValid = this.isValidBpm(preset.bpm) &&
			this.isValidDivision(preset.division) &&
			typeof preset.accent === 'boolean';

		if (!isValid) {
			this.log('Invalid preset configuration:', preset);
		}

		return isValid;
	}


	/**
	 * Enables debug mode for the application, allowing more detailed logging information.
	 * This method sets the internal 'debug' state to true and logs a confirmation message.
	 *
	 * @return {void} Does not return a value.
	 */
	static enableDebug() {

		this.debug = true;
		this.log('Debug mode enabled');
	}


	/**
	 * Disables the debug mode for the application. Once called, debug logs and related functionality will be turned off.
	 *
	 * @return {void} This method does not return any value.
	 */
	static disableDebug() {

		this.log('Debug mode disabled');
		this.debug = false;
	}
}

export default Settings;