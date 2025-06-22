
import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';

/**
 * Represents a strategy for generating and displaying a visual tone
 * representation using ANSI characters. This class is a fallback
 * implementation of the `AudioPlaybackStrategy` that does not produce
 * actual audio but instead outputs visual symbols to indicate tones.
 */
class ToneGeneratorStrategy extends AudioPlaybackStrategy {

	/**
	 * Plays a sound character based on the given type, frequency, and duration.
	 *
	 * @param {string} type - The type of sound or tick to be played.
	 * @param {number} frequency - The frequency of the sound in Hertz, which determines its intensity.
	 * @param {number} duration - The duration of the sound in milliseconds.
	 * @return {Promise<void>} A promise that resolves when the tick playback is complete.
	 */
	async playTick(type, frequency, duration) {

		const intensity = Math.floor((frequency / 1000) * 10);
		const char = '♪♫♬'[Math.min(intensity, 2)];
		process.stdout.write(char);
	}


	/**
	 * Checks if the required condition or resource is available.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if the condition or resource is available, otherwise false.
	 */
	async isAvailable() {

		return true;
	}
}

export default ToneGeneratorStrategy;