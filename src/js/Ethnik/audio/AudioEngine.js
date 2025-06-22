import { performance } from 'perf_hooks';
import fs from 'fs';
import Settings from '../core/Settings.js';
import FileAudioStrategy from './strategies/FileAudioStrategy.js';
import SystemAudioStrategy from './strategies/SystemAudioStrategy.js';
import ToneGeneratorStrategy from './strategies/ToneGeneratorStrategy.js';


/**
 * A class responsible for managing audio playback and configuration.
 *
 * The AudioEngine class handles the initialization, strategy selection, latency calibration,
 * and playback of audio ticks. It provides methods to configure audio properties such as volume
 * and to retrieve audio-related information.
 */
class AudioEngine {

	/**
	 * Creates an instance of the class and initializes the audio system along with the default settings.
	 *
	 * The constructor sets up sound files, volume, latency compensation, and selects the default strategy.
	 * Additionally, it initializes and registers available audio strategies such as File Audio, System Audio, and Tone Generator strategies.
	 *
	 * @return {void} This constructor does not return a value.
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
	 * Initializes the audio system by detecting the best audio strategy for the current environment.
	 * It sets the detected strategy as the current strategy and logs the selected audio method.
	 * If the selected strategy is a system audio strategy, it performs latency calibration.
	 *
	 * @return {Promise<void>} A promise that resolves once the audio system is initialized and configured.
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
	 * Determines and selects the best available audio strategy based on a predefined priority order.
	 * The priority order is: file -> system -> tone. If no strategy in the priority order is available,
	 * it defaults to the 'tone' strategy.
	 *
	 * @return {Object} The detected audio strategy that is available and prioritized.
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
	 * Retrieves the name of the given strategy.
	 *
	 * @param {object} strategy - The strategy object to evaluate.
	 * @return {string} The name of the strategy. Possible values are 'file', 'system', 'tone', or 'unknown'.
	 */
	_getStrategyName(strategy) {

		if (strategy instanceof FileAudioStrategy) return 'file';
		if (strategy instanceof SystemAudioStrategy) return 'system';
		if (strategy instanceof ToneGeneratorStrategy) return 'tone';
		return 'unknown';
	}


	/**
	 * Calibrates the audio playback latency by measuring the time difference
	 * between initiating a playback tick and the recorded performance time.
	 *
	 * @return {void} This method does not return a value. It sets the `_latencyCompensation`
	 * property with the estimated latency in milliseconds.
	 */
	_calibrateLatency() {

		const calibrationStart = performance.now();
		const calibrationFreq = Settings.audioConstants.frequencies.beat;
		const calibrationDuration = Settings.audioConstants.durations.subdivision;
		this._currentStrategy.playTick('calibration', calibrationFreq, calibrationDuration);
		this._latencyCompensation = performance.now() - calibrationStart;
		console.log(`🎛️  Estimated latency: ${this._latencyCompensation.toFixed(2)}ms`);
	}


	/**
	 * Plays a tick sound using the current playback strategy, applying a latency compensation if necessary.
	 *
	 * @param {string} type - The type of sound to play (default is 'beat').
	 * @param {number} frequency - The frequency of the sound in Hz (default is 800).
	 * @param {number} duration - The duration of the sound in milliseconds (default is 100).
	 * @return {Promise<void>} A promise that resolves when the tick sound has been played.
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
	 * Sets the volume level for the current instance.
	 *
	 * The volume level determines the sound intensity and must be within
	 * the valid range specified by the application settings.
	 *
	 * @param {number} volume The desired volume level to be set. It should be validated using the application's constraints.
	 * @return {void} Does not return any value.
	 */
	setVolume(volume) {

		if (Settings.isValidVolume(volume)) {
			this._volume = volume;
		}
	}


	/**
	 * Retrieves information related to the current audio playback strategy.
	 *
	 * @return {Object} An object containing the following properties:
	 * - method {string}: The name of the current audio strategy being used.
	 * - latency {number}: The latency compensation value for audio playback.
	 * - volume {number}: The current volume level.
	 * - hasAudioFiles {boolean}: Indicates whether any audio files exist in the configured sound files directory.
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