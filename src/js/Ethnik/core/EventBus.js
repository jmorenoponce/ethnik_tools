/**
 * EventBus - Centralized event system for loose coupling between components.
 * Implements Observer pattern with namespaced events and wildcard support.
 */
class EventBus {

	/**
	 * Creates an EventBus instance.
	 */
	constructor() {

		this._listeners = new Map();
		this._onceListeners = new Map();
		this._maxListeners = 50; // Memory protection
		this._debug = false;

		// Event history for debugging
		this._eventHistory = [];
		this._maxHistorySize = 100;
	}

	// =====================================================
	// PUBLIC API - Event Registration
	// =====================================================

	/**
	 * Registers a listener for an event.
	 *
	 * @param {string} event - Event name (supports wildcards like 'config.*').
	 * @param {Function} callback - Callback function.
	 * @param {Object} options - Options object.
	 * @return {Function} Unsubscribe function.
	 */
	on(event, callback, options = {}) {

		if (typeof callback !== 'function') {
			throw new Error('Callback must be a function');
		}

		if (!this._listeners.has(event)) {
			this._listeners.set(event, []);
		}

		const listeners = this._listeners.get(event);

		// Check listener limit
		if (listeners.length >= this._maxListeners) {
			console.warn(`EventBus: Maximum listeners (${this._maxListeners}) reached for event '${event}'`);
			return () => {}; // No-op unsubscribe
		}

		const listenerInfo = {
			callback,
			context: options.context || null,
			priority: options.priority || 0,
			once: false,
			id: this._generateListenerId()
		};

		listeners.push(listenerInfo);

		// Sort by priority (higher priority first)
		listeners.sort((a, b) => b.priority - a.priority);

		this._debugLog(`Listener registered for '${event}' (ID: ${listenerInfo.id})`);

		// Return unsubscribe function
		return () => this.off(event, callback);
	}

	/**
	 * Registers a one-time listener for an event.
	 *
	 * @param {string} event - Event name.
	 * @param {Function} callback - Callback function.
	 * @param {Object} options - Options object.
	 * @return {Function} Unsubscribe function.
	 */
	once(event, callback, options = {}) {

		const onceWrapper = (...args) => {
			this.off(event, onceWrapper);
			callback.apply(options.context || null, args);
		};

		return this.on(event, onceWrapper, options);
	}

	/**
	 * Removes a listener from an event.
	 *
	 * @param {string} event - Event name.
	 * @param {Function} callback - Callback function to remove.
	 * @return {boolean} True if listener was removed.
	 */
	off(event, callback) {

		if (!this._listeners.has(event)) {
			return false;
		}

		const listeners = this._listeners.get(event);
		const index = listeners.findIndex(listener => listener.callback === callback);

		if (index !== -1) {
			const removed = listeners.splice(index, 1)[0];
			this._debugLog(`Listener removed from '${event}' (ID: ${removed.id})`);

			// Clean up empty listener arrays
			if (listeners.length === 0) {
				this._listeners.delete(event);
			}

			return true;
		}

		return false;
	}

	/**
	 * Removes all listeners from an event or all events.
	 *
	 * @param {string} event - Event name (optional).
	 * @return {number} Number of listeners removed.
	 */
	removeAllListeners(event = null) {

		if (event) {
			const listeners = this._listeners.get(event);
			if (listeners) {
				const count = listeners.length;
				this._listeners.delete(event);
				this._debugLog(`All listeners removed from '${event}' (${count} listeners)`);
				return count;
			}
			return 0;
		} else {
			const totalCount = Array.from(this._listeners.values())
				.reduce((sum, listeners) => sum + listeners.length, 0);
			this._listeners.clear();
			this._onceListeners.clear();
			this._debugLog(`All listeners removed from all events (${totalCount} listeners)`);
			return totalCount;
		}
	}

	// =====================================================
	// PUBLIC API - Event Emission
	// =====================================================

