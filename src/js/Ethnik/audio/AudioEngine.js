import { performance } from 'perf_hooks';
import fs from 'fs';
import Settings from '../core/Settings.js';
import FileAudioStrategy from './strategies/FileAudioStrategy.js';
import SystemAudioStrategy from './strategies/SystemAudioStrategy.js';
import ToneGeneratorStrategy from './strategies/ToneGeneratorStrategy.js';


/**
 * AudioEngine is responsible for managing audio playback using different strategies,
 * handling latency compensation, and providing access to audio configuration settings.
 */
class AudioEngine {

	/**
	 * Constructs a new instance of the class, initializing sound file paths, volume, latency compensation, and audio strategies.
	 *
	 * @return {void} This constructor does not return a value.
	 */
	constructor() {

		// TODO: Hardcoded file sounds
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
	 * Initializes the audio system by detecting the best audio strategy
	 * and setting it up. If the system strategy is selected, latency
	 * calibration is executed.
	 *
	 * @return {Promise<void>} A promise that resolves once the audio system is initialized.
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
	 * Detects and determines the best available audio strategy based on predefined priorities.
	 * It iterates through the prioritized list of audio strategies, checks their availability,
	 * and returns the first available strategy. If no strategies from the prioritized list
	 * are available, it defaults to the "tone" strategy.
	 *
	 * @return {Object} The best available audio strategy or the default "tone" strategy if none are available.
	 */
	async _detectBestAudioStrategy() {

		const priorities = Settings.commandConstants.audioStrategyPriorities;

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
	 * Determines the name of the strategy based on the provided strategy instance.
	 *
	 * @param {Object} strategy - The strategy object to evaluate.
	 * @return {string} The name of the strategy ('file', 'system', 'tone', or 'unknown').
	 */
	_getStrategyName(strategy) {

		if (strategy instanceof FileAudioStrategy) return 'file';
		if (strategy instanceof SystemAudioStrategy) return 'system';
		if (strategy instanceof ToneGeneratorStrategy) return 'tone';
		return 'unknown';
	}


	/**
	 * Calibrates the latency for audio playback by measuring the time taken
	 * to initiate a tick sound and adjusting the compensation value accordingly.
	 * Uses the system and audio constants for frequency, duration, and timing values.
	 *
	 * @return {void} Does not return any value; updates the latency compensation property.
	 */
	_calibrateLatency() {

		const calibrationStart = performance.now();

		const calibrationFreq = Settings.audioConstants.frequencies.beat;
		const calibrationDuration = Settings.audioConstants.durations.subdivision;

		this._currentStrategy.playTick('calibration', calibrationFreq, calibrationDuration);
		this._latencyCompensation = performance.now() - calibrationStart;

		const { audioCalibrationDelayMs } = Settings.systemConstants.timing;
		console.log(`🎛️  Estimated latency: ${this._latencyCompensation.toFixed(2)}ms (calibration delay: ${audioCalibrationDelayMs}ms)`);
	}


	/**
	 * Plays a single tick sound with specific type, frequency, and duration, taking latency compensation into account.
	 * The tick is played immediately if latency compensation is not required or after a delay if compensation is necessary.
	 *
	 * @param {string} [type='beat'] - The type of tick sound to play (e.g., 'beat'). Defaults to 'beat'.
	 * @param {number} [frequency=800] - The frequency of the tick sound in hertz. Defaults to 800 Hz.
	 * @param {number} [duration=100] - The duration of the tick sound in milliseconds. Defaults to 100 ms.
	 * @return {Promise<void>} A promise that resolves when the tick sound finishes playing.
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
	 * Sets the volume level for the instance.
	 *
	 * @param {number} volume - The new volume level to set. Must be a number between 0 and 100 (inclusive).
	 * @return {void} This method does not return a value.
	 */
	setVolume(volume) {

		if (!isNaN(volume) && volume >= 0 && volume <= 100) {
			this._volume = volume;
		}
	}


	/**
	 * Retrieves information about the current audio system's configuration and status.
	 *
	 * @return {Object} An object containing the following attributes:
	 * - method: The name of the current audio strategy.
	 * - latency: The latency compensation value for audio playback.
	 * - volume: The current volume level.
	 * - hasAudioFiles: A boolean indicating whether any audio files exist in the specified paths.
	 * - availableStrategies: A list of available audio strategies, defined by system settings.
	 * - currentStrategy: The name of the currently selected audio strategy.
	 */
	getAudioInfo() {

		return {
			method: this._getStrategyName(this._currentStrategy),
			latency: this._latencyCompensation,
			volume: this._volume,
			hasAudioFiles: Object.values(this._soundFiles).some(f => fs.existsSync(f)),
			availableStrategies: Settings.commandConstants.audioStrategyPriorities,
			currentStrategy: this._getStrategyName(this._currentStrategy)
		};
	}


	/**
	 * Retrieves the list of available audio strategy priorities from the configuration settings.
	 *
	 * @return {Array} An array containing the audio strategy priorities defined in the settings.
	 */
	getAvailableStrategies() {

		return Settings.commandConstants.audioStrategyPriorities;
	}


	/**
	 * Switches the current audio strategy to the specified strategy if it is available.
	 *
	 * @param {string} strategyName - The name of the strategy to switch to. Must be a valid strategy listed in Settings.commandConstants.audioStrategyPriorities.
	 * @return {Promise<boolean>} - Resolves to true if the strategy was successfully switched, or false if the specified strategy is not available.
	 * @throws {Error} - Throws an error if the provided strategyName is invalid.
	 */
	async switchStrategy(strategyName) {

		if (!Settings.commandConstants.audioStrategyPriorities.includes(strategyName)) {
			throw new Error(`Invalid strategy: ${strategyName}`);
		}

		const strategy = this._strategies.get(strategyName);
		if (await strategy.isAvailable()) {
			this._currentStrategy = strategy;
			console.log(`🔄 Switched to audio strategy: ${strategyName}`);
			return true;
		}

		return false;
	}
}

export { AudioEngine };