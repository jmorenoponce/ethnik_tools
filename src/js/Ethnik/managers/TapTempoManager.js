import {performance} from 'perf_hooks';
import Settings from '../core/Settings.js';


/**
 * Manages the detection and calculation of tempo (BPM) based on user tap input.
 */
class TapTempoManager {

	/**
	 * Creates a new instance of the class, initializing properties related to tap timing, debounce settings, and observer management.
	 *
	 * @return {void} Does not return a value.
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
	 * Registers a tap action, tracks the time intervals between taps, and calculates the beats per minute (BPM) if enough valid taps are detected.
	 * Debounces taps that occur too close together and maintains a history of recent tap times up to a specified maximum.
	 * Notifies observers if a valid BPM is calculated.
	 *
	 * @return {Object} An object representing the result of the tap action:
	 * - `success` (boolean): Indicates whether the operation was successful.
	 * - `bpm` (number, optional): The calculated beats per minute, present if `success` is true.
	 * - `reason` (string, optional): The reason for failure, present if `success` is false. Possible values include:
	 *    - `'debounce'`: Too little time has passed since the last tap.
	 *    - `'insufficient_taps'`: Not enough taps have been registered to calculate BPM.
	 * - `tapCount` (number): The number of taps registered so far.
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
	 * Calculates the beats per minute (BPM) based on recorded tap times.
	 * The method computes time intervals between consecutive taps, filters outliers
	 * to ensure accuracy, and uses the average interval to determine the BPM.
	 * If fewer than two tap times are recorded, the method returns 0.
	 *
	 * @return {number} The calculated BPM value. Returns 0 if there are insufficient tap times.
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
	 * Calculates the median of a given array of numbers.
	 *
	 * @param {number[]} values - An array of numbers for which the median is to be calculated.
	 * @return {number} The median value of the input array.
	 */
	_calculateMedian(values) {

		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);

		return sorted.length % 2 === 0
			? (sorted[mid - 1] + sorted[mid]) / 2
			: sorted[mid];
	}


	/**
	 * Schedules a cleanup operation by setting a timer. If a previous cleanup timer exists, it is cleared
	 * before scheduling a new one. The cleanup operation will invoke the `_cleanupOldTaps` method after the
	 * specified timeout duration.
	 *
	 * @return {void} Does not return a value.
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
	 * Cleans up old tap timestamps from the `_tapTimes` array that exceed the specified timeout duration.
	 * This method ensures that only recent taps within the timeout window are retained.
	 *
	 * If no taps remain after cleanup, the associated cleanup timer is cleared.
	 *
	 * @return {void} Does not return any value.
	 */
	_cleanupOldTaps() {

		const now = performance.now();
		this._tapTimes = this._tapTimes.filter(time => now - time < this._timeoutMs);

		if (this._tapTimes.length === 0) {
			this._clearCleanupTimer();
		}
	}


	/**
	 * Clears the cleanup timer if it is set and resets it to null.
	 *
	 * The method checks if a cleanup timer exists, and if so, it clears the timeout and nullifies the timer reference.
	 *
	 * @return {void} Does not return any value.
	 */
	_clearCleanupTimer() {

		if (this._cleanupTimer) {
			clearTimeout(this._cleanupTimer);
			this._cleanupTimer = null;
		}
	}


	/**
	 * Registers a callback function as an observer to be notified of updates or changes.
	 *
	 * @param {Function} callback - The function to be called when an update occurs.
	 * @return {void} Does not return any value.
	 */
	addObserver(callback) {

		this._observers.add(callback);
	}


	/**
	 * Removes the specified callback function from the list of observers.
	 *
	 * @param {Function} callback - The function to be removed from the observers.
	 * @return {void} This method does not return any value.
	 */
	removeObserver(callback) {

		this._observers.delete(callback);
	}


	/**
	 * Notifies all registered observers by invoking each callback function with the provided BPM value.
	 *
	 * @param {number} bpm - The beats per minute (BPM) value to be passed to each observer callback.
	 * @return {void} This method does not return any value.
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
	 * Resets the internal state by clearing the array of tap times,
	 * resetting the last tap time to zero, and clearing any active cleanup timers.
	 *
	 * @return {void} This method does not return a value.
	 */
	reset() {

		this._tapTimes = [];
		this._lastTapTime = 0;
		this._clearCleanupTimer();
	}


	/**
	 * Retrieves the current status of the tap tracking system.
	 *
	 * @return {Object} An object containing the following status properties:
	 * - tapCount: The number of recorded taps.
	 * - lastTapTime: The time of the most recent tap.
	 * - hasActiveTaps: A boolean indicating if there are any recorded taps.
	 * - canCalculateBpm: A boolean indicating if BPM (beats per minute) can be calculated (requires at least 2 taps).
	 * - currentBpm: The calculated BPM if at least 2 taps are recorded, otherwise null.
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
	 * Performs cleanup operations by clearing timers, removing observers, and resetting internal state.
	 *
	 * @return {void} Does not return a value.
	 */
	destroy() {

		this._clearCleanupTimer();
		this._observers.clear();
		this._tapTimes = [];
	}
}

export default TapTempoManager;