	/**
	 * Emits an event to all registered listeners.
	 *
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 * @param {Object} options - Emission options.
	 * @return {Object} Emission result.
	 */
	emit(event, data = null, options = {}) {

		const emissionId = this._generateEmissionId();
		const timestamp = Date.now();

		this._addToHistory(event, data, timestamp, emissionId);
		this._debugLog(`Emitting '${event}' with data:`, data);

		let listenersNotified = 0;
		let errors = [];

		// Direct event listeners
		const directListeners = this._listeners.get(event) || [];
		const directResult = this._notifyListeners(directListeners, event, data, options);

		listenersNotified += directResult.count;
		errors.push(...directResult.errors);

		// Wildcard listeners (e.g., 'config.*' matches 'config.bpmChanged')
		const wildcardListeners = this._getWildcardListeners(event);
		const wildcardResult = this._notifyListeners(wildcardListeners, event, data, options);

		listenersNotified += wildcardResult.count;
		errors.push(...wildcardResult.errors);

		// Global listeners ('*' matches everything)
		const globalListeners = this._listeners.get('*') || [];
		const globalResult = this._notifyListeners(globalListeners, event, data, options);

		listenersNotified += globalResult.count;
		errors.push(...globalResult.errors);

		const result = {
			event,
			listenersNotified,
			errors,
			timestamp,
			emissionId,
			success: errors.length === 0
		};

		this._debugLog(`Event '${event}' processed: ${listenersNotified} listeners notified, ${errors.length} errors`);

		return result;
	}

	/**
	 * Emits an event asynchronously.
	 *
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 * @param {Object} options - Emission options.
	 * @return {Promise<Object>} Emission result.
	 */
	async emitAsync(event, data = null, options = {}) {

		return new Promise((resolve) => {
			setTimeout(() => {
				const result = this.emit(event, data, options);
				resolve(result);
			}, 0);
		});
	}

	// =====================================================
	// PUBLIC API - Namespaced Events
	// =====================================================

	/**
	 * Creates a namespaced event emitter.
	 *
	 * @param {string} namespace - Namespace prefix.
	 * @return {Object} Namespaced emitter.
	 */
	namespace(namespace) {

		return {
			emit: (event, data, options) => {
				return this.emit(`${namespace}.${event}`, data, options);
			},

			on: (event, callback, options) => {
				return this.on(`${namespace}.${event}`, callback, options);
			},

			once: (event, callback, options) => {
				return this.once(`${namespace}.${event}`, callback, options);
			},

			off: (event, callback) => {
				return this.off(`${namespace}.${event}`, callback);
			},

			removeAllListeners: (event) => {
				if (event) {
					return this.removeAllListeners(`${namespace}.${event}`);
				} else {
					// Remove all listeners in this namespace
					let totalRemoved = 0;
					for (const eventName of this._listeners.keys()) {
						if (eventName.startsWith(`${namespace}.`)) {
							totalRemoved += this.removeAllListeners(eventName);
						}
					}
					return totalRemoved;
				}
			}
		};
	}

	// =====================================================
	// PUBLIC API - Utilities
	// =====================================================

	/**
	 * Gets statistics about the event bus.
	 *
	 * @return {Object} Statistics object.
	 */
	getStats() {

		const events = Array.from(this._listeners.keys());
		const totalListeners = Array.from(this._listeners.values())
			.reduce((sum, listeners) => sum + listeners.length, 0);

		const eventStats = {};
		for (const [event, listeners] of this._listeners) {
			eventStats[event] = listeners.length;
		}

		return {
			totalEvents: events.length,
			totalListeners,
			eventStats,
			historySize: this._eventHistory.length,
			maxListeners: this._maxListeners,
			debug: this._debug
		};
	}

	/**
	 * Gets recent event history.
	 *
	 * @param {number} limit - Maximum number of events to return.
	 * @return {Array} Array of recent events.
	 */
	getHistory(limit = 10) {

		return this._eventHistory.slice(-limit);
	}

