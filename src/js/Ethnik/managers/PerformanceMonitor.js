import {performance} from 'perf_hooks';
import Settings from '../core/Settings.js';


/**
 * A class to monitor and evaluate performance metrics related to ticks in a real-time system,
 * such as audio or visual synchronization applications.
 */
class PerformanceMonitor {

	/**
	 * Creates an instance of the class, initializing properties for monitoring and drift calculations.
	 * The constructor sets default values for internal state variables such as start time, tick count, measure count, drift history, average drift, maximum history size, and monitoring status.
	 *
	 * @return {Object} A new instance of the class with default property values.
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
	 * Starts the performance monitoring process. Initializes tracking variables such as
	 * start time, tick count, measure count, drift history, and average drift.
	 * Also marks the monitoring state as active.
	 *
	 * @return {void} Does not return any value.
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
	 * Stops the monitoring process and updates the internal state to indicate that monitoring is no longer active.
	 *
	 * @return {void} No return value.
	 */
	stop() {

		this._isMonitoring = false;
	}


	/**
	 * Records a tick event, increments tick and measure counters, and updates drift metrics.
	 *
	 * @param {number} expectedInterval - The expected interval between ticks in milliseconds.
	 * @param {boolean} [isDownbeat=false] - Indicates if the current tick is a downbeat. Defaults to false.
	 * @return {void} This method does not return a value.
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
	 * Updates the drift metrics by calculating the difference between the expected time
	 * for the next interval and the actual time, then storing and averaging the drift data.
	 *
	 * @param {number} expectedInterval - The expected interval between consecutive ticks.
	 * @return {void}
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
	 * Analyzes the drift history and determines if there is a warning based on the current drift value relative to a threshold.
	 * The warning includes information about the severity of the drift if applicable.
	 *
	 * @return {Object} An object containing the drift warning status:
	 * - `hasWarning` (boolean): Whether the drift exceeds the defined threshold.
	 * - `drift` (number): The current drift value if applicable, undefined otherwise.
	 * - `severity` (string): The severity of the drift ('high', 'medium') if there is a warning, undefined otherwise.
	 */
	getDriftWarning() {

		if (!this._isMonitoring || this._driftHistory.length === 0) {
			return {hasWarning: false};
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
	 * Calculates and returns statistics related to monitoring, including timing, accuracy, and drift values.
	 *
	 * @param {number} bpm The beats per minute (tempo) to calculate the statistics.
	 * @param {number} division The number of subdivisions per beat.
	 * @return {Object|null} An object containing monitoring statistics if monitoring is active, or null if monitoring is not active. The returned object includes the following properties:
	 * - totalTime: The total monitoring time in seconds.
	 * - tickCount: The total number of ticks recorded.
	 * - measureCount: The total number of measures recorded.
	 * - accuracy: A percentage indicating how accurate the ticks are compared to the expected ticks.
	 * - avgDrift: The average drift over the monitoring period.
	 * - currentDrift: The most recent drift value.
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
	 * Resets all internal state variables of the object to their initial values.
	 *
	 * @return {void} This method does not return a value.
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
	 * Calculates and retrieves the current memory usage information.
	 *
	 * @return {Object} An object containing memory usage details:
	 *   - driftHistorySize: The current number of items in drift history.
	 *   - maxHistorySize: The maximum allowed size of the history.
	 *   - memoryUsagePercentage: The percentage of memory usage based on drift history size and maximum history size.
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