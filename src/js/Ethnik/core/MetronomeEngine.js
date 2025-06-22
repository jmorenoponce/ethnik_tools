import { performance } from 'perf_hooks';
import Settings from './Settings.js';

/**
 * MetronomeEngine - Responsible solely for timing, scheduling, and playback.
 * Extracted from Core.js to follow Single Responsibility Principle.
 */
class MetronomeEngine {

	/**
	 * Creates a MetronomeEngine instance.
	 *
	 * @param {AudioEngine} audioEngine - Audio engine for sound playback.
	 * @param {PerformanceMonitor} performanceMonitor - Performance monitoring.
	 * @param {Object} eventBus - Event bus for notifications (optional).
	 */
	constructor(audioEngine, performanceMonitor, eventBus = null) {

		// Dependencies (injected)
		this._audioEngine = audioEngine;
		this._performanceMonitor = performanceMonitor;
		this._eventBus = eventBus;

		// Playback state
		this._isPlaying = false;

		// Timing configuration
		this._bpm = Settings.defaultParams.bpmInitial;
		this._division = Settings.defaultParams.division;
		this._accent = true;
		this._currentPattern = 'straight';

		// Advanced timing system
		this._nextTickTime = 0;
		this._lookahead = Settings.defaultParams.lookahead;
		this._intervalID = null;

		// Performance optimization
		this._cachedInterval = null;
		this._lastConfigChange = 0;
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

		if (this._isPlaying) {
			this._emit('warning', 'Metronome is already running');
			return false;
		}

		try {
			this._isPlaying = true;
			this._nextTickTime = performance.now();
			this._performanceMonitor.start();

			this._emit('playbackStarted', {
				bpm: this._bpm,
				division: this._division,
				pattern: this._currentPattern
			});

			this._startScheduler();
			return true;

		} catch (error) {
			this._isPlaying = false;
			this._emit('error', `Failed to start playback: ${error.message}`);
			return false;
		}
	}

	/**
	 * Stops metronome playback.
	 *
	 * @return {boolean} True if playback stopped successfully.
	 */
	stop() {

		if (!this._isPlaying) {
			this._emit('warning', 'Metronome is not running');
			return false;
		}

		this._isPlaying = false;

		if (this._intervalID) {
			clearInterval(this._intervalID);
			this._intervalID = null;
		}

		this._performanceMonitor.stop();

		const stats = this._performanceMonitor.getStats(this._bpm, this._division);
		this._emit('playbackStopped', stats);

		return true;
	}

	/**
	 * Pauses playback temporarily.
	 *
	 * @return {boolean} True if paused successfully.
	 */
	pause() {

		if (!this._isPlaying) return false;

		if (this._intervalID) {
			clearInterval(this._intervalID);
			this._intervalID = null;
		}

		this._emit('playbackPaused');
		return true;
	}

	/**
	 * Resumes paused playback.
	 *
	 * @return {boolean} True if resumed successfully.
	 */
	resume() {

		if (!this._isPlaying) return false;
		if (this._intervalID) return false; // Already running

		this._nextTickTime = performance.now();
		this._startScheduler();
		this._emit('playbackResumed');
		return true;
	}

	// =====================================================
	// PUBLIC API - Configuration
	// =====================================================

	/**
	 * Sets the tempo (BPM).
	 *
	 * @param {number} bpm - New tempo value.
	 * @return {boolean} True if tempo was set successfully.
	 */
	setTempo(bpm) {

		if (!Settings.isValidBpm(bpm)) {
			this._emit('error', `Invalid BPM: ${bpm}. Range: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`);
			return false;
		}

		const oldBpm = this._bpm;
		this._bpm = bpm;
		this._invalidateCache();

		this._emit('configurationChanged', {
			type: 'bpm',
			oldValue: oldBpm,
			newValue: bpm
		});

		return true;
	}

	/**
	 * Sets the beat division.
	 *
	 * @param {number} division - New division value.
	 * @return {boolean} True if division was set successfully.
	 */
	setDivision(division) {

		if (!Settings.isValidDivision(division)) {
			this._emit('error', `Invalid division: ${division}. Range: 1-16`);
			return false;
		}

		const oldDivision = this._division;
		this._division = division;
		this._invalidateCache();

		this._emit('configurationChanged', {
			type: 'division',
			oldValue: oldDivision,
			newValue: division
		});

		return true;
	}

	/**
	 * Sets accent state.
	 *
	 * @param {boolean} enabled - Whether accents are enabled.
	 * @return {boolean} True always (can't fail).
	 */
	setAccent(enabled) {

		const oldAccent = this._accent;
		this._accent = enabled;

		this._emit('configurationChanged', {
			type: 'accent',
			oldValue: oldAccent,
			newValue: enabled
		});

		return true;
	}

	/**
	 * Sets rhythmic pattern.
	 *
	 * @param {string} pattern - Pattern name.
	 * @return {boolean} True if pattern was set successfully.
	 */
	setPattern(pattern) {

		const validPatterns = ['straight', 'swing', 'custom'];

		if (!validPatterns.includes(pattern)) {
			this._emit('error', `Invalid pattern: ${pattern}. Valid: ${validPatterns.join(', ')}`);
			return false;
		}

		const oldPattern = this._currentPattern;
		this._currentPattern = pattern;
		this._invalidateCache();

		this._emit('configurationChanged', {
			type: 'pattern',
			oldValue: oldPattern,
			newValue: pattern
		});

		return true;
	}

	// =====================================================
	// PUBLIC API - Getters
	// =====================================================

	get isPlaying() { return this._isPlaying; }
	get bpm() { return this._bpm; }
	get division() { return this._division; }
	get accent() { return this._accent; }
	get currentPattern() { return this._currentPattern; }

