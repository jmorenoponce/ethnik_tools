/**
 * A class representing the configuration settings for a rhythm helper application.
 * Includes default parameters and predefined tempo names along with helper methods.
 */
class Settings {

	/**
	 * Debug mode flag
	 */
	static debug = false;

	/**
	 * An object representing the default parameters for the rhythm helper application.
	 * These parameters include settings such as tempo, beat division, volume, and sound file.
	 *
	 * Properties:
	 * - bpmMin: The minimum beats per minute (bpm) value allowed.
	 * - bpmMax: The maximum beats per minute (bpm) value allowed.
	 * - bpmInitial: The initial beats per minute (bpm) value when the application starts.
	 * - division: The beat division multiplier (e.g., quarter note, eighth note, etc.).
	 * - volume: The default volume level, represented as a percentage (0 to 100).
	 * - soundFile: The file path to the default sound file used for rhythm playback.
	 * - lookahead: The lookahead time in milliseconds for precise scheduling.
	 * - maxHistorySize: Maximum size for performance history arrays.
	 * - debounceTime: Minimum time between tap tempo detections in milliseconds.
	 * - tapTimeoutMs: Timeout for tap tempo history cleanup in milliseconds.
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
	 * An object representing various musical tempo names and their corresponding
	 * beats per minute (BPM) ranges.
	 *
	 * Each key in the object is a tempo name, and its value is an array of two numbers:
	 * the minimum and maximum BPM for that tempo.
	 *
	 * Properties:
	 * - `larghissimo`: Very, very slow tempo with BPM ranging from 20 to 39.
	 * - `largo`: Slow and dignified tempo with BPM ranging from 40 to 59.
	 * - `lento`: Slow tempo with BPM ranging from 60 to 67.
	 * - `adagio`: Leisurely tempo with BPM ranging from 68 to 79.
	 * - `andante`: Walking pace tempo with BPM ranging from 80 to 99.
	 * - `moderato`: Moderate tempo with BPM ranging from 100 to 111.
	 * - `allegretto`: Moderately fast tempo with BPM ranging from 112 to 127.
	 * - `allegro`: Fast, quickly, and bright tempo with BPM ranging from 128 to 159.
	 * - `vivace`: Lively and fast tempo with BPM ranging from 160 to 169.
	 * - `presto`: Very fast tempo with BPM ranging from 170 to 199.
	 * - `prestissimo`: Extremely fast tempo with BPM ranging from 200 to 218.
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
	 * Division names mapping for better user experience
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
	 * Logs debug messages if debug mode is enabled.
	 *
	 * @param {...any} args - Arguments to log.
	 * @return {void} No return value.
	 */
	static log(...args) {
		if (this.debug) {
			console.log('[DEBUG]', new Date().toISOString(), ...args);
		}
	}


	/**
	 * Retrieves the list of tempo names from the settings.
	 *
	 * @return {Object} The object containing the tempo names and their BPM ranges.
	 */
	static getTempoList() {

		return Settings.tempoNames;
	}


	/**
	 * Determines the tempo name corresponding to the given beats per minute (bpm) value.
	 *
	 * @param {number} bpm - The beats per minute value to determine the tempo name for.
	 * @return {string} The tempo name that corresponds to the provided bpm, or 'unknown' if no match is found.
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
	 * Gets the name of a division based on its numeric value.
	 *
	 * @param {number} division - The numeric representation of the division.
	 * @return {string} The name of the division, or a default string if the division is not found.
	 */
	static getDivisionName(division) {

		return Settings.divisionNames[division] || `División ${division}`;
	}


	/**
	 * Validates if a BPM value is within the acceptable range.
	 *
	 * @param {number} bpm - The BPM value to validate.
	 * @return {boolean} True if the BPM is valid, false otherwise.
	 */
	static isValidBpm(bpm) {

		return !isNaN(bpm) && bpm >= Settings.defaultParams.bpmMin && bpm <= Settings.defaultParams.bpmMax;
	}


	/**
	 * Validates if a division value is within the acceptable range.
	 *
	 * @param {number} division - The division value to validate.
	 * @return {boolean} True if the division is valid, false otherwise.
	 */
	static isValidDivision(division) {

		return !isNaN(division) && division >= 1 && division <= 16;
	}


	/**
	 * Validates if a volume value is within the acceptable range.
	 *
	 * @param {number} volume - The volume value to validate.
	 * @return {boolean} True if the volume is valid, false otherwise.
	 */
	static isValidVolume(volume) {

		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Validates a complete preset configuration.
	 *
	 * @param {Object} preset - The preset object to validate.
	 * @return {boolean} True if the preset is valid, false otherwise.
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
	 * Enables debug mode.
	 *
	 * @return {void} No return value.
	 */
	static enableDebug() {
		this.debug = true;
		this.log('Debug mode enabled');
	}


	/**
	 * Disables debug mode.
	 *
	 * @return {void} No return value.
	 */
	static disableDebug() {
		this.log('Debug mode disabled');
		this.debug = false;
	}
}

export default Settings;