import {performance} from 'perf_hooks';
import Settings from "./Settings.js";
import ConsoleManager from "../interface/ConsoleManager.js";
import TimelineManager from "../timeline/TimelineManager.js";
import PerformanceMonitor from "../audio/PerformanceMonitor.js";
import TapTempoManager from "../managers/TapTempoManager.js";
import PresetFactory from "../factories/PresetFactory.js";
import {AudioEngine} from "../audio/AudioEngine.js";
import MetronomeEngine from "./MetronomeEngine.js";
import ConfigurationManager from "./ConfigurationManager.js";
import EventBus from "./EventBus.js";


/**
 * SystemCoordinator class is responsible for managing the initialization,
 * coordination, and lifecycle of the system components. It acts as a
 * central control point for subsystems such as audio, metronome,
 * configuration, and more.
 */
class SystemCoordinator {

	/**
	 * Constructor to initialize the system and its core components with optional dependency injection.
	 *
	 * @param {Object} dependencies - An object containing optional dependencies for initializing various components.
	 * @param {EventBus} [dependencies.eventBus] - The event bus for handling events.
	 * @param {AudioEngine} [dependencies.audioEngine] - The audio engine for managing audio operations.
	 * @param {PerformanceMonitor} [dependencies.performanceMonitor] - The performance monitor for tracking system performance.
	 * @param {TapTempoManager} [dependencies.tapTempoManager] - The tap tempo manager for tempo-related operations.
	 * @param {ConfigurationManager} [dependencies.configurationManager] - The configuration manager for managing system settings.
	 * @param {MetronomeEngine} [dependencies.metronomeEngine] - The metronome engine for rhythm and timing control.
	 * @param {TimelineManager} [dependencies.timelineManager] - The timeline manager for coordinating timeline events.
	 * @param {ConsoleManager} [dependencies.console] - The console manager for system debugging and interaction.
	 * @param {PresetFactory} [dependencies.presetFactory] - The factory for managing and creating presets.
	 *
	 * @return {void}
	 */
	constructor(dependencies = {}) {

		// Initialize event bus first
		this._eventBus = dependencies.eventBus || new EventBus();

		// Initialize core subsystems with dependency injection
		this._audioEngine = dependencies.audioEngine || new AudioEngine();
		this._performanceMonitor = dependencies.performanceMonitor || new PerformanceMonitor();
		this._tapTempoManager = dependencies.tapTempoManager || new TapTempoManager();

		// Initialize configuration and engine
		this._configurationManager = dependencies.configurationManager ||
			new ConfigurationManager(this._eventBus);

		this._metronomeEngine = dependencies.metronomeEngine ||
			new MetronomeEngine(this._audioEngine, this._performanceMonitor, this._eventBus);

		// Initialize managers that need coordination
		this._timelineManager = dependencies.timelineManager || new TimelineManager(this);
		this._console = dependencies.console || new ConsoleManager(this);

		// Presets using Factory pattern
		this._presetFactory = dependencies.presetFactory || new PresetFactory();

		// System state
		this._isInitialized = false;
		this._isShuttingDown = false;

		// Setup the system
		this._setupObservers();
		this._setupAutoSync();
		this._setupEventHandlers();
	}


	/**
	 * Initializes the system by setting up necessary components, logging system information, and emitting the initialization event.
	 * Ensures the system is initialized only once. If already initialized, it logs a warning and exits.
	 *
	 * @return {Promise<boolean>} A promise that resolves to `true` if initialization is successful, `false` if it fails.
	 */
	async initialize() {

		if (this._isInitialized) {
			console.warn('System already initialized');
			return true;
		}

		try {
			console.clear();
			console.log("🎵 Ethnik Tools - Professional Metronome v2.0");
			console.log("=".repeat(55));

			// Wait for audio to initialize
			await new Promise(resolve => setTimeout(resolve, 100));

			// Log system information
			this._logSystemInfo();
			console.log("=".repeat(55));
			console.log();

			this._isInitialized = true;
			this._eventBus.emit('system.initialized');

			return true;
		} catch (error) {
			console.error("Failed to initialize system:", error);
			Settings.log("Initialization error:", error);
			return false;
		}
	}


