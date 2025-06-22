import {performance} from 'perf_hooks';
import Settings from "./Settings.js";
import ConsoleManager from "../interface/ConsoleManager.js";
import TimelineManager from "../timeline/TimelineManager.js";
import PerformanceMonitor from "../managers/PerformanceMonitor.js";
import TapTempoManager from "../managers/TapTempoManager.js";
import PresetFactory from "../factories/PresetFactory.js";
import {AudioEngine} from "../audio/AudioEngine.js";

/**
 * The Core class represents the main functionality of an advanced metronome.
 * It handles metronome playback, timing, presets, and rhythm patterns, integrating
 * audio engine capabilities to provide a professional metronome experience.
 * Implements Facade pattern to coordinate all subsystems and Singleton pattern.
 */
class Core {

	static _instance = null;

	/**
	 * Gets the singleton instance of Core.
	 *
	 * @return {Core} The Core singleton instance.
	 */
	static getInstance() {

		if (!Core._instance) {
			Core._instance = new Core();
		}
		return Core._instance;
	}


	/**
	 * Constructs a new instance of the Core class and initializes its properties and systems.
	 *
	 * @return {void} No return value.
	 */
	constructor() {

		// Enforce singleton
		if (Core._instance) {
			throw new Error('Core is a singleton. Use Core.getInstance()');
		}

		// Initialize subsystems
		this._audioEngine = new AudioEngine();
		this._performanceMonitor = new PerformanceMonitor();
		this._tapTempoManager = new TapTempoManager();
		this._timelineManager = new TimelineManager(this);
		this._console = new ConsoleManager(this);

		// Playback state
		this._isPlaying = false;
		this._bpm = Settings.defaultParams.bpmInitial;
		this._division = Settings.defaultParams.division;
		this._volume = Settings.defaultParams.volume;
		this._accent = true;

		// Advanced timing system
		this._nextTickTime = 0;
		this._lookahead = Settings.defaultParams.lookahead;
		this._intervalID = null;

		// Rhythmic patterns
		this._currentPattern = 'straight';
		this._customPattern = [];

		// Presets using Factory pattern
		this._presetFactory = new PresetFactory();

		// Cached values for performance
		this._cachedStats = null;
		this._statsUpdateInterval = 100; // ms
		this._lastStatsUpdate = 0;

		// Setup observers
		this._setupObservers();

		this._initialize();
	}


	// Public getters for encapsulation
	get isPlaying() {

		return this._isPlaying;
	}


	get bpm() {

		return this._bpm;
	}


	get division() {

		return this._division;
	}

	get volume() {

		return this._volume;
	}


	get accent() {

		return this._accent;
	}


	get currentPattern() {

		return this._currentPattern;
	}


	get audioEngine() {

		return this._audioEngine;
	}


	/**
	 * Sets up observer patterns for subsystem communication.
	 *
	 * @return {void} No return value.
	 */
	_setupObservers() {

		// Tap tempo observer
		this._tapTempoManager.addObserver((bpm) => {
			this.setTempo(bpm);
		});
	}


	/**
	 * Initializes the system by clearing the console, displaying application details, and logging relevant information.
	 *
	 * @return {Promise<void>} Resolves when the initialization process is complete.
	 */
	async _initialize() {

		try {
			console.clear();
			console.log("🎵 Ethnik Tools - Professional Metronome v2.0");
			console.log("=".repeat(55));

			// Wait for audio to initialize
			await new Promise(resolve => setTimeout(resolve, 100));

			this._logSystemInfo();
			console.log("=".repeat(55));
			console.log();
		} catch (error) {
			console.error("Failed to initialize Core:", error);
			Settings.log("Initialization error:", error);
		}
	}


	/**
	 * Public method for re-initialization (used by ClearCommand)
	 *
	 * @return {Promise<void>} Resolves when initialization is complete.
	 */
	async initialize() {

		return this._initialize();
	}


