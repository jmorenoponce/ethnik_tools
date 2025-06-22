import { performance } from 'perf_hooks';
import fs from 'fs';
import Settings from '../core/Settings.js';
import FileAudioStrategy from './strategies/FileAudioStrategy.js';
import SystemAudioStrategy from './strategies/SystemAudioStrategy.js';
import ToneGeneratorStrategy from './strategies/ToneGeneratorStrategy.js';


class AudioEngine {

	/**
	 * Constructs an instance of the AudioEngine and initializes audio system settings.
	 *
	 * This constructor sets default values for audio methods, sound file paths,
	 * volume levels, and latency compensation. It also invokes a method to
	 * initialize the audio system to ensure proper functionality.
	 *
	 * @return {void} No return value.
	 */
	constructor() {

		this._soundFiles = {
			downbeat: './assets/sounds/downbeat.wav',
			beat: './assets/sounds/beat.wav',
			subdivision: './assets/sounds/subdivision.wav'
		};

		this._volume = Settings.defaultParams.volume;
		this._latencyCompensation = 0;
		this._currentStrategy = null;

		// Initialize available strategies
		this._strategies = new Map([
			['file', new FileAudioStrategy(this._soundFiles)],
			['system', new SystemAudioStrategy()],
			['tone', new ToneGeneratorStrategy()]
		]);

		this._initAudioSystem();
	}


	/**
	 * Initializes the audio system by detecting the best audio method
	 * and calibrating latency if required based on the method selected.
	 *
	 * @return {Promise<void>} A promise that resolves when the audio system has been successfully initialized.
	 */
	async _initAudioSystem() {

		this._currentStrategy = await this._detectBestAudioStrategy();
		console.log(`🔊 Audio method: ${this._getStrategyName(this._currentStrategy)}`);

		// Calibrate latency if using system strategy
		if (this._currentStrategy instanceof SystemAudioStrategy) {
			this._calibrateLatency();
		}
	}


	/**
	 * Determines the best audio strategy based on availability.
	 *
	 * @return {Promise<AudioPlaybackStrategy>} A promise that resolves to the best available strategy.
	 */
	async _detectBestAudioStrategy() {

		// Priority order: file -> system -> tone
		const priorities = ['file', 'system', 'tone'];

		for (const strategyName of priorities) {
			const strategy = this._strategies.get(strategyName);
			if (await strategy.isAvailable()) {
				return strategy;
			}
		}

		// Fallback to tone generator
		return this._strategies.get('tone');
	}


	/**
	 * Get a human-readable name for the current strategy.
	 *
	 * @param {AudioPlaybackStrategy} strategy - The strategy to get name for.
	 * @return {string} The strategy name.
	 */
	_getStrategyName(strategy) {

		if (strategy instanceof FileAudioStrategy) return 'file';
		if (strategy instanceof SystemAudioStrategy) return 'system';
		if (strategy instanceof ToneGeneratorStrategy) return 'tone';
		return 'unknown';
	}


	/**
	 * Calibrates the system's latency by playing a system beep and measuring the time it takes.
	 * This method estimates the latency and stores it in the `_latencyCompensation` property.
	 *
	 * @return {void} No value is returned as the latency calibration result is stored internally.
	 */
	_calibrateLatency() {

		const calibrationStart = performance.now();
		this._currentStrategy.playTick('calibration', 440, 50);
		this._latencyCompensation = performance.now() - calibrationStart;
		console.log(`🎛️  Estimated latency: ${this._latencyCompensation.toFixed(2)}ms`);
	}


	/**
	 * Plays a tick sound with the given type, frequency, and duration, compensating for latency if applicable.
	 *
	 * @param {string} type - The type of tick sound to play. Default is 'beat'.
	 * @param {number} frequency - The frequency of the tick sound in Hz. Default is 800.
	 * @param {number} duration - The duration of the tick sound in milliseconds. Default is 100.
	 * @return {Promise<void>} A promise that resolves when the tick has been played.
	 */
	async playTick(type = 'beat', frequency = 800, duration = 100) {

		const compensatedDelay = Math.max(0, -this._latencyCompensation);

		if (compensatedDelay > 0) {
			setTimeout(() => this._currentStrategy.playTick(type, frequency, duration), compensatedDelay);
		} else {
			this._currentStrategy.playTick(type, frequency, duration);
		}
	}


	/**
	 * Sets the volume level to a specified value. The value is clamped between 0 and 100.
	 *
	 * @param {number} volume - The desired volume level. Values below 0 are set to 0, and values above 100 are set to 100.
	 * @return {void}
	 */
	setVolume(volume) {

		if (Settings.isValidVolume(volume)) {
			this._volume = volume;
		}
	}


	/**
	 * Retrieves information about the current audio settings and status.
	 *
	 * @return {Object} An object containing the following properties:
	 * - method: The audio method being used.
	 * - latency: The latency compensation value.
	 * - volume: The current volume level.
	 * - hasAudioFiles: A boolean indicating whether valid audio files are available.
	 */
	getAudioInfo() {

		return {
			method: this._getStrategyName(this._currentStrategy),
			latency: this._latencyCompensation,
			volume: this._volume,
			hasAudioFiles: Object.values(this._soundFiles).some(f => fs.existsSync(f))
		};
	}
}

export { AudioEngine };