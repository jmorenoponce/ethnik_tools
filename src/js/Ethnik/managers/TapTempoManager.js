import {performance} from 'perf_hooks';
import Settings from '../core/Settings.js';


/**
 * Manages the detection and calculation of tempo (BPM) based on user tap input.
 * Enhanced version with centralized configuration and improved precision.
 */
class TapTempoManager {

	/**
	 * Creates a new instance of the class, initializing properties related to tap timing, debounce settings, and observer management.
	 * Now uses centralized tapTempoConstants configuration.
	 *
	 * @return {void} Does not return a value.
	 */
	constructor() {

		this._tapTimes = [];

		this._maxTaps = Settings.tapTempoConstants.maxTapHistory;
		this._debounceTime = Settings.defaultParams.debounceTime;
		this._timeoutMs = Settings.defaultParams.tapTimeoutMs;

		this._lastTapTime = 0;
		this._observers = new Set();
		this._cleanupTimer = null;

		this._config = Settings.tapTempoConstants;
	}


	/**
	 * Registers a tap action, tracks the time intervals between taps, and calculates the beats per minute (BPM) if enough valid taps are detected.
	 * Enhanced with centralized configuration and detailed response information.
	 *
	 * @return {Object} An object representing the result of the tap action with comprehensive information.
	 */
	tap() {

		const now = performance.now();

		if (now - this._lastTapTime < this._debounceTime) {
			return {
				success: false,
				reason: 'debounce',
				tapCount: this._tapTimes.length,
				debounceTime: this._debounceTime,
				timeRemaining: this._debounceTime - (now - this._lastTapTime)
			};
		}

		this._lastTapTime = now;
		this._tapTimes.push(now);

		if (this._tapTimes.length > this._maxTaps) {
			this._tapTimes.shift();
		}

		this._scheduleCleanup();

		const minTaps = this._config.minTapsForCalculation;

		if (this._tapTimes.length >= minTaps) {
			const bpm = this._calculateBpm();
			const confidence = this._calculateConfidence();

			// ✅ ENHANCED: Usar validación centralizada de BPM con rango específico para tap tempo
			if (this._isValidTapBpm(bpm)) {
				this._notifyObservers(bpm);
				return {
					success: true,
					bpm: bpm,
					tapCount: this._tapTimes.length,
					confidence: confidence,
					tempoName: Settings.getTempoName(bpm),
					consistency: this._calculateConsistency(),
					averageInterval: this._getAverageInterval(),
					filteredTaps: this._getFilteredTapCount()
				};
			} else {
				return {
					success: false,
					reason: 'invalid_bpm',
					calculatedBpm: bpm,
					tapCount: this._tapTimes.length,
					confidence: confidence,
					validRange: `${this._config.minValidBpm}-${this._config.maxValidBpm}`,
					systemRange: `${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`
				};
			}
		}

		return {
			success: false,
			reason: 'insufficient_taps',
			tapCount: this._tapTimes.length,
			requiredTaps: minTaps,
			progress: (this._tapTimes.length / minTaps) * 100
		};
	}


	/**
	 * Calculates the beats per minute (BPM) based on recorded tap times.
	 * Enhanced with configurable outlier detection and precision improvements.
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

		let activeIntervals = intervals;

		if (this._config.outlierDetection && intervals.length >= 3) {
			const median = this._calculateMedian(intervals);
			const filteredIntervals = intervals.filter(interval => {
				return Math.abs(interval - median) / median <= this._config.accuracyWindow;
			});

			// Use filtered intervals if we have enough, otherwise use all
			activeIntervals = filteredIntervals.length >= 2 ? filteredIntervals : intervals;
		}

		let avgInterval;
		if (this._config.useMedian && activeIntervals.length >= 3) {
			avgInterval = this._calculateMedian(activeIntervals);
		} else {
			avgInterval = activeIntervals.reduce((sum, interval) => sum + interval, 0) / activeIntervals.length;
		}

		return Math.round(60000 / avgInterval);
	}


	/**
	 * Calculates confidence level of the BPM calculation based on consistency of taps.
	 * Uses centralized configuration for confidence factors.
	 *
	 * @return {number} Confidence percentage (0-100)
	 */
	_calculateConfidence() {

		const factors = this._config.confidenceFactors;

		if (this._tapTimes.length < 2) {
			return Math.min(this._tapTimes.length * factors.tapWeight, factors.maxTapConfidence);
		}

		// Calculate consistency based on standard deviation
		const consistency = this._calculateConsistency();

		// Factor in number of taps (more taps = more confidence)
		const tapConfidence = Math.min(this._tapTimes.length * factors.tapWeight, factors.maxTapConfidence);

		// Combine consistency and tap count
		const finalConfidence = (consistency * factors.consistencyWeight + tapConfidence) / (factors.consistencyWeight + 1);

		return Math.round(Math.min(finalConfidence, 100));
	}


