import Settings from './Settings.js';
import SettingsValidator from "./SettingsValidator.js";

/**
 * Manages configuration settings, validation, and history for a system.
 * Provides methods for retrieving, updating, and applying configuration options atomically.
 */
class ConfigurationManager {

	/**
	 * Constructs a new instance of a class with optional event bus and initializes configuration.
	 *
	 * @param {Object|null} eventBus - An optional event bus object for event handling. Defaults to null.
	 * @return {Object} A new instance of the class initialized with default settings and configuration.
	 */
	constructor(eventBus = null) {

		this._eventBus = eventBus;

		// Configuration state
		this._bpm = Settings.defaultParams.bpmInitial;
		this._division = Settings.defaultParams.division;
		this._volume = Settings.defaultParams.volume;
		this._accent = true;
		this._currentPattern = 'straight';

		// Configuration history for undo functionality
		this._configHistory = [];
		this._maxHistorySize = 10;

		// Validation cache
		this._lastValidation = null;
		this._validationCacheTime = 0;
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


	/**
	 * Retrieves the current configuration of the system.
	 *
	 * @return {Object} An object containing the configuration properties:
	 * - bpm: The beats per minute setting.
	 * - division: The division configuration.
	 * - volume: The volume level.
	 * - accent: The accent setting.
	 * - pattern: The current pattern being used.
	 * - timestamp: The timestamp of when the configuration was retrieved.
	 */
	getConfiguration() {

		return {
			bpm: this._bpm,
			division: this._division,
			volume: this._volume,
			accent: this._accent,
			pattern: this._currentPattern,
			timestamp: Date.now()
		};
	}


	/**
	 * Retrieves a summary of the current configuration, combining existing configuration data
	 * with additional computed properties such as tempo name, division name, and validation status.
	 *
	 * @return {Object} An object representing the configuration summary, containing all current configuration data,
	 *                  along with tempo name as a string, division name as a string, and a boolean flag
	 *                  indicating if the configuration is valid.
	 */
	getConfigurationSummary() {

		return {
			...this.getConfiguration(),
			tempoName: Settings.getTempoName(this._bpm),
			divisionName: Settings.getDivisionName(this._division),
			isValid: this._validateCurrentConfiguration()
		};
	}


	/**
	 * Sets the beats per minute (BPM) for the system and emits configuration update events.
	 *
	 * @param {number|string} bpm - The new BPM value to set. It can be provided as a number or a string.
	 * @return {Object} Result of the operation containing:
	 *                  - success: A boolean indicating whether the BPM update was successful.
	 *                  - change: If successful, an object detailing the old BPM value, new BPM value, and tempo name.
	 *                  - error: If unsuccessful, a description of the error.
	 */
	setBpm(bpm) {

		const numBpm = parseInt(bpm);

		if (!Settings.isValidBpm(numBpm)) {
			const error = `Invalid BPM: ${bpm}. Range: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`;
			this._emit('configurationError', {type: 'bpm', error, value: bpm});
			return {success: false, error};
		}

		const oldValue = this._bpm;
		this._saveToHistory('bpm', oldValue);
		this._bpm = numBpm;

		const change = {
			type: 'bpm',
			oldValue,
			newValue: numBpm,
			tempoName: Settings.getTempoName(numBpm)
		};

		this._emit('configurationChanged', change);
		return {success: true, change};
	}


	/**
	 * Sets the division for the current configuration.
	 *
	 * @param {string|number} division - The division value to be set. Must be a number between 1 and 16.
	 * @return {Object} Returns an object indicating the success status. If successful, includes the change details,
	 *                  otherwise includes the error information.
	 */
	setDivision(division) {

		const numDiv = parseInt(division);

		if (!Settings.isValidDivision(numDiv)) {
			const error = `Invalid division: ${division}. Range: 1-16`;
			this._emit('configurationError', {type: 'division', error, value: division});
			return {success: false, error};
		}

		const oldValue = this._division;
		this._saveToHistory('division', oldValue);
		this._division = numDiv;

		const change = {
			type: 'division',
			oldValue,
			newValue: numDiv,
			divisionName: Settings.getDivisionName(numDiv)
		};

		this._emit('configurationChanged', change);
		return {success: true, change};
	}


	/**
	 * Sets the volume level after validating it.
	 *
	 * @param {number|string} volume - The desired volume level, which will be parsed and validated. It must be within the range of 0-100.
	 * @return {Object} An object representing the result of the operation. Contains a `success` property (boolean) indicating whether the operation was successful.
	 * If unsuccessful, it also contains an `error` property with details. If successful, it contains a `change` property describing the modification made.
	 */
	setVolume(volume) {

		const numVol = parseInt(volume);

		if (!Settings.isValidVolume(numVol)) {
			const error = `Invalid volume: ${volume}. Range: 0-100`;
			this._emit('configurationError', {type: 'volume', error, value: volume});
			return {success: false, error};
		}

		const oldValue = this._volume;
		this._saveToHistory('volume', oldValue);
		this._volume = numVol;

		const change = {
			type: 'volume',
			oldValue,
			newValue: numVol
		};

		this._emit('configurationChanged', change);
		return {success: true, change};
	}


	/**
	 * Sets the accent state for the configuration.
	 *
	 * @param {boolean} enabled - Determines whether the accent is enabled or disabled.
	 * @return {Object} An object containing the success status of the operation and the details of the change made.
	 */
	setAccent(enabled) {

		const boolEnabled = Boolean(enabled);
		const oldValue = this._accent;

		this._saveToHistory('accent', oldValue);
		this._accent = boolEnabled;

		const change = {
			type: 'accent',
			oldValue,
			newValue: boolEnabled
		};

		this._emit('configurationChanged', change);
		return {success: true, change};
	}


	/**
	 * Updates the current pattern configuration. Validates the input pattern and emits corresponding events
	 * based on the change or errors encountered during the update process.
	 *
	 * @param {string} pattern - The new pattern to set. Valid patterns are 'straight', 'swing', and 'custom'.
	 * @return {Object} Returns an object indicating the success or failure of the operation. If successful, includes
	 *                  details of the change (type, oldValue, newValue). In case of failure, contains an error message.
	 */
	/**
	 * Updates the current pattern configuration using centralized validation.
	 *
	 * @param {string} pattern - The new pattern to set.
	 * @return {Object} Returns an object indicating the success or failure of the operation.
	 */
	setPattern(pattern) {

		if (!SettingsValidator.isValidPattern(pattern)) {
			const validPatterns = Settings.commandConstants.validPatterns.join(', ');
			const error = `Invalid pattern: ${pattern}. Valid: ${validPatterns}`;
			this._emit('configurationError', {type: 'pattern', error, value: pattern});
			return {success: false, error};
		}

		const oldValue = this._currentPattern;
		this._saveToHistory('pattern', oldValue);
		this._currentPattern = pattern;

		const change = {
			type: 'pattern',
			oldValue,
			newValue: pattern
		};

		this._emit('configurationChanged', change);
		return {success: true, change};
	}


	/**
	 * Applies the given configuration to update multiple settings, validates the changes, and emits events based on success or errors.
	 *
	 * @param {Object} config - The configuration object containing settings to be applied.
	 * @param {number} [config.bpm] - Beats per minute value to be set.
	 * @param {string} [config.division] - Division value to be set.
	 * @param {number} [config.volume] - Volume level to be set.
	 * @param {boolean} [config.accent] - Accent status to be set.
	 * @param {Array} [config.pattern] - Pattern data to be applied.
	 * @return {Object} An object containing the status and details of the application process.
	 * @return {boolean} return.success - Indicates if all changes were successfully applied.
	 * @return {Array} return.changes - The list of changes successfully applied.
	 * @return {Array} return.results - Detailed results of each change attempt.
	 * @return {Array} [return.errors] - List of validation errors if any occurred during processing. Present only if validation fails.
	 */
	applyConfiguration(config) {

		const results = [];
		const changes = [];
		const errors = [];

		// Validate all changes first
		if (config.bpm !== undefined) {
			const result = this._validateBpm(config.bpm);
			if (!result.valid) {
				errors.push({type: 'bpm', error: result.error});
			}
		}

		if (config.division !== undefined) {
			const result = this._validateDivision(config.division);
			if (!result.valid) {
				errors.push({type: 'division', error: result.error});
			}
		}

		if (config.volume !== undefined) {
			const result = this._validateVolume(config.volume);
			if (!result.valid) {
				errors.push({type: 'volume', error: result.error});
			}
		}

		if (config.pattern !== undefined) {
			const result = this._validatePattern(config.pattern);
			if (!result.valid) {
				errors.push({type: 'pattern', error: result.error});
			}
		}

		// If any validation failed, return errors
		if (errors.length > 0) {
			this._emit('configurationError', {type: 'batch', errors});
			return {success: false, errors};
		}

		// Apply all changes
		if (config.bpm !== undefined) {
			const result = this.setBpm(config.bpm);
			results.push(result);
			if (result.success) changes.push(result.change);
		}

		if (config.division !== undefined) {
			const result = this.setDivision(config.division);
			results.push(result);
			if (result.success) changes.push(result.change);
		}

		if (config.volume !== undefined) {
			const result = this.setVolume(config.volume);
			results.push(result);
			if (result.success) changes.push(result.change);
		}

		if (config.accent !== undefined) {
			const result = this.setAccent(config.accent);
			results.push(result);
			if (result.success) changes.push(result.change);
		}

		if (config.pattern !== undefined) {
			const result = this.setPattern(config.pattern);
			results.push(result);
			if (result.success) changes.push(result.change);
		}

		this._emit('batchConfigurationChanged', {changes});
		return {success: true, changes, results};
	}


	/**
	 * Creates a new preset with the provided name and current state of the instance.
	 *
	 * @param {string} name - The name of the preset to be created.
	 * @return {Object} An object representing the created preset, including details such as name, bpm, division, volume, accent, pattern, and creation timestamp.
	 */
	createPreset(name) {

		const preset = {
			name,
			bpm: this._bpm,
			division: this._division,
			volume: this._volume,
			accent: this._accent,
			pattern: this._currentPattern,
			createdAt: new Date().toISOString()
		};

		this._emit('presetCreated', preset);
		return preset;
	}


	/**
	 * Applies a given preset to the current configuration.
	 *
	 * @param {Object} preset - The preset to apply. Expected to contain properties such as bpm, division, volume, accent, and pattern.
	 * @return {Object} Returns an object indicating the success or failure of applying the preset. If unsuccessful, an error message is included.
	 */
	applyPreset(preset) {

		if (!this._validatePreset(preset)) {
			const error = 'Invalid preset configuration';
			this._emit('configurationError', {type: 'preset', error, preset});
			return {success: false, error};
		}

		const oldConfig = this.getConfiguration();

		const config = {
			bpm: preset.bpm,
			division: preset.division,
			volume: preset.volume || this._volume,
			accent: preset.accent,
			pattern: preset.pattern || this._currentPattern
		};

		const result = this.applyConfiguration(config);

		if (result.success) {
			this._emit('presetApplied', {
				preset,
				oldConfig,
				newConfig: this.getConfiguration()
			});
		}

		return result;
	}


	/**
	 * Reverts the last configuration change from the history, if available.
	 *
	 * @return {Object} An object containing the result of the undo operation. If successful, the object includes
	 *                  the details of the reverted change. If no history is available, an error message is returned.
	 */
	undo() {

		if (this._configHistory.length === 0) {
			return {success: false, error: 'No configuration history available'};
		}

		const lastChange = this._configHistory.pop();
		const oldValue = this[`_${lastChange.type}`];

		// Apply the previous value without saving to history
		this[`_${lastChange.type}`] = lastChange.value;

		const change = {
			type: lastChange.type,
			oldValue,
			newValue: lastChange.value,
			isUndo: true
		};

		this._emit('configurationChanged', change);
		return {success: true, change};
	}


	/**
	 * Retrieves the history of configuration changes.
	 *
	 * @return {Array} A copy of the configuration history stored in an array.
	 */
	getHistory() {

		return [...this._configHistory];
	}


	/**
	 * Clears the history by resetting the internal configuration history
	 * and emits a 'historyCleared' event.
	 *
	 * @return {void} This method does not return a value.
	 */
	clearHistory() {

		this._configHistory = [];
		this._emit('historyCleared');
	}


	/**
	 * Validates the BPM (Beats Per Minute) value against the acceptable range defined in settings.
	 *
	 * @param {string|number} bpm - The BPM value to validate, which can be a string or a number.
	 * @return {Object} An object with a `valid` property indicating if the BPM is valid.
	 *                  If invalid, the object includes an `error` property with details.
	 */
	_validateBpm(bpm) {

		const numBpm = parseInt(bpm);
		if (!Settings.isValidBpm(numBpm)) {
			return {
				valid: false,
				error: `Invalid BPM: ${bpm}. Range: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`
			};
		}
		return {valid: true};
	}


	/**
	 * Validates the given division to ensure it falls within an acceptable range.
	 *
	 * @param {string|number} division - The division to validate, typically provided as a string or number.
	 * @return {Object} An object containing the validation status. If invalid, includes an error message.
	 */
	_validateDivision(division) {

		const numDiv = parseInt(division);
		if (!Settings.isValidDivision(numDiv)) {
			return {
				valid: false,
				error: `Invalid division: ${division}. Range: 1-16`
			};
		}
		return {valid: true};
	}


	/**
	 * Validates the given volume.
	 *
	 * @param {string} volume - The volume value as a string to be validated.
	 * @return {Object} An object containing the validation result with a `valid` property
	 *                  indicating success or failure, and an `error` property if invalid.
	 */
	_validateVolume(volume) {

		const numVol = parseInt(volume);
		if (!Settings.isValidVolume(numVol)) {
			return {
				valid: false,
				error: `Invalid volume: ${volume}. Range: 0-100`
			};
		}
		return {valid: true};
	}


	/**
	 * Validates the provided pattern against a predefined list of valid patterns.
	 *
	 * @param {string} pattern - The pattern to be validated.
	 * @return {Object} An object containing the validation result:
	 *                  'valid' indicates if the pattern is valid,
	 *                  'error' provides an error message if invalid.
	 */
	/**
	 * Validates the provided pattern using centralized validation.
	 *
	 * @param {string} pattern - The pattern to be validated.
	 * @return {Object} An object containing the validation result.
	 */
	_validatePattern(pattern) {

		if (!SettingsValidator.isValidPattern(pattern)) {
			const validPatterns = Settings.commandConstants.validPatterns.join(', ');
			return {
				valid: false,
				error: `Invalid pattern: ${pattern}. Valid: ${validPatterns}`
			};
		}
		return {valid: true};
	}


	/**
	 * Validates the provided preset object.
	 *
	 * @param {Object} preset - The preset object to validate.
	 * @return {boolean} Returns true if the preset is valid, otherwise false.
	 */
	_validatePreset(preset) {

		if (!preset || typeof preset !== 'object') {
			return false;
		}

		return Settings.validatePreset(preset);
	}


	/**
	 * Validates the current configuration of the application or object.
	 * The validation checks parameters such as BPM (beats per minute), division, volume,
	 * and ensures the current pattern is one of the allowable types ('straight', 'swing', 'custom').
	 * Results of the validation are cached to improve performance and are reused if the method
	 * is called within a short time frame (less than 1 second).
	 *
	 * @return {boolean} Returns true if the current configuration is valid, false otherwise.
	 */
	/**
	 * Validates the current configuration using centralized validation methods.
	 *
	 * @return {boolean} Returns true if the current configuration is valid, false otherwise.
	 */
	_validateCurrentConfiguration() {

		const now = Date.now();

		const cacheTime = Settings.rhythmConstants.performance.validationCacheTimeMs;

		// Use cached validation if recent
		if (this._lastValidation && (now - this._validationCacheTime) < cacheTime) {
			return this._lastValidation;
		}

		const isValid = SettingsValidator.isValidBpm(this._bpm) &&
			SettingsValidator.isValidDivision(this._division) &&
			SettingsValidator.isValidVolume(this._volume) &&
			SettingsValidator.isValidPattern(this._currentPattern);

		this._lastValidation = isValid;
		this._validationCacheTime = now;

		return isValid;
	}


	/**
	 * Saves a configuration change to the history list with a timestamp.
	 *
	 * @param {string} type - The type or category of the configuration change.
	 * @param {*} value - The value associated with the configuration change.
	 * @return {void}
	 */
	_saveToHistory(type, value) {

		this._configHistory.push({
			type,
			value,
			timestamp: Date.now()
		});

		// Limit history size
		if (this._configHistory.length > this._maxHistorySize) {
			this._configHistory.shift();
		}
	}


	/**
	 * Emits an event through the internal event bus.
	 *
	 * @param {string} event - The event name to emit.
	 * @param {any} data - The data payload associated with the event.
	 * @return {void}
	 */
	_emit(event, data) {

		if (this._eventBus && typeof this._eventBus.emit === 'function') {
			this._eventBus.emit(`configuration.${event}`, data);
		}
	}


	/**
	 * Resets the configuration of the system or component to its default settings.
	 *
	 * The method restores the default parameters for BPM, division, volume, accents,
	 * and pattern, while also clearing the history associated with the component.
	 * It emits an event notifying the listeners about the configuration reset,
	 * providing both the old and new configurations.
	 *
	 * @return {void} This method does not return a value.
	 */
	reset() {

		const oldConfig = this.getConfiguration();

		this._bpm = Settings.defaultParams.bpmInitial;
		this._division = Settings.defaultParams.division;
		this._volume = Settings.defaultParams.volume;
		this._accent = true;
		this._currentPattern = 'straight';

		this.clearHistory();

		this._emit('configurationReset', {
			oldConfig,
			newConfig: this.getConfiguration()
		});
	}


	/**
	 * Cleans up the resources used by the object, ensuring proper disposal.
	 * It clears the object's history, nullifies the event bus,
	 * and resets the last validation data.
	 *
	 * @return {void} Does not return any value.
	 */
	destroy() {

		this.clearHistory();
		this._eventBus = null;
		this._lastValidation = null;
	}
}

export default ConfigurationManager;