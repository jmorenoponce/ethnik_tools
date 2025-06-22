import { performance } from 'perf_hooks';
import Settings from '../core/Settings.js';


/**
 * Manages tap tempo functionality with intelligent averaging and timeout handling.
 * Implements Observer pattern for tempo change notifications.
 */
class TapTempoManager {

	/**
	 * Constructs a new TapTempoManager instance.
	 *
	 * @return {void} No return value.
	 */
	constructor() {

		this._tapTimes = [];
		this._maxTaps = 8;
		this._debounceTime = Settings.defaultParams.debounceTime;
		this._timeoutMs = Settings.defaultParams.tapTimeoutMs;
		this._lastTapTime = 0;
		this._observers = new Set();
		this._cleanupTimer = null;
	}


	/**
	 * Registers a tap and calculates BPM if enough taps are available.
	 *
	 * @return {Object} Result object containing success status, BPM, and tap count.
	 */
	tap() {

		const now = performance.now();

		// Debounce: ignore taps that are too close together
		if (now - this._lastTapTime < this._debounceTime) {
			return {
				success: false,
				reason: 'debounce',
				tapCount: this._tapTimes.length
			};
		}

		this._lastTapTime = now;
		this._tapTimes.push(now);

		// Keep only the last maxTaps
		if (this._tapTimes.length > this._maxTaps) {
			this._tapTimes.shift();
		}

		this._scheduleCleanup();

		// Calculate BPM if we have enough taps
		if (this._tapTimes.length >= 2) {
			const bpm = this._calculateBpm();

			if (Settings.isValidBpm(bpm)) {
				this._notifyObservers(bpm);
				return {
					success: true,
					bpm: bpm,
					tapCount: this._tapTimes.length
				};
			}
		}

		return {
			success: false,
			reason: 'insufficient_taps',
			tapCount: this._tapTimes.length
		};
	}


	/**
	 * Calculates BPM from the current tap times using intelligent averaging.
	 *
	 * @return {number} The calculated BPM value.
	 */
	_calculateBpm() {

		if (this._tapTimes.length < 2) {
			return 0;
		}

		const intervals = [];
		for (let i = 1; i < this._tapTimes.length; i++) {
			intervals.push(this._tapTimes[i] - this._tapTimes[i - 1]);
		}

		// Remove outliers (intervals that are more than 50% different from median)
		const median = this._calculateMedian(intervals);
		const filteredIntervals = intervals.filter(interval => {
			return Math.abs(interval - median) / median <= 0.5;
		});

		// Use filtered intervals if we have enough, otherwise use all
		const activeIntervals = filteredIntervals.length >= 2 ? filteredIntervals : intervals;

		const avgInterval = activeIntervals.reduce((sum, interval) => sum + interval, 0) / activeIntervals.length;

		return Math.round(60000 / avgInterval);
	}


	/**
	 * Calculates the median value of an array.
	 *
	 * @param {Array<number>} values - Array of numbers to find median of.
	 * @return {number} The median value.
	 */
	_calculateMedian(values) {

		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);

		return sorted.length % 2 === 0
			? (sorted[mid - 1] + sorted[mid]) / 2
			: sorted[mid];
	}


	/**
	 * Schedules cleanup of old tap times.
	 *
	 * @return {void} No return value.
	 */
	_scheduleCleanup() {

		if (this._cleanupTimer) {
			clearTimeout(this._cleanupTimer);
		}

		this._cleanupTimer = setTimeout(() => {
			this._cleanupOldTaps();
		}, this._timeoutMs);
	}


	/**
	 * Removes tap times that are older than the timeout period.
	 *
	 * @return {void} No return value.
	 */
	_cleanupOldTaps() {

		const now = performance.now();
		this._tapTimes = this._tapTimes.filter(time => now - time < this._timeoutMs);

		if (this._tapTimes.length === 0) {
			this._clearCleanupTimer();
		}
	}


	/**
	 * Clears the cleanup timer.
	 *
	 * @return {void} No return value.
	 */
	_clearCleanupTimer() {

		if (this._cleanupTimer) {
			clearTimeout(this._cleanupTimer);
			this._cleanupTimer = null;
		}
	}


	/**
	 * Adds an observer to be notified of tempo changes.
	 *
	 * @param {Function} callback - Function to call when tempo changes.
	 * @return {void} No return value.
	 */
	addObserver(callback) {

		this._observers.add(callback);
	}


	/**
	 * Removes an observer from tempo change notifications.
	 *
	 * @param {Function} callback - Function to remove from observers.
	 * @return {void} No return value.
	 */
	removeObserver(callback) {

		this._observers.delete(callback);
	}


	/**
	 * Notifies all observers of a tempo change.
	 *
	 * @param {number} bpm - The new BPM value.
	 * @return {void} No return value.
	 */
	_notifyObservers(bpm) {

		this._observers.forEach(callback => {
			try {
				callback(bpm);
			} catch (error) {
				console.error('Error in tap tempo observer:', error);
			}
		});
	}


	/**
	 * Resets all tap data.
	 *
	 * @return {void} No return value.
	 */
	reset() {

		this._tapTimes = [];
		this._lastTapTime = 0;
		this._clearCleanupTimer();
	}


	/**
	 * Gets current tap tempo status.
	 *
	 * @return {Object} Status information about tap tempo.
	 */
	getStatus() {

		return {
			tapCount: this._tapTimes.length,
			lastTapTime: this._lastTapTime,
			hasActiveTaps: this._tapTimes.length > 0,
			canCalculateBpm: this._tapTimes.length >= 2,
			currentBpm: this._tapTimes.length >= 2 ? this._calculateBpm() : null
		};
	}


	/**
	 * Cleanup method to be called when the manager is no longer needed.
	 *
	 * @return {void} No return value.
	 */
	destroy() {

		this._clearCleanupTimer();
		this._observers.clear();
		this._tapTimes = [];
	}
}

export default TapTempoManager;