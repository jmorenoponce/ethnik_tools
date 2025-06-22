import {performance} from 'perf_hooks';
import Settings from './Settings.js';

/**
 * MetronomeEngine is responsible for handling the logic of a metronome, including playback control, configuration settings, and timing functionality.
 * It integrates with an audio engine and a performance monitor to support precise and configurable playback features.
 */
class MetronomeEngine {

	/**
	 * Constructs a new instance of the class, initializing it with the required dependencies and configurations.
	 *
	 * @param {Object} audioEngine - The audio engine responsible for handling audio playback.
	 * @param {Object} performanceMonitor - The performance monitor to track and monitor the system's performance.
	 * @param {Object|null} [eventBus=null] - An optional event bus for managing and emitting events.
	 *
	 * @return {void}
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


	/**
	 * Starts the metronome playback if it is not already running.
	 * Emits appropriate events for playback start or errors encountered during the process.
	 *
	 * @return {Promise<boolean>} A promise that resolves to `true` if playback started successfully,
	 * or `false` if playback is already running or an error occurred.
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
	 * Stops the metronome if it is currently running. Emits events indicating
	 * the status of the playback and provides performance statistics upon stopping.
	 *
	 * @return {boolean} Returns true if the metronome was successfully stopped,
	 *                   otherwise false if it was not running.
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
	 * Pauses the current playback if it is active. Clears any active interval associated with playback
	 * and emits a `playbackPaused` event if the operation is successful.
	 *
	 * @return {boolean} Returns `true` if playback was paused successfully, or `false` if playback was not active.
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
	 * Resumes playback if it is currently paused and not already running.
	 * Updates the scheduler and emits a playback resumed event.
	 *
	 * @return {boolean} Returns true if playback successfully resumed, otherwise false.
	 */
	resume() {

		if (!this._isPlaying) return false;
		if (this._intervalID) return false; // Already running

		this._nextTickTime = performance.now();
		this._startScheduler();
		this._emit('playbackResumed');
		return true;
	}


	/**
	 * Sets the tempo of the application by updating the Beats Per Minute (BPM) value.
	 *
	 * @param {number} bpm - The desired BPM value to set. Must be within the valid range defined by Settings.
	 * @return {boolean} Returns true if the BPM is successfully set, or false if the provided BPM is invalid.
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
	 * Sets the division value for the current configuration.
	 * Validates the given division before updating the division property.
	 * Emits relevant events if the configuration is updated successfully or an error occurs.
	 *
	 * @param {number} division The new division value to be set. Must be within the valid range.
	 * @return {boolean} Returns true if the division is set successfully; otherwise, returns false if the division is invalid.
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
	 * Sets the accent status for the configuration.
	 *
	 * @param {boolean} enabled - A boolean indicating whether the accent is enabled or not.
	 * @return {boolean} Returns true to indicate the accent was successfully updated.
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
	 * Updates the current pattern to the specified value, if it is valid.
	 * Valid patterns are 'straight', 'swing', and 'custom'.
	 * Emits events for errors or configuration changes as necessary.
	 *
	 * @param {string} pattern - The new pattern to set. Must be one of the valid patterns: 'straight', 'swing', 'custom'.
	 * @return {boolean} Returns true if the pattern was successfully updated, otherwise false.
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


	get isPlaying() {

		return this._isPlaying;
	}

	get bpm() {

		return this._bpm;
	}

	get division() {

		return this._division;
	}

	get accent() {

		return this._accent;
	}

	get currentPattern() {

		return this._currentPattern;
	}


	/**
	 * Retrieves the current status of the playback and performance monitoring.
	 * This includes information about whether the playback is active, the beats per minute (BPM),
	 * the division settings, accents, the current pattern, and performance statistics if playing.
	 *
	 * @return {Object} An object containing the following properties:
	 * - isPlaying: {boolean} Indicates whether playback is currently active.
	 * - bpm: {number} The current beats per minute setting.
	 * - division: {number} The division of beats being used.
	 * - accent: {boolean} Indicates whether the accent feature is enabled.
	 * - pattern: {Array|Object} The currently active pattern.
	 * - stats: {Object|null} The performance statistics if playback is active, or null otherwise.
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


	/**
	 * Starts the scheduler which repeatedly executes the `_scheduler` method
	 * at intervals defined by the `_lookahead` property. If an error occurs
	 * during the scheduler execution, it emits an 'error' event and stops
	 * the scheduler.
	 *
	 * @return {void} Does not return a value.
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
	 * Internal method that manages the scheduling of tasks based on the current time
	 * and a predefined lookahead window. It continuously schedules tasks until the
	 * next tick time exceeds the current time plus the lookahead.
	 *
	 * @return {void} This method does not return any value.
	 */
	_scheduler() {

		const currentTime = performance.now();

		while (this._nextTickTime < currentTime + this._lookahead) {
			this._scheduleTick(this._nextTickTime);
			this._nextTickTime += this._calculateInterval();
		}
	}


