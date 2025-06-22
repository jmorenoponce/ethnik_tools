import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';
import Settings from "../../core/Settings.js";

/**
 * Represents a strategy for generating and displaying a visual tone
 * representation using ANSI characters. This class is a fallback
 * implementation of the `AudioPlaybackStrategy` that does not produce
 * actual audio but instead outputs visual symbols to indicate tones.
 */
class ToneGeneratorStrategy extends AudioPlaybackStrategy {

	/**
	 * Plays a sound character based on the given type, frequency, and duration.
	 * Now uses centralized configuration for symbol generation.
	 *
	 * @param {string} type - The type of sound or tick to be played.
	 * @param {number} frequency - The frequency of the sound in Hertz, which determines its intensity.
	 * @param {number} duration - The duration of the sound in milliseconds.
	 * @return {Promise<void>} A promise that resolves when the tick playback is complete.
	 */
	async playTick(type, frequency, duration) {

		// ✅ REFACTORED: Usar configuración centralizada
		const config = Settings.visualAudioConstants.toneGeneration;
		const maxFrequency = Settings.audioConstants.frequencies.downbeat;

		// Calcular intensidad usando configuración centralizada
		const intensity = Math.floor((frequency / maxFrequency) * config.intensityLevels);

		// Obtener símbolo usando configuración centralizada
		const symbols = config.musicSymbols.chars;
		const clampedIntensity = Math.min(intensity, config.maxSymbolIndex);
		const char = symbols[clampedIntensity];

		// ✅ REFACTORED: Aplicar configuración de output si está habilitada
		const outputConfig = Settings.visualAudioConstants.output;
		let output = char;

		if (outputConfig.addSpacing) {
			output += ' ';
		}

		process.stdout.write(output);
	}


	/**
	 * Alternative method using Settings utility function (even cleaner)
	 */
	async playTickAlternative(type, frequency, duration) {

		const char = Settings.getVisualToneSymbol(frequency, 'default');

		const outputConfig = Settings.visualAudioConstants.output;
		const output = outputConfig.addSpacing ? char + ' ' : char;

		process.stdout.write(output);
	}


	/**
	 * Extended version with color support (for future enhancement)
	 */
	async playTickWithColors(type, frequency, duration) {

		const char = Settings.getVisualToneSymbol(frequency, 'default');
		const config = Settings.visualAudioConstants;

		let output = char;

		// Future: Add ANSI color codes based on frequency/intensity
		if (config.output.useColors) {
			const intensity = Math.floor(
				(frequency / Settings.audioConstants.frequencies.downbeat) *
				config.toneGeneration.intensityLevels
			);

			// Map intensity to ANSI colors (red=low, yellow=med, green=high)
			const colors = ['\x1b[31m', '\x1b[33m', '\x1b[32m']; // Red, Yellow, Green
			const colorIndex = Math.min(Math.floor(intensity / 3), 2);
			output = colors[colorIndex] + char + '\x1b[0m'; // Reset color
		}

		if (config.output.addSpacing) {
			output += ' ';
		}

		process.stdout.write(output);
	}


	/**
	 * Checks if the required condition or resource is available.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if the condition or resource is available.
	 */
	async isAvailable() {
		return true;
	}
}

export default ToneGeneratorStrategy;