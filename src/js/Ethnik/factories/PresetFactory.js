import Settings from '../core/Settings.js';


/**
 * The PresetFactory class provides functionality to manage and create musical presets.
 * It includes methods to retrieve predefined presets, add new presets, and list available presets.
 * Now uses centralized configuration from Settings.js.
 */
class PresetFactory {

	/**
	 * Creates an instance of the object. Initializes the presets by loading them from settings and sets up a map for dynamically added custom presets.
	 *
	 * @return {Object} A new instance of the object with initialized presets and custom preset storage.
	 */
	constructor() {

		// ✅ REFACTORED: Cargar presets desde Settings en lugar de hardcodear
		this._presets = this._loadPresetsFromSettings();
		this._customPresets = new Map(); // Para presets agregados dinámicamente
	}


	/**
	 * Loads presets from Settings configuration.
	 *
	 * @return {Object} Object containing all preset definitions
	 */
	_loadPresetsFromSettings() {

		const presets = {};

		// Cargar presets predefinidos desde Settings
		for (const [name, definition] of Object.entries(Settings.presetDefinitions)) {
			presets[name] = {
				bpm: definition.bpm,
				division: definition.division,
				accent: definition.accent,
				name: definition.name,
				description: definition.description,
				genre: definition.genre,
				difficulty: definition.difficulty
			};
		}

		return presets;
	}


	/**
	 * Creates a preset by retrieving a predefined or custom preset configuration.
	 * If the preset with the given name exists, a cloned copy of the preset is returned.
	 * If no preset matches the given name, it returns null.
	 *
	 * @param {string} name The name of the preset to retrieve or create.
	 * @return {Object|null} A cloned copy of the preset if found, or null if not found.
	 */
	createPreset(name) {

		if (this._presets[name]) {
			return { ...this._presets[name] }; // Clonar para evitar mutaciones
		}

		if (this._customPresets.has(name)) {
			return { ...this._customPresets.get(name) };
		}

		return null;
	}


	/**
	 * Retrieves the list of available presets, including custom ones.
	 *
	 * @return {string[]} An array of preset names available in the system.
	 */
	getAvailablePresets() {

		const predefinedPresets = Object.keys(this._presets);
		const customPresets = Array.from(this._customPresets.keys());

		return [...predefinedPresets, ...customPresets];
	}


	/**
	 * Gets available presets organized by category.
	 *
	 * @param {string} category - Category type: 'byGenre', 'byDifficulty', 'byTempo'
	 * @return {Object} Object with subcategories and their presets
	 */
	getPresetsByCategory(category = 'byGenre') {

		const result = {};
		const categoryMap = Settings.presetCategories[category];

		if (!categoryMap) {
			return { all: this.getAvailablePresets() };
		}

		for (const [subcategory, presetNames] of Object.entries(categoryMap)) {
			result[subcategory] = presetNames.filter(name =>
				this._presets[name] || this._customPresets.has(name)
			);
		}

		return result;
	}


	/**
	 * Gets detailed information about all presets.
	 *
	 * @return {Array} Array of preset objects with full metadata
	 */
	getAllPresetsWithDetails() {

		const allPresets = [];

		for (const [name, preset] of Object.entries(this._presets)) {
			allPresets.push({
				name,
				isPredefined: true,
				...preset
			});
		}

		for (const [name, preset] of this._customPresets) {
			allPresets.push({
				name,
				isPredefined: false,
				isCustom: true,
				...preset
			});
		}

		return allPresets;
	}


	/**
	 * Adds a new preset to the internal presets collection if the configuration is valid.
	 * Enhanced version with better validation and custom preset support.
	 *
	 * @param {string} name - The name of the preset to be added.
	 * @param {Object} config - The configuration object for the preset.
	 * @return {boolean} True if preset was added successfully, false otherwise.
	 */
	addPreset(name, config) {


		if (Settings.validateExtendedPreset(config)) {

			this._customPresets.set(name, {
				...config,
				isCustom: true,
				createdAt: new Date().toISOString()
			});

			console.log(`✅ Custom preset '${name}' added successfully`);
			return true;

		} else {

			console.error(`❌ Invalid preset configuration for '${name}'`);
			return false;
		}
	}


	/**
	 * Removes a custom preset.
	 *
	 * @param {string} name - Name of the preset to remove
	 * @return {boolean} True if removed successfully
	 */
	removeCustomPreset(name) {

		if (this._customPresets.has(name)) {

			this._customPresets.delete(name);
			console.log(`✅ Custom preset '${name}' removed`);
			return true;
		}

		console.log(`❌ Custom preset '${name}' not found`);
		return false;
	}


	/**
	 * Gets presets filtered by criteria.
	 *
	 * @param {Object} filters - Filter criteria
	 * @param {string} filters.genre - Filter by genre
	 * @param {string} filters.difficulty - Filter by difficulty
	 * @param {number} filters.minBpm - Minimum BPM
	 * @param {number} filters.maxBpm - Maximum BPM
	 * @return {Array} Filtered presets
	 */
	getFilteredPresets(filters = {}) {

		const allPresets = this.getAllPresetsWithDetails();

		return allPresets.filter(preset => {

			if (filters.genre && preset.genre !== filters.genre) {
				return false;
			}

			if (filters.difficulty && preset.difficulty !== filters.difficulty) {
				return false;
			}

			if (filters.minBpm && preset.bpm < filters.minBpm) {
				return false;
			}

			if (filters.maxBpm && preset.bpm > filters.maxBpm) {
				return false;
			}

			return true;
		});
	}


	/**
	 * Creates a preset based on current system configuration.
	 *
	 * @param {string} name - Name for the new preset
	 * @param {Object} currentConfig - Current system configuration
	 * @return {boolean} True if created successfully
	 */
	createPresetFromCurrent(name, currentConfig) {

		const preset = {

			bpm: currentConfig.bpm,
			division: currentConfig.division,
			accent: currentConfig.accent,
			description: `Custom preset created from current settings`,
			genre: 'custom',
			difficulty: 'custom',
			isCustom: true
		};

		return this.addPreset(name, preset);
	}


	/**
	 * Exports custom presets to JSON format.
	 *
	 * @return {string} JSON string of custom presets
	 */
	exportCustomPresets() {

		const customPresets = {};

		for (const [name, preset] of this._customPresets) {
			customPresets[name] = preset;
		}

		return JSON.stringify(customPresets, null, 2);
	}


	/**
	 * Imports custom presets from JSON.
	 *
	 * @param {string} jsonString - JSON string containing presets
	 * @return {Object} Result with success status and details
	 */
	importCustomPresets(jsonString) {

		try {
			const presets = JSON.parse(jsonString);
			let imported = 0;
			let failed = 0;

			for (const [name, config] of Object.entries(presets)) {
				if (this.addPreset(name, config)) {
					imported++;
				} else {
					failed++;
				}
			}

			return {
				success: true,
				imported,
				failed,
				message: `Imported ${imported} presets, ${failed} failed`
			};

		} catch (error) {

			return {
				success: false,
				error: error.message,
				message: 'Failed to parse JSON'
			};
		}
	}
}

export default PresetFactory;