	/**
	 * Gracefully shuts down the system by stopping active processes, cleaning up subsystems,
	 * and emitting necessary shutdown events.
	 * The method ensures that resources are released and the system's state is reset.
	 * If the system is already in the process of shutting down, it logs a warning and exits early.
	 *
	 * @return {Promise<void>} Resolves when the shutdown process is complete.
	 */
	async shutdown() {

		if (this._isShuttingDown) {
			console.warn('System already shutting down');
			return;
		}

		this._isShuttingDown = true;
		this._eventBus.emit('system.shuttingDown');

		try {
			// Stop any active playback
			if (this.isPlaying) {
				await this.stop();
			}

			// Cleanup all subsystems
			this._metronomeEngine.destroy();
			this._configurationManager.destroy();
			this._tapTempoManager.destroy();
			this._timelineManager.destroy();
			this._performanceMonitor.reset();
			this._console.destroy();
			this._eventBus.destroy();

			this._isInitialized = false;
			console.log('✅ System shutdown complete');
		} catch (error) {
			console.error("Error during system shutdown:", error);
		}
	}


	/**
	 * Initiates the playback system, ensuring all checks and preconditions are met before starting.
	 * Validates the timeline mode status and initialization state before triggering the metronome engine.
	 * Emits appropriate events and logs feedback to the console based on the playback status.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if playback starts successfully, or false if an error occurs or a precondition is not met.
	 */
	async play() {

		try {
			if (this._timelineManager.isTimelineMode) {
				console.log("⚠️ Timeline active. Use 'timeline stop' first");
				return false;
			}

			if (!this._isInitialized) {
				console.log("⚠️ System not initialized");
				return false;
			}

			const result = await this._metronomeEngine.play();

			if (result) {
				const config = this._configurationManager.getConfigurationSummary();
				console.log(`▶️ Starting: ${config.bpm} BPM - ${config.divisionName}`);
				console.log(`🎯 Pattern: ${config.pattern} | Accents: ${config.accent ? 'Yes' : 'No'}`);
				console.log("Press 'stop' to stop\n");

				this._eventBus.emit('system.playbackStarted', config);
			}

			return result;
		} catch (error) {
			console.error("Failed to start playback:", error);
			this._eventBus.emit('system.error', {type: 'playback', error: error.message});
			return false;
		}
	}


	/**
	 * Stops the metronome engine and performs necessary operations when playback is halted.
	 * Triggers the 'system.playbackStopped' event on the event bus if the stop operation is successful.
	 * If the operation succeeds, performance statistics are displayed.
	 *
	 * @return {boolean} Returns true if the stop operation was successful, false otherwise.
	 */
	stop() {

		const result = this._metronomeEngine.stop();

		if (result) {
			this._showPerformanceStats();
			this._eventBus.emit('system.playbackStopped');
		}

		return result;
	}


	/**
	 * Sets the tempo for the playback.
	 *
	 * @param {number} newTempo - The new tempo value in beats per minute (BPM).
	 * @return {boolean} Returns true if the tempo was successfully updated, false otherwise.
	 */
	setTempo(newTempo) {

		const result = this._configurationManager.setBpm(newTempo);

		if (!result.success) {
			console.log(`❌ ${result.error}`);
			return false;
		}

		return this._withPlaybackPause(() => {
			console.log(`🎼 Tempo: ${result.change.newValue} BPM (${result.change.tempoName})`);
			return true;
		});
	}


	/**
	 * Updates the division configuration and logs the result.
	 *
	 * @param {string} division - The name or identifier of the division to set.
	 * @return {boolean} Returns true if the division was successfully updated, otherwise false.
	 */
	setDivision(division) {

		const result = this._configurationManager.setDivision(division);

		if (!result.success) {
			console.log(`❌ ${result.error}`);
			return false;
		}

		return this._withPlaybackPause(() => {
			console.log(`📏 Division: ${result.change.divisionName}`);
			return true;
		});
	}


	/**
	 * Sets the accent feature to either enabled or disabled.
	 *
	 * @param {boolean} enabled - A boolean value where `true` enables the accent feature and `false` disables it.
	 * @return {boolean} Returns `true` after attempting to set the accent feature.
	 */
	setAccent(enabled) {

		const result = this._configurationManager.setAccent(enabled);
		console.log(`🎯 Accents: ${result.change.newValue ? 'Enabled' : 'Disabled'}`);
		return true;
	}


	/**
	 * Updates the rhythmic pattern in the configuration manager.
	 *
	 * @param {string} pattern - The new rhythmic pattern to be set.
	 * @return {boolean} Returns true if the pattern was successfully updated; otherwise, false.
	 */
	setPattern(pattern) {

		const result = this._configurationManager.setPattern(pattern);

		if (!result.success) {
			console.log(`❌ ${result.error}`);
			return false;
		}

		console.log(`🎵 Rhythmic pattern: ${result.change.newValue}`);
		return true;
	}