	/**
	 * Schedules a tick to occur after a specified delay based on the provided time.
	 * The delay is calculated relative to the current performance time.
	 *
	 * @param {number} time The target time in milliseconds at which the tick should be executed.
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
	 * Executes the playback of a single tick in the metronome, including sound playback, visual feedback,
	 * performance monitoring, and event emission. It also handles drift warnings and errors during execution.
	 *
	 * @return {Promise<void>} A promise that resolves when the tick execution is complete and all associated processes
	 * (sound playback, rendering, monitoring, etc.) have finished.
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
	 * Calculates and returns the tick information for the current state of the beat or rhythm.
	 * This includes properties like type of beat (downbeat, beat, subdivision), frequency,
	 * duration, and whether the current tick is a downbeat or a strong beat.
	 *
	 * @return {Object} The calculated tick info containing:
	 * - type {string}: The type of beat (e.g., 'subdivision', 'downbeat', 'beat').
	 * - frequency {number}: The frequency of the tick sound in Hz.
	 * - duration {number}: The duration of the tick sound in milliseconds.
	 * - isDownbeat {boolean}: Whether the current tick is a downbeat.
	 * - isStrongBeat {boolean}: Whether the current tick is a strong beat.
	 * - beatInMeasure {number}: The current beat position in the measure.
	 * - tickCount {number}: The cumulative count of ticks.
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
	 * Calculates the interval between beats based on the current configuration.
	 * If the configuration has not changed recently, a cached value is used.
	 * The interval is calculated using the beats per minute (BPM) and a division factor.
	 * For "swing" patterns, the interval alternates between long and short durations to create a swing effect.
	 *
	 * @return {number} The calculated interval in milliseconds.
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


	/**
	 * Renders the visual representation of a musical tick based on its properties,
	 * such as being a downbeat, strong beat, or a subdivision, and displays specific
	 * counters or messages at intervals.
	 *
	 * @param {boolean} isDownbeat - Indicates if the current tick is a downbeat.
	 * @param {boolean} isStrongBeat - Indicates if the current tick is a strong beat.
	 * @param {number} tickCount - The current tick count.
	 * @return {void}
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


	/**
	 * Invalidates the cache by resetting the cached interval
	 * and recording the timestamp of the last configuration change.
	 *
	 * @return {void} This method does not return a value.
	 */
	_invalidateCache() {

		this._cachedInterval = null;
		this._lastConfigChange = performance.now();
	}


	/**
	 * Emits an event through the associated event bus with a prefixed event name.
	 *
	 * @param {string} event The name of the event to be emitted.
	 * @param {*} data The data to be passed along with the event.
	 * @return {void} No value is returned by this method.
	 */
	_emit(event, data) {

		if (this._eventBus && typeof this._eventBus.emit === 'function') {
			this._eventBus.emit(`metronome.${event}`, data);
		}
	}


	/**
	 * Cleans up and releases resources allocated by the instance.
	 * Stops any ongoing processes if necessary and resets related properties to null.
	 *
	 * @return {void} Does not return any value.
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