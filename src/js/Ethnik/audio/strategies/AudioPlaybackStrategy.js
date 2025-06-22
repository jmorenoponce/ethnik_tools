
class AudioPlaybackStrategy {

	/**
	 * Play a tick sound with the given parameters.
	 *
	 * @param {string} type - The type of tick sound to play.
	 * @param {number} frequency - The frequency of the tick sound in Hz.
	 * @param {number} duration - The duration of the tick sound in milliseconds.
	 * @return {Promise<void>} A promise that resolves when the tick has been played.
	 */
	async playTick(type, frequency, duration) {
		throw new Error('playTick method must be implemented');
	}


	/**
	 * Test if this strategy is available on the current system.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if available.
	 */
	async isAvailable() {
		throw new Error('isAvailable method must be implemented');
	}
}

export default AudioPlaybackStrategy;