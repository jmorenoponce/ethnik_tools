import Settings from '../core/Settings.js';

/**
 * The TickConfiguration class is a utility class that provides methods to retrieve
 * audio and visual configurations for different accent levels within a rhythmic sequence.
 */
class TickConfiguration {

	/**
	 * Retrieves the frequency corresponding to the provided accent level.
	 *
	 * @param {number} accent - The accent level. A value of 2 corresponds to the downbeat,
	 *                          a value of 1 corresponds to the beat, and any other value
	 *                          corresponds to subdivision.
	 * @return {number} The frequency associated with the provided accent level.
	 */
	static getFrequency(accent) {

		switch (accent) {
			case 2:
				return Settings.audioConstants.frequencies.downbeat;
			case 1:
				return Settings.audioConstants.frequencies.beat;
			default:
				return Settings.audioConstants.frequencies.subdivision;
		}
	}


	/**
	 * Determines the duration value based on the provided accent.
	 *
	 * @param {number} accent - The accent level used to determine the duration.
	 *                          Typically, 2 represents a downbeat,
	 *                          1 represents a beat,
	 *                          and other values represent a subdivision.
	 * @return {number} The duration corresponding to the given accent level.
	 */
	static getDuration(accent) {

		switch (accent) {
			case 2:
				return Settings.audioConstants.durations.downbeat;
			case 1:
				return Settings.audioConstants.durations.beat;
			default:
				return Settings.audioConstants.durations.subdivision;
		}
	}


	/**
	 * Determines the type of tick based on the given accent value.
	 *
	 * @param {number} accent - The accent value to evaluate. Expected values are:
	 *                          2 for 'downbeat', 1 for 'beat', and others for 'subdivision'.
	 * @return {string} Returns the corresponding tick type as a string. Possible values are:
	 *                  'downbeat', 'beat', or 'subdivision'.
	 */
	static getTickType(accent) {

		switch (accent) {
			case 2:
				return 'downbeat';
			case 1:
				return 'beat';
			default:
				return 'subdivision';
		}
	}


	/**
	 * Gets the corresponding symbol based on the provided accent level.
	 *
	 * @param {number} accent - The accent value that determines the type of symbol. Expected values are:
	 *                          2 for Downbeat, 1 for Beat, and other values for Subdivision.
	 * @return {string} Returns the symbol representing the accent level. Possible values are:
	 *                 '🔴' for Downbeat, '🔵' for Beat, and '⚪' for Subdivision.
	 */
	static getSymbol(accent) {

		switch (accent) {
			case 2:
				return '🔴'; // Downbeat
			case 1:
				return '🔵'; // Beat
			default:
				return '⚪'; // Subdivision
		}
	}
}

export default TickConfiguration;