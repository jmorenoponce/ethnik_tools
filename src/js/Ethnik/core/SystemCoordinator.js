import {performance} from 'perf_hooks';
import Settings from "./Settings.js";
import ConsoleManager from "../interface/ConsoleManager.js";
import TimelineManager from "../timeline/TimelineManager.js";
import PerformanceMonitor from "../managers/PerformanceMonitor.js";
import TapTempoManager from "../managers/TapTempoManager.js";
import PresetFactory from "../factories/PresetFactory.js";
import {AudioEngine} from "../audio/AudioEngine.js";
import MetronomeEngine from "./MetronomeEngine.js";
import ConfigurationManager from "./ConfigurationManager.js";
import EventBus from "./EventBus.js";

/**
 * SystemCoordinator - Central coordinator responsible for managing all subsystems,
 * their interactions, and the overall application lifecycle.
 * Extracted from Core.js to implement true Facade pattern.
 */
class SystemCoordinator {

	/**
	 * Creates a SystemCoordinator instance.
	 *
	 * @param {Object} dependencies - Dependency injection object (optional).
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

	// =====================================================
	// PUBLIC API - System Lifecycle
	// =====================================================

	/**
	 * Initializes the entire system.
	 *
	 * @return {Promise<boolean>} True if initialization was successful.
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
	 * Shuts down the system gracefully.
	 *
	 * @return {Promise<void>} Resolves when shutdown is complete.
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

	// =====================================================
	// PUBLIC API - Playback Control
	// =====================================================

	/**
	 * Starts metronome playback.
	 *
	 * @return {Promise<boolean>} True if playback started successfully.
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
			this._eventBus.emit('system.error', { type: 'playback', error: error.message });
			return false;
		}
	}

	/**
	 * Stops metronome playback.
	 *
	 * @return {boolean} True if playback stopped successfully.
	 */
	stop() {

		const result = this._metronomeEngine.stop();

		if (result) {
			this._showPerformanceStats();
			this._eventBus.emit('system.playbackStopped');
		}

		return result;
	}

	// =====================================================
	// PUBLIC API - Configuration (Delegation)
	// =====================================================

	/**
	 * Sets the tempo with validation and coordination.
	 *
	 * @param {number|string} newTempo - New tempo value.
	 * @return {boolean} True if tempo was set successfully.
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
	 * Sets the division with validation and coordination.
	 *
	 * @param {number|string} division - New division value.
	 * @return {boolean} True if division was set successfully.
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
	 * Sets the accent state.
	 *
	 * @param {boolean} enabled - Whether accents are enabled.
	 * @return {boolean} True if accent was set successfully.
	 */
	setAccent(enabled) {

		const result = this._configurationManager.setAccent(enabled);
		console.log(`🎯 Accents: ${result.change.newValue ? 'Enabled' : 'Disabled'}`);
		return true;
	}

	/**
	 * Sets the rhythmic pattern.
	 *
	 * @param {string} pattern - Pattern name.
	 * @return {boolean} True if pattern was set successfully.
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
	 * Sets the volume level.
	 *
	 * @param {number} volume - Volume level (0-100).
	 * @return {boolean} True if volume was set successfully.
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

	// =====================================================
	// PUBLIC API - Preset Management
	// =====================================================

	/**
	 * Loads a preset configuration.
	 *
	 * @param {string} name - Preset name.
	 * @return {boolean} True if preset was loaded successfully.
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

	// =====================================================
	// PUBLIC API - Tap Tempo
	// =====================================================

	/**
	 * Handles tap tempo functionality.
	 *
	 * @return {void}
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

	// =====================================================
	// PUBLIC API - Status and Information
	// =====================================================

	/**
	 * Gets comprehensive system status.
	 *
	 * @return {void}
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

	// =====================================================
	// PUBLIC API - Timeline Management
	// =====================================================

	/**
	 * Starts a timeline session.
	 *
	 * @param {string} timelineType - Type of timeline to start.
	 * @return {boolean} True if timeline started successfully.
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
	 * Stops the current timeline session.
	 *
	 * @return {boolean} True if timeline stopped successfully.
	 */
	stopTimeline() {

		return this._timelineManager.stopTimeline();
	}

	/**
	 * Gets timeline status.
	 *
	 * @return {void}
	 */
	getTimelineStatus() {

		this._timelineManager.getTimelineStatus();
	}

	/**
	 * Skips to next timeline section.
	 *
	 * @return {boolean} True if skip was successful.
	 */
	skipTimelineSection() {

		return this._timelineManager.skipToNextSection();
	}

	/**
	 * Gets available timeline types.
	 *
	 * @return {Array<string>} Array of timeline types.
	 */
	getAvailableTimelineTypes() {

		return this._timelineManager.getAvailableTimelineTypes();
	}

	// =====================================================
	// PUBLIC API - Getters
	// =====================================================

	get isPlaying() { return this._metronomeEngine.isPlaying; }
	get bpm() { return this._configurationManager.bpm; }
	get division() { return this._configurationManager.division; }
	get volume() { return this._configurationManager.volume; }
	get accent() { return this._configurationManager.accent; }
	get currentPattern() { return this._configurationManager.currentPattern; }
	get audioEngine() { return this._audioEngine; }
	get isInitialized() { return this._isInitialized; }

	// =====================================================
	// PRIVATE METHODS - System Setup
	// =====================================================

	/**
	 * Sets up observers for subsystem communication.
	 *
	 * @return {void}
	 */
	_setupObservers() {

		// Tap tempo observer
		this._tapTempoManager.addObserver((bpm) => {
			this.setTempo(bpm);
		});
	}

	/**
	 * Sets up automatic synchronization between subsystems.
	 *
	 * @return {void}
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
	 * Sets up system-wide event handlers.
	 *
	 * @return {void}
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
	 * Handles individual configuration changes.
	 *
	 * @param {Object} change - Configuration change object.
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
	 * Synchronizes all subsystems with current configuration.
	 *
	 * @return {void}
	 */
	_syncAllSubsystems() {

		const config = this._configurationManager.getConfiguration();

		this._metronomeEngine.setTempo(config.bpm);
		this._metronomeEngine.setDivision(config.division);
		this._metronomeEngine.setAccent(config.accent);
		this._metronomeEngine.setPattern(config.pattern);

		this._audioEngine.setVolume(config.volume);
	}

	// =====================================================
	// PRIVATE METHODS - Utilities
	// =====================================================

	/**
	 * Executes a callback with playback paused if necessary.
	 *
	 * @param {Function} callback - Callback to execute.
	 * @return {*} Result of callback.
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
	 * Logs system information during initialization.
	 *
	 * @return {void}
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
	 * Shows performance statistics after playback stops.
	 *
	 * @return {void}
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