	/**
	 * Sets the audio volume to the specified level.
	 *
	 * @param {number} volume - The desired volume level. Must be within the acceptable range defined by the configuration manager.
	 * @return {boolean} Returns true if the volume was successfully updated, otherwise returns false.
	 */
	setVolume(volume) {

		const result = this._configurationManager.setVolume(volume);

		if (!result.success) {
			console.log(`❌ ${result.error}`);
			return false;
		}

		this._audioEngine.setVolume(result.change.newValue);
		console.log(`🔊 Volume: ${result.change.newValue}%`);
		return true;
	}


	/**
	 * Loads and applies a preset configuration by its name.
	 *
	 * @param {string} name - The name of the preset to load.
	 * @return {boolean} Returns true if the preset was successfully loaded and applied, otherwise false.
	 */
	loadPreset(name) {

		const preset = this._presetFactory.createPreset(name);

		if (!preset) {
			console.log(`❌ Preset '${name}' not found`);
			console.log(`💡 Available presets: ${this._presetFactory.getAvailablePresets().join(', ')}`);
			return false;
		}

		return this._withPlaybackPause(() => {
			const result = this._configurationManager.applyPreset(preset);

			if (!result.success) {
				console.log(`❌ ${result.error}`);
				return false;
			}

			const config = this._configurationManager.getConfigurationSummary();
			console.log(`📁 Preset '${name}' loaded:`);
			console.log(`   🎼 Tempo: ${config.bpm} BPM`);
			console.log(`   📏 Division: ${config.divisionName}`);
			console.log(`   🎯 Accents: ${config.accent ? 'Yes' : 'No'}`);

			return true;
		});
	}


	/**
	 * Analyzes the user's tap input to detect a tempo in beats per minute (BPM).
	 * The method uses the tap input to calculate and provide feedback on the detected BPM.
	 *
	 * If sufficient taps have been detected, it returns a success result with the identified tempo.
	 * If fewer than the required number of taps are detected, the method provides feedback indicating the number of taps so far and encourages additional taps.
	 *
	 * @return {Object} An object representing the result of the tap detection. The result includes:
	 * - `success` (boolean): Indicates whether the tempo was successfully detected.
	 * - `bpm` (number, optional): The calculated beats per minute if the tempo was successfully detected.
	 * - `tapCount` (number): The number of taps detected so far.
	 * - `reason` (string, optional): The reason for failure, e.g., 'insufficient_taps', if the detection was unsuccessful.
	 */
	tapTempo() {

		const result = this._tapTempoManager.tap();

		if (result.success) {
			console.log(`🥁 Tap tempo detected: ${result.bpm} BPM (${result.tapCount} taps)`);
		} else {
			if (result.reason === 'insufficient_taps') {
				console.log(`🥁 Tap ${result.tapCount}/2+ (keep tapping...)`);
			}
		}
	}


	/**
	 * Retrieves and displays the current system status, including details about audio configuration, metronome state,
	 * event bus statistics, and other relevant operational metrics.
	 *
	 * @return {void} This method does not return a value; it only logs the system status to the console.
	 */
	getStatus() {

		const audioInfo = this._audioEngine.getAudioInfo();
		const engineStatus = this._metronomeEngine.getStatus();
		const configSummary = this._configurationManager.getConfigurationSummary();
		const eventBusStats = this._eventBus.getStats();

		console.log("\n📋 System Status:");
		console.log(`   🎵 State: ${engineStatus.isPlaying ? '▶️ Playing' : '⏹️ Stopped'}`);
		console.log(`   🎼 Tempo: ${configSummary.bpm} BPM (${configSummary.tempoName})`);
		console.log(`   📏 Division: ${configSummary.divisionName}`);
		console.log(`   🎯 Accents: ${configSummary.accent ? 'Enabled' : 'Disabled'}`);
		console.log(`   🎵 Pattern: ${configSummary.pattern}`);
		console.log(`   🔊 Volume: ${configSummary.volume}%`);
		console.log(`   🔧 Audio: ${audioInfo.method} (${audioInfo.latency.toFixed(1)}ms latency)`);
		console.log(`   🚌 Events: ${eventBusStats.totalListeners} listeners, ${eventBusStats.totalEvents} events`);

		if (engineStatus.isPlaying && engineStatus.stats) {
			console.log(`   ⏱️ Running: ${engineStatus.stats.totalTime.toFixed(1)}s`);
			console.log(`   🎵 Ticks: ${engineStatus.stats.tickCount} | Measures: ${engineStatus.stats.measureCount}`);
			console.log(`   📊 Average drift: ${engineStatus.stats.avgDrift.toFixed(2)}ms`);
		}
		console.log();
	}


