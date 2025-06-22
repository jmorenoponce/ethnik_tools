
/**
 * Represents an audio playback strategy.
 * The strategy defines how audio is played, particularly for tick sounds.
 * This is an abstract class and must be extended by a concrete subclass.
 * Concrete implementations should override and implement the provided methods.
 */
class AudioPlaybackStrategy {

	/**
	 * Plays a single tick sound with the given parameters.
	 *
	 * @param {string} type - The type of tick sound to play (e.g., "beep", "click").
	 * @param {number} frequency - The frequency of the tick sound in hertz.
	 * @param {number} duration - The duration of the tick sound in milliseconds.
	 * @return {Promise<void>} Resolves when the tick sound has been played.
	 * @throws {Error} If the method is not implemented or an error occurs during execution.
	 */
	async playTick(type, frequency, duration) {

		throw new Error('playTick method must be implemented');
	}


	/**
	 * Checks whether the resource or service is available.
	 *
	 * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the resource or service is available.
	 * @throws {Error} If the method is not implemented in a subclass or specific implementation.
	 */
	async isAvailable() {

		throw new Error('isAvailable method must be implemented');
	}
}

export default AudioPlaybackStrategy;