
import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';

/**
 * Fallback tone generator strategy using visual feedback
 */
class ToneGeneratorStrategy extends AudioPlaybackStrategy {

	/**
	 * Generate a visual tone representation using ANSI characters.
	 *
	 * @param {string} type - Not used but kept for interface consistency.
	 * @param {number} frequency - The frequency determines the visual intensity.
	 * @param {number} duration - Not used but kept for interface consistency.
	 * @return {Promise<void>} A promise that resolves immediately.
	 */
	async playTick(type, frequency, duration) {

		const intensity = Math.floor((frequency / 1000) * 10);
		const char = '♪♫♬'[Math.min(intensity, 2)];
		process.stdout.write(char);
	}


	/**
	 * Tone generator is always available as a fallback.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true.
	 */
	async isAvailable() {

		return true;
	}
}

export default ToneGeneratorStrategy;