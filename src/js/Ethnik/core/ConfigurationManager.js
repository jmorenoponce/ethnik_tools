import Settings from './Settings.js';

/**
 * ConfigurationManager - Responsible for managing metronome configuration,
 * presets, and validation. Extracted from Core.js to follow Single Responsibility Principle.
 */
class ConfigurationManager {

	/**
	 * Creates a ConfigurationManager instance.
	 *
	 * @param {Object} eventBus - Event bus for notifications (optional).
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

	// =====================================================
	// PUBLIC API - Getters
	// =====================================================

	get bpm() { return this._bpm; }
	get division() { return this._division; }
	get volume() { return this._volume; }
	get accent() { return this._accent; }
	get currentPattern() { return this._currentPattern; }

	/**
	 * Gets current configuration as object.
	 *
	 * @return {Object} Current configuration.
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
	 * Gets configuration summary with metadata.
	 *
	 * @return {Object} Configuration summary.
	 */
	getConfigurationSummary() {

		return {
			...this.getConfiguration(),
			tempoName: Settings.getTempoName(this._bpm),
			divisionName: Settings.getDivisionName(this._division),
			isValid: this._validateCurrentConfiguration()
		};
	}

	// =====================================================
	// PUBLIC API - Basic Configuration
	// =====================================================