	/**
	 * Enables or disables debug logging.
	 *
	 * @param {boolean} enabled - Whether debug logging is enabled.
	 * @return {void}
	 */
	setDebug(enabled) {

		this._debug = enabled;
		this._debugLog(`Debug logging ${enabled ? 'enabled' : 'disabled'}`);
	}

	/**
	 * Waits for a specific event to be emitted.
	 *
	 * @param {string} event - Event name.
	 * @param {number} timeout - Timeout in milliseconds.
	 * @return {Promise<*>} Promise that resolves with event data.
	 */
	waitFor(event, timeout = 5000) {

		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				this.off(event, listener);
				reject(new Error(`Timeout waiting for event '${event}'`));
			}, timeout);

			const listener = (data) => {
				clearTimeout(timeoutId);
				resolve(data);
			};

			this.once(event, listener);
		});
	}

	// =====================================================
	// PRIVATE METHODS
	// =====================================================

	/**
	 * Notifies a list of listeners about an event.
	 *
	 * @param {Array} listeners - Array of listener objects.
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 * @param {Object} options - Emission options.
	 * @return {Object} Notification result.
	 */
	_notifyListeners(listeners, event, data, options) {

		let count = 0;
		let errors = [];

		for (const listener of listeners) {
			try {
				if (options.async) {
					// Asynchronous notification
					setTimeout(() => {
						listener.callback.call(listener.context, data, event);
					}, 0);
				} else {
					// Synchronous notification
					listener.callback.call(listener.context, data, event);
				}
				count++;
			} catch (error) {
				errors.push({
					listenerId: listener.id,
					error: error.message,
					stack: error.stack
				});

				if (!options.suppressErrors) {
					console.error(`EventBus: Error in listener for '${event}':`, error);
				}
			}
		}

		return { count, errors };
	}

	/**
	 * Gets listeners that match wildcard patterns.
	 *
	 * @param {string} event - Event name.
	 * @return {Array} Array of matching listeners.
	 */
	_getWildcardListeners(event) {

		const matchingListeners = [];

		for (const [pattern, listeners] of this._listeners) {
			if (pattern.includes('*') && this._matchesPattern(event, pattern)) {
				matchingListeners.push(...listeners);
			}
		}

		return matchingListeners;
	}

	/**
	 * Checks if an event name matches a wildcard pattern.
	 *
	 * @param {string} event - Event name.
	 * @param {string} pattern - Wildcard pattern.
	 * @return {boolean} True if event matches pattern.
	 */
	_matchesPattern(event, pattern) {

		if (pattern === '*') return true;

		// Convert wildcard pattern to regex
		const regexPattern = pattern
			.replace(/\./g, '\\.')
			.replace(/\*/g, '.*');

		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(event);
	}

	/**
	 * Adds an event to the history.
	 *
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 * @param {number} timestamp - Timestamp.
	 * @param {string} emissionId - Emission ID.
	 * @return {void}
	 */
	_addToHistory(event, data, timestamp, emissionId) {

		this._eventHistory.push({
			event,
			data,
			timestamp,
			emissionId
		});

		// Limit history size
		if (this._eventHistory.length > this._maxHistorySize) {
			this._eventHistory.shift();
		}
	}

	/**
	 * Generates a unique listener ID.
	 *
	 * @return {string} Unique listener ID.
	 */
	_generateListenerId() {

		return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Generates a unique emission ID.
	 *
	 * @return {string} Unique emission ID.
	 */
	_generateEmissionId() {

		return `emission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Logs debug messages if debug mode is enabled.
	 *
	 * @param {string} message - Debug message.
	 * @param {...*} args - Additional arguments.
	 * @return {void}
	 */
	_debugLog(message, ...args) {

		if (this._debug) {
			console.log(`[EventBus] ${message}`, ...args);
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

		const stats = this.getStats();
		this._debugLog(`Destroying EventBus: ${stats.totalListeners} listeners, ${stats.totalEvents} events`);

		this.removeAllListeners();
		this._eventHistory = [];
	}
}

export default EventBus;