	/**
	 * Starts a timeline of the specified type using the timeline manager.
	 * If the metronome is currently playing, it will prevent starting the timeline and log a warning message.
	 *
	 * @param {string} timelineType The type of timeline to start, as defined in the timeline manager's presets.
	 * @return {boolean} Returns true if the timeline starts successfully, otherwise false.
	 */
	startTimeline(timelineType) {

		if (this.isPlaying) {
			console.log("⚠️ Stop the metronome before starting timeline");
			return false;
		}

		this._timelineManager.loadPresetTimeline(timelineType);
		return this._timelineManager.startTimeline();
	}


	/**
	 * Stops the current timeline managed by the internal timeline manager and returns the result.
	 *
	 * @return {*} The result of the stop operation executed by the timeline manager.
	 */
	stopTimeline() {

		return this._timelineManager.stopTimeline();
	}


	/**
	 * Retrieves the current status of the timeline from the timeline manager.
	 *
	 * @return {any} The status of the timeline as provided by the timeline manager.
	 */
	getTimelineStatus() {

		this._timelineManager.getTimelineStatus();
	}


	/**
	 * Skips the current timeline section and moves to the next section as managed by the timeline manager.
	 *
	 * @return {boolean} Returns true if the operation was successful, otherwise false.
	 */
	skipTimelineSection() {

		return this._timelineManager.skipToNextSection();
	}


	/**
	 * Retrieves the available timeline types from the timeline manager.
	 *
	 * @return {Array<string>} An array of strings representing the available timeline types.
	 */
	getAvailableTimelineTypes() {

		return this._timelineManager.getAvailableTimelineTypes();
	}


	get isPlaying() {

		return this._metronomeEngine.isPlaying;
	}

	get bpm() {

		return this._configurationManager.bpm;
	}

	get division() {

		return this._configurationManager.division;
	}

	get volume() {

		return this._configurationManager.volume;
	}

	get accent() {

		return this._configurationManager.accent;
	}

	get currentPattern() {

		return this._configurationManager.currentPattern;
	}

	get audioEngine() {

		return this._audioEngine;
	}

	get isInitialized() {

		return this._isInitialized;
	}


	/**
	 * Sets up observers required for managing application state or behavior.
	 *
	 * This method establishes observers to monitor specific events or changes
	 * in external components like the tap tempo manager. Observed changes are
	 * used to update the internal state of the object or execute relevant actions.
	 *
	 * @return {void} This method does not return a value.
	 */
	_setupObservers() {

		// Tap tempo observer
		this._tapTempoManager.addObserver((bpm) => {
			this.setTempo(bpm);
		});
	}


	/**
	 * Sets up automatic synchronization of configuration changes with the MetronomeEngine.
	 *
	 * This method listens for events related to configuration changes, batch changes, and preset applications.
	 * It ensures that relevant subsystems are synced when these events occur.
	 * Additionally, it performs an initial synchronization of all subsystems.
	 *
	 * @return {void} This method does not return a value.
	 */
	_setupAutoSync() {

		// Configuration changes auto-sync to MetronomeEngine
		this._eventBus.on('configuration.configurationChanged', (change) => {
			this._handleConfigurationChange(change);
		});

		// Batch configuration changes
		this._eventBus.on('configuration.batchConfigurationChanged', () => {
			this._syncAllSubsystems();
		});

		// Preset applications
		this._eventBus.on('configuration.presetApplied', () => {
			this._syncAllSubsystems();
		});

		// Initial sync
		this._syncAllSubsystems();
	}


	/**
	 * Sets up event handlers for various system, metronome, and configuration events.
	 *
	 * This method listens for specific events emitted by the event bus, such as errors
	 * or configuration-related issues, and logs these events to the console or performs
	 * other operations as needed.
	 *
	 * @return {void} This method does not return a value.
	 */
	_setupEventHandlers() {

		// System events
		this._eventBus.on('system.error', (error) => {
			console.error(`🚨 System Error: ${error.error}`);
			Settings.log('System error:', error);
		});

		// MetronomeEngine events
		this._eventBus.on('metronome.error', (error) => {
			console.error(`🎵 Metronome Error: ${error}`);
		});

		// Configuration events
		this._eventBus.on('configuration.configurationError', (error) => {
			console.error(`⚙️ Configuration Error: ${error.error}`);
		});
	}


