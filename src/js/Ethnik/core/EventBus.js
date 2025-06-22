
/**
 * A comprehensive EventBus implementation for managing custom events with support for namespaces,
 * wildcard listeners, one-time listeners, and event priorities. The EventBus is designed to provide
 * flexibility and control over event-driven communication between different parts of an application.
 */
class EventBus {

	/**
	 * Constructs an instance of the class.
	 * Initializes the listeners collections, sets the maximum allowed listeners, and provides memory protection.
	 * Also prepares the internal structures for debugging, including event history tracking with a defined maximum history size.
	 * @return {Object} An instance of the class with initialized properties for event handling and debugging.
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


	/**
	 * Registers an event listener for the specified event. The listener can include additional options such as priority,
	 * and the method returns an unsubscribe function to remove the listener.
	 *
	 * @param {string} event - The name of the event to listen for.
	 * @param {Function} callback - The function to be executed when the event is triggered.
	 * @param {Object} [options={}] - Additional options for the listener.
	 * @param {Object} [options.context=null] - The context to bind the callback function to.
	 * @param {number} [options.priority=0] - The priority of the listener, higher values are called earlier.
	 * @return {Function} A function to unsubscribe the listener from the event.
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
			return () => {
			}; // No-op unsubscribe
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
	 * Registers a one-time listener for the specified event. The listener will be invoked only once and then automatically removed.
	 *
	 * @param {string} event - The name of the event to listen for.
	 * @param {Function} callback - The function to execute when the event is triggered.
	 * @param {Object} [options={}] - Optional settings for the listener such as `context`.
	 * @return {*} Returns the result of the registration process, typically for chaining or confirmation.
	 */
	once(event, callback, options = {}) {

		const onceWrapper = (...args) => {
			this.off(event, onceWrapper);
			callback.apply(options.context || null, args);
		};

		return this.on(event, onceWrapper, options);
	}


	/**
	 * Removes a previously registered event listener for the specified event.
	 *
	 * @param {string} event - The name of the event from which the listener should be removed.
	 * @param {Function} callback - The callback function of the listener to be removed.
	 * @return {boolean} Returns `true` if the listener was successfully removed; otherwise, `false`.
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
	 * Removes all listeners for a specific event or all events if no event is specified.
	 *
	 * @param {string|null} [event=null] The name of the event to remove listeners for. If null, removes all listeners for all events.
	 * @return {number} The number of listeners that were removed.
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


	/**
	 * Emits an event to all registered listeners, supporting specific, wildcard, and global event listeners.
	 *
	 * @param {string} event - The name of the event to emit.
	 * @param {*} [data=null] - The optional data payload associated with the event.
	 * @param {Object} [options={}] - Additional options used during event emission.
	 * @return {Object} Returns the result of the emission containing the following properties:
	 *                  - `event` {string}: The name of the event emitted.
	 *                  - `listenersNotified` {number}: The count of listeners that were notified.
	 *                  - `errors` {Array}: An array of errors encountered during listener notification.
	 *                  - `timestamp` {number}: The timestamp of when the event was emitted.
	 *                  - `emissionId` {string}: A unique identifier for the emitted event.
	 *                  - `success` {boolean}: Indicates whether the event emission completed without errors.
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
	 * Asynchronously emits an event with optional data and options.
	 * The method returns a promise that resolves after the event is emitted.
	 *
	 * @param {string} event - The name of the event to emit.
	 * @param {*} [data=null] - Optional data to pass along with the event.
	 * @param {Object} [options={}] - Additional options for the event emit operation.
	 * @return {Promise<*>} A promise that resolves with the result of the event emission.
	 */
	async emitAsync(event, data = null, options = {}) {

		return new Promise((resolve) => {
			setTimeout(() => {
				const result = this.emit(event, data, options);
				resolve(result);
			}, 0);
		});
	}


	/**
	 * Creates a scoped namespace for event-based operations such as emitting, listening, and removing event listeners.
	 *
	 * @param {string} namespace - The namespace identifier to prepend to all event names within the created scope.
	 * @return {object} An object with methods to emit, listen, and manage events within the given namespace.
	 *
	 * @property {Function} emit - Emits an event within the namespace.
	 * @param {string} event - The name of the event to emit (without the namespace prefix).
	 * @param {*} data - The data to send with the event.
	 * @param {object} [options] - Additional options for the emit operation.
	 * @return {boolean} Returns `true` if the event had listeners; otherwise, `false`.
	 *
	 * @property {Function} on - Adds an event listener for an event in the namespace.
	 * @param {string} event - The name of the event to listen for (without the namespace prefix).
	 * @param {Function} callback - The callback function to execute when the event is triggered.
	 * @param {object} [options] - Additional options for registering the listener.
	 * @return {void}
	 *
	 * @property {Function} once - Adds a one-time event listener for an event in the namespace.
	 * @param {string} event - The name of the event to listen for (without the namespace prefix).
	 * @param {Function} callback - The callback function to execute when the event is triggered.
	 * @param {object} [options] - Additional options for registering the listener.
	 * @return {void}
	 *
	 * @property {Function} off - Removes an event listener for an event in the namespace.
	 * @param {string} event - The name of the event to stop listening for (without the namespace prefix).
	 * @param {Function} callback - The callback function to remove.
	 * @return {void}
	 *
	 * @property {Function} removeAllListeners - Removes all event listeners for a specific event or all events in the namespace.
	 * @param {string} [event] - If provided, removes listeners for this specific event (without the namespace prefix). If not provided, removes all listeners within the namespace.
	 * @return {number} The total number of removed listeners.
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


	/**
	 * Retrieves statistics about the current state of the event listeners and history.
	 *
	 * @return {Object} An object containing statistics including total number of events, total listeners,
	 *                  a breakdown of listener count per event, the size of the event history,
	 *                  maximum number of allowed listeners, and the debug mode status.
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
	 * Retrieves a subset of the event history.
	 *
	 * @param {number} [limit=10] - The maximum number of most recent events to retrieve. Optional, defaults to 10.
	 * @return {Array} - An array containing the most recent events up to the specified limit.
	 */
	getHistory(limit = 10) {

		return this._eventHistory.slice(-limit);
	}


