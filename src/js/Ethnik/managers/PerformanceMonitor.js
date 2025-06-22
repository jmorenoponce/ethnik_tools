import { performance } from 'perf_hooks';
import Settings from '../core/Settings.js';


/**
 * Manages performance metrics and drift analysis for the metronome.
 * Implements circular buffer pattern for efficient memory management.
 */
class PerformanceMonitor {

	/**
	 * Constructs a new PerformanceMonitor instance.
	 *
	 * @return {void} No return value.
	 */
	constructor() {

		this._startTime = 0;
		this._tickCount = 0;
		this._measureCount = 0;
		this._driftHistory = [];
		this._avgDrift = 0;
		this._maxHistorySize = Settings.defaultParams.maxHistorySize;
		this._isMonitoring = false;
	}


	/**
	 * Starts performance monitoring.
	 *
	 * @return {void} No return value.
	 */
	start() {

		this._startTime = performance.now();
		this._tickCount = 0;
		this._measureCount = 0;
		this._driftHistory = [];
		this._avgDrift = 0;
		this._isMonitoring = true;
	}


	/**
	 * Stops performance monitoring.
	 *
	 * @return {void} No return value.
	 */
	stop() {

		this._isMonitoring = false;
	}


	/**
	 * Records a tick and updates performance metrics.
	 *
	 * @param {number} expectedInterval - The expected interval between ticks in milliseconds.
	 * @param {boolean} isDownbeat - Whether this tick is a downbeat.
	 * @return {void} No return value.
	 */
	recordTick(expectedInterval, isDownbeat = false) {

		if (!this._isMonitoring) return;

		this._tickCount++;

		if (isDownbeat) {
			this._measureCount++;
		}

		this._updateDriftMetrics(expectedInterval);
	}


	/**
	 * Updates drift metrics by calculating the difference between expected and actual timing.
	 *
	 * @param {number} expectedInterval - The expected interval between ticks in milliseconds.
	 * @return {void} No return value.
	 */
	_updateDriftMetrics(expectedInterval) {

		const expectedTime = this._startTime + (this._tickCount * expectedInterval);
		const actualTime = performance.now();
		const drift = actualTime - expectedTime;

		// Use circular buffer pattern for memory efficiency
		this._driftHistory.push(drift);

		if (this._driftHistory.length > this._maxHistorySize) {
			this._driftHistory.shift();
		}

		// Calculate average drift
		this._avgDrift = this._driftHistory.reduce((sum, d) => sum + d, 0) / this._driftHistory.length;
	}


	/**
	 * Checks if the current drift exceeds acceptable thresholds.
	 *
	 * @return {Object} An object containing drift warning information.
	 */
	getDriftWarning() {

		if (!this._isMonitoring || this._driftHistory.length === 0) {
			return { hasWarning: false };
		}

		const currentDrift = this._driftHistory[this._driftHistory.length - 1];
		const threshold = 10; // ms

		return {
			hasWarning: Math.abs(currentDrift) > threshold,
			drift: currentDrift,
			severity: Math.abs(currentDrift) > 20 ? 'high' : 'medium'
		};
	}


	/**
	 * Gets current performance statistics.
	 *
	 * @param {number} bpm - Current BPM for accuracy calculations.
	 * @param {number} division - Current division for accuracy calculations.
	 * @return {Object} Performance statistics object.
	 */
	getStats(bpm, division) {

		if (!this._isMonitoring) {
			return null;
		}

		const totalTime = (performance.now() - this._startTime) / 1000;
		const expectedTicks = Math.floor(totalTime * (bpm / 60) * division);
		const accuracy = expectedTicks > 0 ? ((this._tickCount / expectedTicks) * 100) : 100;

		return {
			totalTime: totalTime,
			tickCount: this._tickCount,
			measureCount: this._measureCount,
			accuracy: accuracy,
			avgDrift: this._avgDrift,
			currentDrift: this._driftHistory.length > 0 ? this._driftHistory[this._driftHistory.length - 1] : 0
		};
	}


	/**
	 * Clears all performance data and resets counters.
	 *
	 * @return {void} No return value.
	 */
	reset() {

		this._startTime = 0;
		this._tickCount = 0;
		this._measureCount = 0;
		this._driftHistory = [];
		this._avgDrift = 0;
		this._isMonitoring = false;
	}


	/**
	 * Gets memory usage information for the performance monitor.
	 *
	 * @return {Object} Memory usage statistics.
	 */
	getMemoryUsage() {

		return {
			driftHistorySize: this._driftHistory.length,
			maxHistorySize: this._maxHistorySize,
			memoryUsagePercentage: (this._driftHistory.length / this._maxHistorySize) * 100
		};
	}
}

export default PerformanceMonitor;