	/**
	 * Gets current engine status.
	 *
	 * @return {Object} Status information.
	 */
	getStatus() {

		const stats = this._isPlaying ?
			this._performanceMonitor.getStats(this._bpm, this._division) : null;

		return {
			isPlaying: this._isPlaying,
			bpm: this._bpm,
			division: this._division,
			accent: this._accent,
			pattern: this._currentPattern,
			stats: stats
		};
	}

	// =====================================================
	// PRIVATE METHODS - Scheduling System
	// =====================================================

	/**
	 * Starts the tick scheduler.
	 *
	 * @return {void}
	 */
	_startScheduler() {

		this._intervalID = setInterval(() => {
			try {
				this._scheduler();
			} catch (error) {
				this._emit('error', `Scheduler error: ${error.message}`);
				this.stop();
			}
		}, this._lookahead);
	}

	/**
	 * Main scheduler that manages future ticks.
	 *
	 * @return {void}
	 */
	_scheduler() {

		const currentTime = performance.now();

		while (this._nextTickTime < currentTime + this._lookahead) {
			this._scheduleTick(this._nextTickTime);
			this._nextTickTime += this._calculateInterval();
		}
	}

	/**
	 * Schedules a single tick.
	 *
	 * @param {number} time - Target time for the tick.
	 * @return {void}
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
	 * Plays a single tick with sound and visual feedback.
	 *
	 * @return {Promise<void>}
	 */
	async _playTick() {

		try {
			const tickInfo = this._calculateTickInfo();

			// Play sound
			await this._audioEngine.playTick(tickInfo.type, tickInfo.frequency, tickInfo.duration);

			// Visual feedback
			this._renderTick(tickInfo.isDownbeat, tickInfo.isStrongBeat, tickInfo.tickCount);

			// Record performance metrics
			this._performanceMonitor.recordTick(this._calculateInterval(), tickInfo.isDownbeat);

			// Emit tick event
			this._emit('tick', tickInfo);

			// Check for drift warnings
			const driftWarning = this._performanceMonitor.getDriftWarning();
			if (driftWarning.hasWarning) {
				this._emit('driftWarning', driftWarning);
				process.stdout.write(` ⚠️(${driftWarning.drift.toFixed(1)}ms) `);
			}

		} catch (error) {
			this._emit('error', `Error playing tick: ${error.message}`);
			Settings.log("Error playing tick:", error);
		}
	}

	/**
	 * Calculates tick information for current beat.
	 *
	 * @return {Object} Tick information.
	 */
	_calculateTickInfo() {

		const stats = this._performanceMonitor.getStats(this._bpm, this._division);
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
			beatInMeasure,
			tickCount
		};
	}

	/**
	 * Calculates interval between ticks based on current configuration.
	 *
	 * @return {number} Interval in milliseconds.
	 */
	_calculateInterval() {

		// Use cached value if configuration hasn't changed
		if (this._cachedInterval &&
			(performance.now() - this._lastConfigChange) < 1000) {
			return this._cachedInterval;
		}

		const baseInterval = (60000 / this._bpm);
		let interval = baseInterval / this._division;

		if (this._currentPattern === 'swing') {
			// Implement swing: Alternate between long and short intervals
			const stats = this._performanceMonitor.getStats(this._bpm, this._division);
			const tickCount = stats ? stats.tickCount : 0;
			const isEvenTick = tickCount % 2 === 0;
			interval *= isEvenTick ? 1.33 : 0.67; // 2:1 swing ratio
		}

		this._cachedInterval = interval;
		return interval;
	}

	// =====================================================
	// PRIVATE METHODS - Visual Feedback
	// =====================================================

	/**
	 * Renders visual feedback for the current tick.
	 *
	 * @param {boolean} isDownbeat - Whether this tick is a downbeat.
	 * @param {boolean} isStrongBeat - Whether this tick is a strong beat.
	 * @param {number} tickCount - Current tick count.
	 * @return {void} No return value.
	 */
	_renderTick(isDownbeat, isStrongBeat, tickCount) {

		if (isDownbeat) {
			process.stdout.write('\n🔴 '); // Downbeat
		} else if (isStrongBeat) {
			process.stdout.write('🔵 '); // Strong beat
		} else {
			process.stdout.write('⚪ '); // Subdivision
		}

		// Display counter every 16 ticks
		if (tickCount % 16 === 0) {
			process.stdout.write(` [${tickCount}]`);
		}

		// New line every 4 measures for downbeats
		const measureCount = Math.floor(tickCount / (4 * this._division));
		if (measureCount > 0 && measureCount % 4 === 0 && isDownbeat) {
			process.stdout.write(`\n--- Measure ${measureCount} ---`);
		}
	}

	// =====================================================
	// PRIVATE METHODS - Utilities
	// =====================================================

	/**
	 * Invalidates cached calculations when configuration changes.
	 *
	 * @return {void}
	 */
	_invalidateCache() {

		this._cachedInterval = null;
		this._lastConfigChange = performance.now();
	}

	/**
	 * Emits events through the event bus if available.
	 *
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 * @return {void}
	 */
	_emit(event, data) {

		if (this._eventBus && typeof this._eventBus.emit === 'function') {
			this._eventBus.emit(`metronome.${event}`, data);
		}
	}

	// =====================================================
	// PUBLIC METHODS - Lifecycle
	// =====================================================

	/**
	 * Cleanup method for proper disposal.
	 *
	 * @return {void}
	 */
	destroy() {

		if (this._isPlaying) {
			this.stop();
		}

		this._audioEngine = null;
		this._performanceMonitor = null;
		this._eventBus = null;
		this._cachedInterval = null;
	}
}

export default MetronomeEngine;