	/**
	 * Sets the tempo (BPM) with validation and history.
	 *
	 * @param {number|string} bpm - New tempo value.
	 * @return {Object} Result object with success status and message.
	 */
	setBpm(bpm) {

		const numBpm = parseInt(bpm);

		if (!Settings.isValidBpm(numBpm)) {
			const error = `Invalid BPM: ${bpm}. Range: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`;
			this._emit('configurationError', { type: 'bpm', error, value: bpm });
			return { success: false, error };
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
		return { success: true, change };
	}

	/**
	 * Sets the beat division with validation.
	 *
	 * @param {number|string} division - New division value.
	 * @return {Object} Result object with success status and message.
	 */
	setDivision(division) {

		const numDiv = parseInt(division);

		if (!Settings.isValidDivision(numDiv)) {
			const error = `Invalid division: ${division}. Range: 1-16`;
			this._emit('configurationError', { type: 'division', error, value: division });
			return { success: false, error };
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
		return { success: true, change };
	}

	/**
	 * Sets the volume level with validation.
	 *
	 * @param {number|string} volume - New volume value.
	 * @return {Object} Result object with success status and message.
	 */
	setVolume(volume) {

		const numVol = parseInt(volume);

		if (!Settings.isValidVolume(numVol)) {
			const error = `Invalid volume: ${volume}. Range: 0-100`;
			this._emit('configurationError', { type: 'volume', error, value: volume });
			return { success: false, error };
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
		return { success: true, change };
	}

	/**
	 * Sets accent state.
	 *
	 * @param {boolean} enabled - Whether accents are enabled.
	 * @return {Object} Result object with success status.
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
		return { success: true, change };
	}

	/**
	 * Sets rhythmic pattern with validation.
	 *
	 * @param {string} pattern - Pattern name.
	 * @return {Object} Result object with success status and message.
	 */
	setPattern(pattern) {

		const validPatterns = ['straight', 'swing', 'custom'];

		if (!validPatterns.includes(pattern)) {
			const error = `Invalid pattern: ${pattern}. Valid: ${validPatterns.join(', ')}`;
			this._emit('configurationError', { type: 'pattern', error, value: pattern });
			return { success: false, error };
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
		return { success: true, change };
	}

	// =====================================================
	// PUBLIC API - Batch Configuration
	// =====================================================

	/**
	 * Applies multiple configuration changes atomically.
	 *
	 * @param {Object} config - Configuration object with multiple properties.
	 * @return {Object} Result object with success status and applied changes.
	 */
	applyConfiguration(config) {

		const results = [];
		const changes = [];
		const errors = [];

		// Validate all changes first
		if (config.bpm !== undefined) {
			const result = this._validateBpm(config.bpm);
			if (!result.valid) {
				errors.push({ type: 'bpm', error: result.error });
			}
		}

		if (config.division !== undefined) {
			const result = this._validateDivision(config.division);
			if (!result.valid) {
				errors.push({ type: 'division', error: result.error });
			}
		}

		if (config.volume !== undefined) {
			const result = this._validateVolume(config.volume);
			if (!result.valid) {
				errors.push({ type: 'volume', error: result.error });
			}
		}

		if (config.pattern !== undefined) {
			const result = this._validatePattern(config.pattern);
			if (!result.valid) {
				errors.push({ type: 'pattern', error: result.error });
			}
		}

		// If any validation failed, return errors
		if (errors.length > 0) {
			this._emit('configurationError', { type: 'batch', errors });
			return { success: false, errors };
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

		this._emit('batchConfigurationChanged', { changes });
		return { success: true, changes, results };
	}

	// =====================================================
	// PUBLIC API - Presets
	// =====================================================

	/**
	 * Creates a preset from current configuration.
	 *
	 * @param {string} name - Preset name.
	 * @return {Object} Created preset object.
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
	 * Applies a preset configuration.
	 *
	 * @param {Object} preset - Preset object to apply.
	 * @return {Object} Result object with success status.
	 */
	applyPreset(preset) {

		if (!this._validatePreset(preset)) {
			const error = 'Invalid preset configuration';
			this._emit('configurationError', { type: 'preset', error, preset });
			return { success: false, error };
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

	// =====================================================
	// PUBLIC API - History and Undo
	// =====================================================

	/**
	 * Undoes the last configuration change.
	 *
	 * @return {Object} Result object with success status.
	 */
	undo() {

		if (this._configHistory.length === 0) {
			return { success: false, error: 'No configuration history available' };
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
		return { success: true, change };
	}

	/**
	 * Gets configuration history.
	 *
	 * @return {Array} Array of configuration changes.
	 */
	getHistory() {

		return [...this._configHistory];
	}

	/**
	 * Clears configuration history.
	 *
	 * @return {void}
	 */
	clearHistory() {

		this._configHistory = [];
		this._emit('historyCleared');
	}

	// =====================================================
	// PRIVATE METHODS - Validation
	// =====================================================

	/**
	 * Validates BPM value.
	 *
	 * @param {*} bpm - BPM value to validate.
	 * @return {Object} Validation result.
	 */
	_validateBpm(bpm) {

		const numBpm = parseInt(bpm);
		if (!Settings.isValidBpm(numBpm)) {
			return {
				valid: false,
				error: `Invalid BPM: ${bpm}. Range: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`
			};
		}
		return { valid: true };
	}

	/**
	 * Validates division value.
	 *
	 * @param {*} division - Division value to validate.
	 * @return {Object} Validation result.
	 */
	_validateDivision(division) {

		const numDiv = parseInt(division);
		if (!Settings.isValidDivision(numDiv)) {
			return {
				valid: false,
				error: `Invalid division: ${division}. Range: 1-16`
			};
		}
		return { valid: true };
	}

	/**
	 * Validates volume value.
	 *
	 * @param {*} volume - Volume value to validate.
	 * @return {Object} Validation result.
	 */
	_validateVolume(volume) {

		const numVol = parseInt(volume);
		if (!Settings.isValidVolume(numVol)) {
			return {
				valid: false,
				error: `Invalid volume: ${volume}. Range: 0-100`
			};
		}
		return { valid: true };
	}

	/**
	 * Validates pattern value.
	 *
	 * @param {*} pattern - Pattern value to validate.
	 * @return {Object} Validation result.
	 */
	_validatePattern(pattern) {

		const validPatterns = ['straight', 'swing', 'custom'];
		if (!validPatterns.includes(pattern)) {
			return {
				valid: false,
				error: `Invalid pattern: ${pattern}. Valid: ${validPatterns.join(', ')}`
			};
		}
		return { valid: true };
	}

	/**
	 * Validates preset object.
	 *
	 * @param {Object} preset - Preset to validate.
	 * @return {boolean} True if preset is valid.
	 */
	_validatePreset(preset) {

		if (!preset || typeof preset !== 'object') {
			return false;
		}

		return Settings.validatePreset(preset);
	}

	/**
	 * Validates current configuration.
	 *
	 * @return {boolean} True if current configuration is valid.
	 */
	_validateCurrentConfiguration() {

		const now = Date.now();

		// Use cached validation if recent
		if (this._lastValidation && (now - this._validationCacheTime) < 1000) {
			return this._lastValidation;
		}

		const isValid = Settings.isValidBpm(this._bpm) &&
			Settings.isValidDivision(this._division) &&
			Settings.isValidVolume(this._volume) &&
			['straight', 'swing', 'custom'].includes(this._currentPattern);

		this._lastValidation = isValid;
		this._validationCacheTime = now;

		return isValid;
	}

	// =====================================================
	// PRIVATE METHODS - History Management
	// =====================================================

	/**
	 * Saves current value to history.
	 *
	 * @param {string} type - Configuration type.
	 * @param {*} value - Value to save.
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

	// =====================================================
	// PRIVATE METHODS - Events
	// =====================================================

	/**
	 * Emits events through the event bus if available.
	 *
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 * @return {void}
	 */
	_emit(event, data) {

		if (this._eventBus && typeof this._eventBus.emit === 'function') {
			this._eventBus.emit(`configuration.${event}`, data);
		}
	}

	// =====================================================
	// PUBLIC METHODS - Lifecycle
	// =====================================================

	/**
	 * Resets configuration to defaults.
	 *
	 * @return {void}
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
	 * Cleanup method for proper disposal.
	 *
	 * @return {void}
	 */
	destroy() {

		this.clearHistory();
		this._eventBus = null;
		this._lastValidation = null;
	}
}

export default ConfigurationManager;