	/**
	 * Enables or disables debug logging for the application.
	 *
	 * @param {boolean} enabled - A boolean flag indicating whether debug logging should be enabled.
	 * @return {void} No return value.
	 */
	setDebug(enabled) {

		this._debug = enabled;
		this._debugLog(`Debug logging ${enabled ? 'enabled' : 'disabled'}`);
	}


	/**
	 * Waits for a specific event to occur within a given timeout period.
	 *
	 * @param {string} event - The name of the event to wait for.
	 * @param {number} [timeout=5000] - The maximum time to wait for the event in milliseconds. Defaults to 5000ms.
	 * @return {Promise<any>} A promise that resolves with the data emitted by the event, or rejects with an error if the timeout is reached before the event occurs.
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


	/**
	 * Notifies a set of listeners with the provided event and data.
	 *
	 * This method iterates through the list of listeners and invokes their callback functions
	 * to handle a specified event. Listeners can be notified either synchronously or asynchronously.
	 * Errors during notification can be logged or suppressed based on the provided options.
	 *
	 * @param {Array} listeners - An array of listener objects, each containing `id`, `callback`,
	 *                            and `context` properties.
	 * @param {string} event - Name of the event to be dispatched to all listeners.
	 * @param {*} data - Data to be provided to each listener's callback function during notification.
	 * @param {Object} options - Configuration options for notifications. May include:
	 *                           `async` (boolean): Whether listeners should be notified asynchronously.
	 *                           `suppressErrors` (boolean): Whether to suppress error logging for listener failures.
	 *
	 * @return {Object} Returns an object containing:
	 *                  `count` (number): The number of successfully notified listeners.
	 *                  `errors` (Array): A list of errors encountered during listener notifications. Each error object
	 *                                   contains `listenerId` (ID of the listener), `error` (error message), and `stack` (stack trace).
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

		return {count, errors};
	}


	/**
	 * Retrieves listeners that match a given event using wildcard patterns.
	 *
	 * @param {string} event - The event name to match against wildcard patterns.
	 * @return {Array<Function>} An array of listener functions that match the given event.
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
	 * Checks whether a given event string matches a specified wildcard pattern.
	 *
	 * @param {string} event - The event string to be tested against the pattern.
	 * @param {string} pattern - The wildcard pattern to test the event against. A '*' matches any sequence of characters.
	 * @return {boolean} Returns true if the event matches the pattern, otherwise false.
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
	 * Adds an event to the event history while maintaining the maximum history size.
	 *
	 * @param {string} event - The name of the event being added to the history.
	 * @param {Object} data - The data associated with the event.
	 * @param {number} timestamp - The timestamp indicating when the event occurred.
	 * @param {string} emissionId - A unique identifier for the event emission.
	 * @return {void} This method does not return a value.
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
	 * Generates a unique identifier for a listener.
	 *
	 * The identifier is composed of the current timestamp and a random alphanumeric string.
	 *
	 * @return {string} A unique listener ID in the format `listener_<timestamp>_<randomString>`.
	 */
	_generateListenerId() {

		return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}


	/**
	 * Generates a unique identifier for an emission by combining a timestamp and a random string.
	 * The identifier is prefixed with 'emission_'.
	 *
	 * @return {string} A unique emission identifier.
	 */
	_generateEmissionId() {

		return `emission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}


	/**
	 * Logs a debug message to the console if debugging is enabled.
	 *
	 * @param {string} message - The main message to log.
	 * @param {...any} args - Additional arguments to be interpolated into the log.
	 * @return {void}
	 */
	_debugLog(message, ...args) {

		if (this._debug) {
			console.log(`[EventBus] ${message}`, ...args);
		}
	}


	/**
	 * Destroys the EventBus by removing all listeners and clearing the event history.
	 * Logs the total number of listeners and events before destruction.
	 *
	 * @return {void} No value is returned.
	 */
	destroy() {

		const stats = this.getStats();
		this._debugLog(`Destroying EventBus: ${stats.totalListeners} listeners, ${stats.totalEvents} events`);

		this.removeAllListeners();
		this._eventHistory = [];
	}
}

export default EventBus;