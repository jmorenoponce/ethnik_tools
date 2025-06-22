import Settings from './Settings.js';

/**
 * Utility class for validating configuration values and managing presets
 * Separated from Settings to follow Single Responsibility Principle
 */
class SettingsValidator {

	// ============================================================================
	// CORE VALIDATION METHODS
	// ============================================================================

	/**
	 * Validates BPM value against system limits
	 */
	static isValidBpm(bpm) {

		return !isNaN(bpm) &&
			bpm >= Settings.defaultParams.bpmMin &&
			bpm <= Settings.defaultParams.bpmMax;
	}


	/**
	 * Validates division value
	 */
	static isValidDivision(division) {

		return !isNaN(division) && division >= 1 && division <= 16;
	}


	/**
	 * Validates volume value
	 */
	static isValidVolume(volume) {

		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Validates pattern value
	 */
	static isValidPattern(pattern) {

		return Settings.commandConstants.validPatterns.includes(pattern);
	}


	/**
	 * Validates accent command value
	 */
	static isValidAccentValue(value) {

		return Settings.commandConstants.validAccentValues.includes(value);
	}


	/**
	 * Validates timeline subcommand
	 */
	static isValidTimelineSubcommand(subcommand) {

		return Settings.commandConstants.timelineSubcommands.includes(subcommand);
	}


	/**
	 * Validates basic preset structure
	 */
	static validatePreset(preset) {

		if (!preset || typeof preset !== 'object') {
			Settings.log('Invalid preset: not an object');
			return false;
		}

		const isValid = this.isValidBpm(preset.bpm) &&
			this.isValidDivision(preset.division) &&
			typeof preset.accent === 'boolean';

		if (!isValid) {
			Settings.log('Invalid preset configuration:', preset);
		}

		return isValid;
	}


	/**
	 * Validates extended preset with additional metadata
	 */
	static validateExtendedPreset(preset) {

		if (!this.validatePreset(preset)) {
			return false;
		}

		// TODO: Hardcoded Genres
		// Optional metadata validation
		const validGenres = ['classical', 'jazz', 'rock', 'latin', 'ballad', 'funk', 'metal', 'reggae', 'custom'];
		const validDifficulties = ['beginner', 'intermediate', 'advanced'];

		if (preset.genre && !validGenres.includes(preset.genre)) {
			return false;
		}

		if (preset.difficulty && !validDifficulties.includes(preset.difficulty)) {
			return false;
		}

		return true;
	}


	// ============================================================================
	// PRESET UTILITIES
	// ============================================================================

	/**
	 * Get presets filtered by category and subcategory
	 */
	static getPresetsByCategory(category, subcategory) {

		const categoryMap = Settings.presetCategories[category];

		if (!categoryMap || !categoryMap[subcategory]) {
			return [];
		}

		return categoryMap[subcategory].map(presetName => ({
			name: presetName,
			...Settings.presetDefinitions[presetName]
		}));
	}


	/**
	 * Get all preset names
	 */
	static getAllPresetNames() {

		return Object.keys(Settings.presetDefinitions);
	}


	/**
	 * Check if preset exists
	 */
	static presetExists(presetName) {

		return Object.prototype.hasOwnProperty.call(Settings.presetDefinitions, presetName);
	}


	// ============================================================================
	// VISUAL AUDIO UTILITIES
	// ============================================================================

	/**
	 * Generate visual tone symbol based on frequency
	 */
	static getVisualToneSymbol(frequency, symbolSet = 'default') {

		const config = Settings.visualAudioConstants.toneGeneration;
		const maxFreq = Settings.audioConstants.frequencies.downbeat;

		// Calculate intensity using centralized configuration
		const intensity = Math.floor(
			(frequency / maxFreq) * config.mapping.maxIntensity
		);

		// Select symbol set
		let symbols = config.musicSymbols.chars;
		if (symbolSet !== 'default' && Settings.visualAudioConstants.alternativeSymbols[symbolSet]) {
			symbols = Settings.visualAudioConstants.alternativeSymbols[symbolSet];
		}

		// Get index with optional clamping
		let index = intensity;
		if (config.mapping.clampToRange) {
			index = Math.min(intensity, config.maxSymbolIndex);
			index = Math.max(index, 0);
		}

		return symbols[index] || symbols[symbols.length - 1];
	}


	// ============================================================================
	// TIMELINE UTILITIES
	// ============================================================================

	/**
	 * Generate crescendo sections dynamically
	 */
	static generateCrescendoSections() {

		const config = Settings.customTimelineTemplates.tempoWork;
		const sections = [];
		let currentBpm = config.baseBpm;
		const bpmIncrement = (config.targetBpm - config.baseBpm) / config.steps;

		// Ascending phase
		for (let i = 0; i < config.steps; i++) {
			sections.push({
				id: `crescendo_step_${i + 1}`,
				duration: config.stepDuration,
				bpm: Math.round(currentBpm),
				pattern: 'straight',
				description: this._getCrescendoDescription(currentBpm, 'ascending'),
				tags: ['crescendo', 'ascending', `step_${i + 1}`]
			});
			currentBpm += bpmIncrement;
		}

		// Peak
		sections.push({
			id: 'peak',
			duration: config.stepDuration,
			bpm: config.targetBpm,
			pattern: 'straight',
			description: 'Peak tempo',
			tags: ['peak', 'maximum_tempo']
		});

		// Descending phase
		currentBpm = config.targetBpm - bpmIncrement;
		for (let i = 0; i < config.steps; i++) {
			sections.push({
				id: `diminuendo_step_${i + 1}`,
				duration: config.stepDuration,
				bpm: Math.round(currentBpm),
				pattern: 'straight',
				description: this._getCrescendoDescription(currentBpm, 'descending'),
				tags: ['diminuendo', 'descending', `step_${i + 1}`]
			});
			currentBpm -= bpmIncrement;
		}

		return sections;
	}


	/**
	 * Get description for crescendo sections
	 */
	static _getCrescendoDescription(bpm, phase) {

		const tempoName = Settings.getTempoName(bpm);
		if (phase === 'ascending') {
			return `Gradual acceleration - ${bpm} BPM (${tempoName})`;
		} else {
			return `Controlled descent - ${bpm} BPM (${tempoName})`;
		}
	}


	// ============================================================================
	// SYSTEM VALIDATION
	// ============================================================================

	/**
	 * Validate system configuration consistency
	 */
	static validateSystemConfiguration() {

		const issues = [];

		// Check BPM ranges
		if (Settings.defaultParams.bpmMin >= Settings.defaultParams.bpmMax) {
			issues.push('Invalid BPM range: min >= max');
		}

		// Check preset consistency
		for (const [name, preset] of Object.entries(Settings.presetDefinitions)) {
			if (!this.validatePreset(preset)) {
				issues.push(`Invalid preset: ${name}`);
			}
		}

		// Check audio constants
		const audioFreqs = Settings.audioConstants.frequencies;
		if (audioFreqs.downbeat <= audioFreqs.beat || audioFreqs.beat <= audioFreqs.subdivision) {
			issues.push('Invalid audio frequency hierarchy');
		}

		return {
			isValid: issues.length === 0,
			issues: issues
		};
	}


	/**
	 * Get system statistics
	 */
	static getSystemStats() {

		return {
			totalPresets: Object.keys(Settings.presetDefinitions).length,
			presetCategories: Object.keys(Settings.presetCategories).length,
			timelineTypes: Object.keys(Settings.timelineConstants).length - 1, // exclude 'defaults'
			bpmRange: `${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`,
			audioStrategies: ['file', 'system', 'tone'],
			supportedDivisions: Object.keys(Settings.divisionNames).length
		};
	}
}

export default SettingsValidator;