	/**
	 * Calculates consistency of taps based on standard deviation.
	 *
	 * @return {number} Consistency percentage (0-100)
	 */
	_calculateConsistency() {

		if (this._tapTimes.length < 3) {
			return this._tapTimes.length * 30; // 30% per tap for first taps
		}

		const intervals = [];
		for (let i = 1; i < this._tapTimes.length; i++) {
			intervals.push(this._tapTimes[i] - this._tapTimes[i - 1]);
		}

		// Calculate coefficient of variation (standard deviation / mean)
		const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
		const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
		const stdDev = Math.sqrt(variance);

		const coefficientOfVariation = stdDev / mean;

		// Convert to consistency percentage (lower CV = higher consistency)
		return Math.max(0, Math.round(100 - (coefficientOfVariation * 100)));
	}


	/**
	 * Gets the average interval between taps.
	 *
	 * @return {number} Average interval in milliseconds
	 */
	_getAverageInterval() {

		if (this._tapTimes.length < 2) return 0;

		const intervals = [];
		for (let i = 1; i < this._tapTimes.length; i++) {
			intervals.push(this._tapTimes[i] - this._tapTimes[i - 1]);
		}

		return Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length);
	}


	/**
	 * Gets the number of taps that passed the outlier filter.
	 *
	 * @return {number} Number of filtered taps
	 */
	_getFilteredTapCount() {

		if (this._tapTimes.length < 3 || !this._config.outlierDetection) {
			return this._tapTimes.length;
		}

		const intervals = [];
		for (let i = 1; i < this._tapTimes.length; i++) {
			intervals.push(this._tapTimes[i] - this._tapTimes[i - 1]);
		}

		const median = this._calculateMedian(intervals);
		const filteredIntervals = intervals.filter(interval => {
			return Math.abs(interval - median) / median <= this._config.accuracyWindow;
		});

		return filteredIntervals.length + 1; // +1 because intervals = taps - 1
	}


	/**
	 * Validates if BPM is within tap tempo specific range.
	 *
	 * @param {number} bpm - BPM to validate
	 * @return {boolean} True if valid for tap tempo
	 */
	_isValidTapBpm(bpm) {

		return !isNaN(bpm) &&
			bpm >= this._config.minValidBpm &&
			bpm <= this._config.maxValidBpm;
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
	 * Enhanced with additional metrics and configuration info.
	 *
	 * @return {Object} An object containing comprehensive status properties.
	 */
	getStatus() {

		const basicStatus = {
			tapCount: this._tapTimes.length,
			lastTapTime: this._lastTapTime,
			hasActiveTaps: this._tapTimes.length > 0,
			canCalculateBpm: this._tapTimes.length >= this._config.minTapsForCalculation,
			currentBpm: this._tapTimes.length >= this._config.minTapsForCalculation ? this._calculateBpm() : null
		};

		if (basicStatus.canCalculateBpm) {
			return {
				...basicStatus,
				confidence: this._calculateConfidence(),
				consistency: this._calculateConsistency(),
				tempoName: Settings.getTempoName(basicStatus.currentBpm),
				averageInterval: this._getAverageInterval(),
				filteredTaps: this._getFilteredTapCount(),
				outlierDetection: this._config.outlierDetection,
				maxTaps: this._maxTaps,
				validRange: `${this._config.minValidBpm}-${this._config.maxValidBpm}`
			};
		}

		return {
			...basicStatus,
			requiredTaps: this._config.minTapsForCalculation,
			progress: (this._tapTimes.length / this._config.minTapsForCalculation) * 100,
			maxTaps: this._maxTaps
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