	/**
	 * Logs current system information to the console.
	 *
	 * @return {void} No return value.
	 */
	_logSystemInfo() {

		const audioInfo = this._audioEngine.getAudioInfo();
		console.log(`🔊 Audio: ${audioInfo.method} (latency: ${audioInfo.latency.toFixed(1)}ms)`);
		console.log(`🎼 Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
		console.log(`📏 Division: ${Settings.getDivisionName(this._division)}`);
		console.log(`🎯 Accents: ${this._accent ? 'Enabled' : 'Disabled'}`);
		console.log(`🔊 Volume: ${this._volume}%`);
	}


	/**
	 * Helper method to pause playback, execute callback, and resume if needed.
	 *
	 * @param {Function} callback - Function to execute while paused.
	 * @return {*} Returns the result of the callback.
	 */
	_withPlaybackPause(callback) {

		const wasPlaying = this._isPlaying;

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
	 * Starts the metronome playback if it's not already running.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if playback starts successfully.
	 */
	async play() {

		try {
			if (this._timelineManager.isTimelineMode) {
				console.log("⚠️ Timeline active. Use 'timeline stop' first");
				return false;
			}

			if (this._isPlaying) {
				console.log("⚠️ Metronome is already running");
				return false;
			}

			this._isPlaying = true;
			this._nextTickTime = performance.now();

			this._performanceMonitor.start();

			console.log(`▶️ Starting: ${this._bpm} BPM - ${Settings.getDivisionName(this._division)}`);
			console.log(`🎯 Pattern: ${this._currentPattern} | Accents: ${this._accent ? 'Yes' : 'No'}`);
			console.log("Press 'stop' to stop\n");

			this._startScheduler();
			return true;
		} catch (error) {
			console.error("Failed to start playback:", error);
			this._isPlaying = false;
			return false;
		}
	}


	/**
	 * Stops the metronome if it is currently running.
	 *
	 * @return {boolean} Returns true if the metronome was successfully stopped.
	 */
	stop() {

		if (!this._isPlaying) {
			console.log("⚠️ Metronome is not running");
			return false;
		}

		this._isPlaying = false;

		if (this._intervalID) {
			clearInterval(this._intervalID);
			this._intervalID = null;
		}

		this._performanceMonitor.stop();
		this._showPerformanceStats();

		// Clear cached stats
		this._cachedStats = null;

		return true;
	}


	/**
	 * Displays performance statistics of the metronome.
	 *
	 * @return {void} No return value.
	 */
	_showPerformanceStats() {

		const stats = this._performanceMonitor.getStats(this._bpm, this._division);
		const audioInfo = this._audioEngine.getAudioInfo();

		console.log(`\n⏹️ Metronome stopped`);
		console.log(`📊 Performance:`);
		console.log(`   ⏱️ Total time: ${stats.totalTime.toFixed(2)}s`);
		console.log(`   🎵 Ticks played: ${stats.tickCount}`);
		console.log(`   📏 Complete measures: ${stats.measureCount}`);
		console.log(`   🎯 Accuracy: ${stats.accuracy.toFixed(2)}%`);
		console.log(`   📈 Average drift: ${stats.avgDrift.toFixed(2)}ms`);
		console.log(`   🔊 Audio method: ${audioInfo.method}`);
		console.log();
	}


	/**
	 * Sets the tempo for the current playback with validation.
	 *
	 * @param {number|string} newTempo - The new tempo (BPM) to be set.
	 * @return {boolean} Returns true if the tempo was successfully updated.
	 */
	setTempo(newTempo) {

		const tempo = parseInt(newTempo);

		if (!Settings.isValidBpm(tempo)) {
			console.log(`❌ Invalid BPM. Range: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`);
			return false;
		}

		return this._withPlaybackPause(() => {
			this._bpm = tempo;
			console.log(`🎼 Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
			return true;
		});
	}


	/**
	 * Sets the division value with validation.
	 *
	 * @param {number|string} division - The division value to set.
	 * @return {boolean} Returns true if the division is successfully set.
	 */
	setDivision(division) {

		const div = parseInt(division);

		if (!Settings.isValidDivision(div)) {
			console.log("❌ Invalid division. Range: 1-16");
			return false;
		}

		return this._withPlaybackPause(() => {
			this._division = div;
			console.log(`📏 Division: ${Settings.getDivisionName(this._division)}`);
			return true;
		});
	}


	/**
	 * Sets the accent state.
	 *
	 * @param {boolean} enabled - Whether accents are enabled.
	 * @return {boolean} Returns true to indicate success.
	 */
	setAccent(enabled) {

		this._accent = enabled;
		console.log(`🎯 Accents: ${this._accent ? 'Enabled' : 'Disabled'}`);
		return true;
	}


	/**
	 * Sets the rhythmic pattern.
	 *
	 * @param {string} pattern - The pattern to be set.
	 * @return {boolean} Returns true if the pattern is valid and successfully set.
	 */
	setPattern(pattern) {

		const validPatterns = ['straight', 'swing', 'custom'];

		if (!validPatterns.includes(pattern)) {
			console.log(`❌ Invalid pattern. Options: ${validPatterns.join(', ')}`);
			return false;
		}

		this._currentPattern = pattern;
		console.log(`🎵 Rhythmic pattern: ${pattern}`);
		return true;
	}


	/**
	 * Sets the volume level with validation.
	 *
	 * @param {number} volume - The volume level to set (0-100).
	 * @return {boolean} Returns true if the volume was successfully set.
	 */
	setVolume(volume) {

		if (!Settings.isValidVolume(volume)) {
			console.log("❌ Invalid volume. Range: 0-100");
			return false;
		}

		this._volume = volume;
		this._audioEngine.setVolume(volume);
		console.log(`🔊 Volume: ${this._volume}%`);
		return true;
	}


	/**
	 * Loads a preset by its name using the factory pattern.
	 *
	 * @param {string} name - The name of the preset to load.
	 * @return {boolean} Returns true if the preset was successfully loaded.
	 */
	loadPreset(name) {

		const preset = this._presetFactory.createPreset(name);

		if (!preset) {
			console.log(`❌ Preset '${name}' not found`);
			console.log(`💡 Available presets: ${this._presetFactory.getAvailablePresets().join(', ')}`);
			return false;
		}

		return this._withPlaybackPause(() => {
			this._applyPreset(preset);

			console.log(`📁 Preset '${name}' loaded:`);
			console.log(`   🎼 Tempo: ${this._bpm} BPM`);
			console.log(`   📏 Division: ${Settings.getDivisionName(this._division)}`);
			console.log(`   🎯 Accents: ${this._accent ? 'Yes' : 'No'}`);

			return true;
		});
	}


	/**
	 * Applies a preset configuration to the metronome.
	 *
	 * @param {Object} preset - Preset configuration object.
	 * @return {void} No return value.
	 */
	_applyPreset(preset) {

		// Validate preset before applying
		if (!Settings.validatePreset(preset)) {
			console.error("Invalid preset configuration");
			return;
		}

		this._bpm = preset.bpm;
		this._division = preset.division;
		this._accent = preset.accent;
	}


	/**
	 * Handles tap tempo functionality using the dedicated manager.
	 *
	 * @return {void} No return value.
	 */
	tapTempo() {

		const result = this._tapTempoManager.tap();

		if (result.success) {
			console.log(`🥁 Tap tempo detected: ${result.bpm} BPM (${result.tapCount} taps)`);
		} else {
			if (result.reason === 'insufficient_taps') {
				console.log(`🥁 Tap ${result.tapCount}/2+ (keep tapping...)`);
			} else if (result.reason === 'debounce') {
				// Silently ignore debounced taps
			}
		}
	}


	/**
	 * Logs the current status of the system.
	 *
	 * @return {void} No return value.
	 */
	getStatus() {

		const audioInfo = this._audioEngine.getAudioInfo();
		const performanceStats = this._performanceMonitor.getStats(this._bpm, this._division);

		console.log("\n📋 System Status:");
		console.log(`   🎵 State: ${this._isPlaying ? '▶️ Playing' : '⏹️ Stopped'}`);
		console.log(`   🎼 Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
		console.log(`   📏 Division: ${Settings.getDivisionName(this._division)}`);
		console.log(`   🎯 Accents: ${this._accent ? 'Enabled' : 'Disabled'}`);
		console.log(`   🎵 Pattern: ${this._currentPattern}`);
		console.log(`   🔊 Volume: ${this._volume}%`);
		console.log(`   🔧 Audio: ${audioInfo.method} (${audioInfo.latency.toFixed(1)}ms latency)`);

		if (this._isPlaying && performanceStats) {
			console.log(`   ⏱️ Running: ${performanceStats.totalTime.toFixed(1)}s`);
			console.log(`   🎵 Ticks: ${performanceStats.tickCount} | Measures: ${performanceStats.measureCount}`);
			console.log(`   📊 Average drift: ${performanceStats.avgDrift.toFixed(2)}ms`);
		}
		console.log();
	}


	/**
	 * Gets current performance stats with caching.
	 *
	 * @return {Object|null} Cached or fresh performance stats.
	 */
	_getCachedStats() {

		const now = performance.now();

		if (!this._cachedStats || (now - this._lastStatsUpdate) > this._statsUpdateInterval) {
			this._cachedStats = this._performanceMonitor.getStats(this._bpm, this._division);
			this._lastStatsUpdate = now;
		}

		return this._cachedStats;
	}


	/**
	 * Starts the scheduler which runs at regular intervals.
	 *
	 * @return {void} No return value.
	 */
	_startScheduler() {

		this._intervalID = setInterval(() => {
			try {
				this._scheduler();
			} catch (error) {
				console.error("Scheduler error:", error);
				Settings.log("Scheduler error:", error);
				this.stop();
			}
		}, this._lookahead);
	}


	/**
	 * Manages and schedules future ticks based on lookahead timing.
	 *
	 * @return {void} No return value.
	 */
	_scheduler() {

		const currentTime = performance.now();

		while (this._nextTickTime < currentTime + this._lookahead) {
			this._scheduleTick(this._nextTickTime);
			this._nextTickTime += this._calculateInterval();
		}
	}


	/**
	 * Schedules a single tick at the specified time.
	 *
	 * @param {number} time - The target time in milliseconds to schedule the tick.
	 * @return {void} No return value.
	 */
	_scheduleTick(time) {

		const delay = Math.max(0, time - performance.now());

		setTimeout(() => {
			if (this._isPlaying) {
				this._playTick();
			}
		}, delay);
	}


	/**
	 * Plays a single tick with appropriate sound and visual feedback.
	 *
	 * @return {Promise<void>} A promise that resolves once the tick has been played.
	 */
	async _playTick() {

		try {
			const tickInfo = this._calculateTickInfo();

			// Play sound
			await this._audioEngine.playTick(tickInfo.type, tickInfo.frequency, tickInfo.duration);

			// Visual feedback
			this._renderTick(tickInfo.isDownbeat, tickInfo.isStrongBeat);

			// Update performance metrics
			this._performanceMonitor.recordTick(this._calculateInterval(), tickInfo.isDownbeat);

			// Check for drift warnings
			const driftWarning = this._performanceMonitor.getDriftWarning();
			if (driftWarning.hasWarning) {
				process.stdout.write(` ⚠️(${driftWarning.drift.toFixed(1)}ms) `);
			}
		} catch (error) {
			Settings.log("Error playing tick:", error);
		}
	}


	/**
	 * Calculates tick information for the current beat.
	 *
	 * @return {Object} Object containing tick type, frequency, duration, and beat information.
	 */
	_calculateTickInfo() {

		const stats = this._getCachedStats();
		const tickCount = stats ? stats.tickCount + 1 : 1;
		const beatInMeasure = ((tickCount - 1) % (4 * this._division)) + 1;
		const isDownbeat = beatInMeasure === 1;
		const isStrongBeat = beatInMeasure % this._division === 1;

		let type = 'subdivision';
		let frequency = 600;
		let duration = 80;

		if (isDownbeat && this._accent) {
			type = 'downbeat';
			frequency = 1000;
			duration = 120;
		} else if (isStrongBeat && this._accent) {
			type = 'beat';
			frequency = 800;
			duration = 100;
		}

		return {
			type,
			frequency,
			duration,
			isDownbeat,
			isStrongBeat,
			beatInMeasure
		};
	}


	/**
	 * Renders visual feedback for the current tick.
	 *
	 * @param {boolean} isDownbeat - Whether this tick is a downbeat.
	 * @param {boolean} isStrongBeat - Whether this tick is a strong beat.
	 * @return {void} No return value.
	 */
	_renderTick(isDownbeat, isStrongBeat) {

		if (isDownbeat) {
			process.stdout.write('\n🔴 '); // Downbeat
		} else if (isStrongBeat) {
			process.stdout.write('🔵 '); // Strong beat
		} else {
			process.stdout.write('⚪ '); // Subdivision
		}

		const stats = this._getCachedStats();
		if (stats) {
			// Display counter every 16 ticks
			if (stats.tickCount % 16 === 0) {
				process.stdout.write(` [${stats.tickCount}]`);
			}

			// New line every 4 measures
			if (stats.measureCount > 0 && stats.measureCount % 4 === 0 && isDownbeat) {
				process.stdout.write(`\n--- Measure ${stats.measureCount} ---`);
			}
		}
	}


	/**
	 * Calculates the time interval for the current tick based on BPM, division, and pattern.
	 *
	 * @return {number} The calculated interval in milliseconds.
	 */
	_calculateInterval() {

		const baseInterval = (60000 / this._bpm);
		let interval = baseInterval / this._division;

		if (this._currentPattern === 'swing') {
			// Implement swing: Alternate between long and short intervals
			const stats = this._getCachedStats();
			const tickCount = stats ? stats.tickCount : 0;
			const isEvenTick = tickCount % 2 === 0;
			interval *= isEvenTick ? 1.33 : 0.67; // 2:1 swing ratio
		}

		return interval;
	}


	/**
	 * Starts a timeline of the specified type.
	 *
	 * @param {string} timelineType - The type of timeline to start.
	 * @return {boolean} Returns the result of the timeline start operation.
	 */
	startTimeline(timelineType) {

		if (this._isPlaying) {
			console.log("⚠️ Stop the metronome before starting timeline");
			return false;
		}

		this._timelineManager.loadPresetTimeline(timelineType);
		return this._timelineManager.startTimeline();
	}


	/**
	 * Stops the currently active timeline.
	 *
	 * @return {boolean} Returns true if the timeline was successfully stopped.
	 */
	stopTimeline() {

		return this._timelineManager.stopTimeline();
	}


	/**
	 * Gets the current timeline status.
	 *
	 * @return {void} No return value.
	 */
	getTimelineStatus() {

		this._timelineManager.getTimelineStatus();
	}


	/**
	 * Skips to the next timeline section.
	 *
	 * @return {boolean} Returns the result of the skip operation.
	 */
	skipTimelineSection() {

		return this._timelineManager.skipToNextSection();
	}


	/**
	 * Gets available timeline types.
	 *
	 * @return {Array<string>} Array of available timeline types.
	 */
	getAvailableTimelineTypes() {

		return this._timelineManager.getAvailableTimelineTypes();
	}


	/**
	 * Cleanup method to be called when shutting down.
	 *
	 * @return {void} No return value.
	 */
	destroy() {

		try {
			if (this._isPlaying) {
				this.stop();
			}

			this._tapTempoManager.destroy();
			this._timelineManager.destroy();
			this._performanceMonitor.reset();
			this._console.destroy();

			// Clear singleton instance
			Core._instance = null;
		} catch (error) {
			console.error("Error during Core cleanup:", error);
		}
	}
}

export {Core};