	/**
	 * Handles the configuration change for the metronome engine.
	 * Updates the internal state of the metronome based on the type of configuration change.
	 * If the change is marked as an undo action, it will be ignored.
	 *
	 * @param {Object} change - The change object containing details about the configuration change.
	 * @param {boolean} change.isUndo - Flag indicating whether the change is an undo operation.
	 * @param {string} change.type - The type of configuration change (e.g., 'bpm', 'division', 'accent', 'pattern').
	 * @param {*} change.newValue - The new value to apply based on the type of change.
	 *
	 * @return {void}
	 */
	_handleConfigurationChange(change) {

		if (change.isUndo) return;

		switch (change.type) {
			case 'bpm':
				this._metronomeEngine.setTempo(change.newValue);
				break;
			case 'division':
				this._metronomeEngine.setDivision(change.newValue);
				break;
			case 'accent':
				this._metronomeEngine.setAccent(change.newValue);
				break;
			case 'pattern':
				this._metronomeEngine.setPattern(change.newValue);
				break;
		}
	}


	/**
	 * Synchronizes all subsystems of the application based on the current configuration.
	 * Updates the metronome engine with tempo, division, accent, and pattern values.
	 * Updates the audio engine with the specified volume level.
	 *
	 * @return {void} Does not return a value.
	 */
	_syncAllSubsystems() {

		const config = this._configurationManager.getConfiguration();

		this._metronomeEngine.setTempo(config.bpm);
		this._metronomeEngine.setDivision(config.division);
		this._metronomeEngine.setAccent(config.accent);
		this._metronomeEngine.setPattern(config.pattern);

		this._audioEngine.setVolume(config.volume);
	}


	/**
	 * Executes a given callback function while ensuring playback is paused and resumed as necessary.
	 *
	 * @param {Function} callback - The function to execute while playback is paused.
	 * @return {*} Returns the result of the callback function.
	 */
	_withPlaybackPause(callback) {

		const wasPlaying = this.isPlaying;

		if (wasPlaying) {
			this.stop();
		}

		const result = callback();

		if (wasPlaying) {
			setTimeout(() => this.play(), 150);
		}

		return result;
	}


	/**
	 * Logs system information regarding audio engine settings and configuration summary, including audio method, latency, tempo, division, accents, and volume settings.
	 *
	 * @return {void} This method does not return a value.
	 */
	_logSystemInfo() {

		const audioInfo = this._audioEngine.getAudioInfo();
		const config = this._configurationManager.getConfigurationSummary();

		console.log(`🔊 Audio: ${audioInfo.method} (latency: ${audioInfo.latency.toFixed(1)}ms)`);
		console.log(`🎼 Tempo: ${config.bpm} BPM (${config.tempoName})`);
		console.log(`📏 Division: ${config.divisionName}`);
		console.log(`🎯 Accents: ${config.accent ? 'Enabled' : 'Disabled'}`);
		console.log(`🔊 Volume: ${config.volume}%`);
	}


	/**
	 * Displays performance metrics of the metronome engine if statistics are available.
	 *
	 * This method logs information such as total time, number of ticks played, number of complete measures, accuracy, average drift, and the audio method used.
	 *
	 * @return {void} This method does not return a value but outputs performance metrics to the console.
	 */
	_showPerformanceStats() {

		const engineStatus = this._metronomeEngine.getStatus();
		const audioInfo = this._audioEngine.getAudioInfo();

		if (!engineStatus.stats) return;

		console.log(`\n⏹️ Metronome stopped`);
		console.log(`📊 Performance:`);
		console.log(`   ⏱️ Total time: ${engineStatus.stats.totalTime.toFixed(2)}s`);
		console.log(`   🎵 Ticks played: ${engineStatus.stats.tickCount}`);
		console.log(`   📏 Complete measures: ${engineStatus.stats.measureCount}`);
		console.log(`   🎯 Accuracy: ${engineStatus.stats.accuracy.toFixed(2)}%`);
		console.log(`   📈 Average drift: ${engineStatus.stats.avgDrift.toFixed(2)}ms`);
		console.log(`   🔊 Audio method: ${audioInfo.method}`);
		console.log();
	}
}

export default SystemCoordinator;