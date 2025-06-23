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

		// ✅ FIXED: Use centralized configuration instead of hardcoded paths
		this._soundFiles = { ...Settings.audioFileConstants.soundFiles };
		this._volumeAdjustments = { ...Settings.audioFileConstants.volumes };

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

		// ✅ ENHANCED: Validate audio files before selecting strategy
		await this._validateAudioFiles();

		this._currentStrategy = await this._detectBestAudioStrategy();

		const strategyName = this._getStrategyName(this._currentStrategy);
		console.log(`🔊 Audio method: ${strategyName}`);

		// ✅ ENHANCED: Show audio file status if using file strategy
		if (this._currentStrategy instanceof FileAudioStrategy) {
			this._logAudioFileStatus();
		}

		// Calibrate latency if using system strategy
		if (this._currentStrategy instanceof SystemAudioStrategy) {
			this._calibrateLatency();
		}
	}

	/**
	 * 🆕 NEW: Validates that audio files exist and are accessible
	 * Provides helpful error messages if files are missing
	 */
	async _validateAudioFiles() {

		console.log('🔍 Validating audio files...');

		const missingFiles = [];
		const validFiles = [];

		for (const [tickType, filePath] of Object.entries(this._soundFiles)) {
			if (fs.existsSync(filePath)) {
				validFiles.push({ tickType, filePath });
				console.log(`✅ ${tickType}: ${filePath}`);
			} else {
				missingFiles.push({ tickType, filePath });
				console.log(`❌ ${tickType}: ${filePath} (NOT FOUND)`);
			}
		}

		// Try to find alternative files if some are missing
		if (missingFiles.length > 0) {
			console.log('🔍 Searching for alternative audio files...');
			await this._findAlternativeAudioFiles(missingFiles);
		}

		// If no files found, show helpful message
		if (validFiles.length === 0) {
			console.log('⚠️  No audio files found - will use system beeps or visual fallback');
			console.log(`💡 Expected audio file: ${Settings.audioFileConstants.fallbackSound}`);
		}
	}

	/**
	 * 🆕 NEW: Attempts to find alternative audio files in different locations
	 */
	async _findAlternativeAudioFiles(missingFiles) {

		const searchPaths = Settings.audioFileConstants.searchPaths;
		const supportedFormats = Settings.audioFileConstants.supportedFormats;

		for (const { tickType, filePath } of missingFiles) {
			const fileName = filePath.split('/').pop().split('.')[0]; // Get filename without extension

			for (const searchPath of searchPaths) {
				for (const format of supportedFormats) {
					const testPath = `${searchPath}${fileName}${format}`;

					if (fs.existsSync(testPath)) {
						console.log(`🔄 Found alternative: ${tickType} -> ${testPath}`);
						this._soundFiles[tickType] = testPath;
						break;
					}
				}
				if (this._soundFiles[tickType] !== filePath) break; // Found alternative, stop searching
			}
		}
	}

	/**
	 * 🆕 NEW: Logs the status of audio files for debugging
	 */
	_logAudioFileStatus() {

		console.log('📋 Audio File Configuration:');

		for (const [tickType, filePath] of Object.entries(this._soundFiles)) {
			const exists = fs.existsSync(filePath);
			const status = exists ? '✅' : '❌';
			const volume = this._volumeAdjustments[tickType] || 1.0;

			console.log(`   ${status} ${tickType}: ${filePath} (vol: ${(volume * 100).toFixed(0)}%)`);

			if (exists) {
				try {
					const stats = fs.statSync(filePath);
					const sizeKB = (stats.size / 1024).toFixed(1);
					console.log(`      📏 Size: ${sizeKB} KB | Modified: ${stats.mtime.toLocaleDateString()}`);
				} catch (error) {
					console.log(`      ⚠️ Error reading file stats: ${error.message}`);
				}
			}
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

		console.log('🔍 Detecting best audio strategy...');

		for (const strategyName of priorities) {
			const strategy = this._strategies.get(strategyName);

			console.log(`   Testing ${strategyName} strategy...`);

			const isAvailable = await strategy.isAvailable();

			if (isAvailable) {
				console.log(`   ✅ ${strategyName} strategy is available`);
				return strategy;
			} else {
				console.log(`   ❌ ${strategyName} strategy is not available`);
			}
		}

		// Fallback to tone generator
		console.log('   🔄 Falling back to tone generator strategy');
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

		try {
			const compensatedDelay = Math.max(0, -this._latencyCompensation);

			// ✅ ENHANCED: Apply volume adjustment for tick type
			const volumeAdjustment = this._volumeAdjustments[type] || 1.0;
			const adjustedVolume = this._volume * volumeAdjustment;

			if (compensatedDelay > 0) {
				setTimeout(() => {
					this._currentStrategy.playTick(type, frequency, duration, adjustedVolume);
				}, compensatedDelay);
			} else {
				await this._currentStrategy.playTick(type, frequency, duration, adjustedVolume);
			}

		} catch (error) {
			console.error(`❌ Error playing tick: ${error.message}`);

			// ✅ ENHANCED: Fallback to tone generator if file/system audio fails
			if (!(this._currentStrategy instanceof ToneGeneratorStrategy)) {
				console.log('🔄 Falling back to tone generator...');
				const toneStrategy = this._strategies.get('tone');
				await toneStrategy.playTick(type, frequency, duration);
			}
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

			// ✅ ENHANCED: Propagate volume to current strategy if it supports it
			if (this._currentStrategy && typeof this._currentStrategy.setVolume === 'function') {
				this._currentStrategy.setVolume(volume);
			}

			console.log(`🔊 Volume set to: ${volume}%`);
		} else {
			console.warn(`⚠️ Invalid volume: ${volume}. Must be between 0-100.`);
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
	 * - audioFiles: Detailed information about audio files (if using file strategy).
	 */
	getAudioInfo() {

		const strategyName = this._getStrategyName(this._currentStrategy);

		// ✅ ENHANCED: Check actual file existence
		const audioFileStatuses = {};
		let hasAnyAudioFile = false;

		for (const [tickType, filePath] of Object.entries(this._soundFiles)) {
			const exists = fs.existsSync(filePath);
			audioFileStatuses[tickType] = {
				path: filePath,
				exists: exists,
				volume: this._volumeAdjustments[tickType] || 1.0
			};
			if (exists) hasAnyAudioFile = true;
		}

		return {
			method: strategyName,
			latency: this._latencyCompensation,
			volume: this._volume,
			hasAudioFiles: hasAnyAudioFile,
			availableStrategies: Settings.commandConstants.audioStrategyPriorities,
			currentStrategy: strategyName,
			audioFiles: audioFileStatuses,
			fallbackSound: Settings.audioFileConstants.fallbackSound,
			searchPaths: Settings.audioFileConstants.searchPaths,
			supportedFormats: Settings.audioFileConstants.supportedFormats
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
			throw new Error(`Invalid strategy: ${strategyName}. Valid strategies: ${Settings.commandConstants.audioStrategyPriorities.join(', ')}`);
		}

		const strategy = this._strategies.get(strategyName);

		console.log(`🔄 Attempting to switch to ${strategyName} strategy...`);

		if (await strategy.isAvailable()) {
			const oldStrategy = this._getStrategyName(this._currentStrategy);
			this._currentStrategy = strategy;

			console.log(`✅ Switched from ${oldStrategy} to ${strategyName} strategy`);

			// Re-validate files if switching to file strategy
			if (strategy instanceof FileAudioStrategy) {
				await this._validateAudioFiles();
			}

			return true;
		} else {
			console.log(`❌ ${strategyName} strategy is not available`);
			return false;
		}
	}

	/**
	 * 🆕 NEW: Force refresh of audio file paths from Settings
	 * Useful when audio files are added/removed at runtime
	 */
	async refreshAudioFiles() {

		console.log('🔄 Refreshing audio file configuration...');

		// Update sound files from Settings
		this._soundFiles = { ...Settings.audioFileConstants.soundFiles };
		this._volumeAdjustments = { ...Settings.audioFileConstants.volumes };

		// Update file strategy with new paths
		const fileStrategy = this._strategies.get('file');
		if (fileStrategy && typeof fileStrategy.updateSoundFiles === 'function') {
			fileStrategy.updateSoundFiles(this._soundFiles);
		}

		// Re-validate files
		await this._validateAudioFiles();

		// Re-detect best strategy if current one is no longer available
		if (!(await this._currentStrategy.isAvailable())) {
			console.log('⚠️ Current strategy no longer available, re-detecting...');
			this._currentStrategy = await this._detectBestAudioStrategy();
		}

		console.log('✅ Audio files refreshed');
	}

	/**
	 * 🆕 NEW: Test audio playback with current configuration
	 * Useful for debugging audio issues
	 */
	async testAudio() {

		console.log('🧪 Testing audio playback...');

		const testFrequencies = Settings.audioConstants.frequencies;
		const testDurations = Settings.audioConstants.durations;

		try {
			console.log('   Testing downbeat...');
			await this.playTick('downbeat', testFrequencies.downbeat, testDurations.downbeat);

			await new Promise(resolve => setTimeout(resolve, 200));

			console.log('   Testing beat...');
			await this.playTick('beat', testFrequencies.beat, testDurations.beat);

			await new Promise(resolve => setTimeout(resolve, 200));

			console.log('   Testing subdivision...');
			await this.playTick('subdivision', testFrequencies.subdivision, testDurations.subdivision);

			console.log('✅ Audio test completed successfully');
			return true;

		} catch (error) {
			console.error(`❌ Audio test failed: ${error.message}`);
			return false;
		}
	}

	/**
	 * 🆕 NEW: Get detailed diagnostics about the audio system
	 * Useful for troubleshooting audio issues
	 */
	getDiagnostics() {

		const currentStrategy = this._getStrategyName(this._currentStrategy);

		return {
			timestamp: new Date().toISOString(),
			platform: process.platform,
			nodeVersion: process.version,
			currentStrategy: currentStrategy,
			latencyCompensation: this._latencyCompensation,
			volume: this._volume,
			strategies: {
				file: {
					available: this._strategies.get('file').isAvailable(),
					soundFiles: this._soundFiles,
					volumeAdjustments: this._volumeAdjustments
				},
				system: {
					available: this._strategies.get('system').isAvailable()
				},
				tone: {
					available: this._strategies.get('tone').isAvailable()
				}
			},
			configuration: {
				audioFileConstants: Settings.audioFileConstants,
				audioConstants: Settings.audioConstants,
				strategyPriorities: Settings.commandConstants.audioStrategyPriorities
			}
		};
	}

	/**
	 * 🆕 NEW: Create a comprehensive audio system report
	 * Useful for bug reports and system analysis
	 */
	async generateSystemReport() {

		console.log('📋 Generating audio system report...');

		const report = {
			timestamp: new Date().toISOString(),
			system: {
				platform: process.platform,
				nodeVersion: process.version,
				architecture: process.arch
			},
			audioEngine: {
				currentStrategy: this._getStrategyName(this._currentStrategy),
				latency: this._latencyCompensation,
				volume: this._volume
			},
			strategies: {},
			audioFiles: {},
			configuration: Settings.audioFileConstants
		};

		// Test each strategy
		for (const [name, strategy] of this._strategies) {
			try {
				const available = await strategy.isAvailable();
				report.strategies[name] = {
					available: available,
					className: strategy.constructor.name
				};
			} catch (error) {
				report.strategies[name] = {
					available: false,
					error: error.message
				};
			}
		}

		// Check each audio file
		for (const [tickType, filePath] of Object.entries(this._soundFiles)) {
			const exists = fs.existsSync(filePath);
			report.audioFiles[tickType] = {
				path: filePath,
				exists: exists
			};

			if (exists) {
				try {
					const stats = fs.statSync(filePath);
					report.audioFiles[tickType].size = stats.size;
					report.audioFiles[tickType].modified = stats.mtime;
				} catch (error) {
					report.audioFiles[tickType].error = error.message;
				}
			}
		}

		console.log('✅ Audio system report generated');
		return report;
	}

	/**
	 * 🆕 NEW: Cleanup and destroy the audio engine
	 * Properly releases resources and cleans up strategies
	 */
	destroy() {

		console.log('🧹 Destroying AudioEngine...');

		// Clear latency compensation
		this._latencyCompensation = 0;

		// Cleanup strategies
		for (const [name, strategy] of this._strategies) {
			if (typeof strategy.destroy === 'function') {
				try {
					strategy.destroy();
				} catch (error) {
					console.warn(`⚠️ Error destroying ${name} strategy: ${error.message}`);
				}
			}
		}

		// Clear references
		this._strategies.clear();
		this._currentStrategy = null;
		this._soundFiles = {};
		this._volumeAdjustments = {};

		console.log('✅ AudioEngine destroyed');
	}
}

export { AudioEngine };