// =============================================================================
// PresetCommand.js - VERSIÓN SIMPLIFICADA QUE FUNCIONA
// =============================================================================

import Command from '../base/Command.js';
import Settings from '../../core/Settings.js';

/**
 * Represents a command to load predefined metronome configuration presets.
 * Simplified version that works with the existing architecture.
 */
class PresetCommand extends Command {

	/**
	 * Initializes a new instance of the class with the specified core.
	 *
	 * @param {Object} core - The core object used to initialize the instance.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the given command with the specified arguments.
	 *
	 * @param {Array} args - An array of arguments where the first element is the preset name to load.
	 * @return {void} This method does not return a value.
	 */
	execute(args) {

		if (args.length === 0) {
			this._showAvailablePresets();
			return;
		}

		const subcommand = args[0].toLowerCase();

		// Manejar subcomandos especiales
		if (subcommand === 'list') {
			this._showDetailedPresetList();
			return;
		}

		if (subcommand === 'info') {
			if (args.length > 1) {
				this._showPresetInfo(args[1]);
			} else {
				console.log('❌ Please specify a preset name for info');
				console.log('💡 Usage: preset info [preset_name]');
				console.log('💡 Example: preset info jazz');
			}
			return;
		}

		// Cargar preset normal
		if (this.validateArgs(args)) {
			this._core.loadPreset(args[0]);
		} else {
			console.log(`❌ Invalid preset: ${args[0]}`);
			this._showAvailablePresets();
		}
	}


	/**
	 * Shows all available presets organized by category.
	 * Uses Settings directly instead of trying to access PresetFactory.
	 */
	_showAvailablePresets() {

		try {
			// ✅ SIMPLIFICADO: Usar Settings directamente
			const presetDefinitions = Settings.presetDefinitions;
			const presetCategories = Settings.presetCategories;

			console.log('🎵 Available Presets:');

			// Mostrar por categorías usando Settings
			if (presetCategories && presetCategories.byGenre) {
				for (const [category, presets] of Object.entries(presetCategories.byGenre)) {
					if (presets.length > 0) {
						const categoryName = this._getCategoryDisplayName(category);
						console.log(`   ${categoryName}: ${presets.join(', ')}`);
					}
				}
			} else {
				// Fallback: mostrar todos los presets disponibles
				const allPresets = Object.keys(presetDefinitions);
				console.log(`   All: ${allPresets.join(', ')}`);
			}

			// Obtener primeros 4 presets para el usage
			const allPresetNames = Object.keys(presetDefinitions);
			const firstFour = allPresetNames.slice(0, 4);

			console.log(`\n💡 Usage: preset [${firstFour.join('/')}...]`);
			console.log('💡 Advanced: preset list, preset info [name]');

		} catch (error) {
			// Fallback absoluto
			console.log('💡 Available presets: classical, jazz, rock, latin, ballad, funk, metal, reggae');
			console.log('💡 Usage: preset [classical/jazz/rock/latin/ballad/funk/metal/reggae]');
		}
	}


	/**
	 * Shows detailed preset list with all information.
	 */
	_showDetailedPresetList() {

		try {
			// ✅ SIMPLIFICADO: Usar Settings directamente
			const presetDefinitions = Settings.presetDefinitions;

			console.log('🎵 Detailed Preset List:\n');

			for (const [name, preset] of Object.entries(presetDefinitions)) {
				const difficultyIcon = this._getDifficultyIcon(preset.difficulty);

				console.log(`   ${difficultyIcon} ${preset.name || name}`);
				console.log(`      📊 ${preset.bpm} BPM, ${this._getDivisionName(preset.division)}, Accent: ${preset.accent ? 'Yes' : 'No'}`);

				if (preset.description) {
					console.log(`      📝 ${preset.description}`);
				}

				if (preset.genre && preset.difficulty) {
					console.log(`      🏷️ ${preset.genre} • ${preset.difficulty}`);
				}
				console.log();
			}

		} catch (error) {
			console.log('❌ Error showing detailed presets. Use basic command: preset');
		}
	}


	/**
	 * Shows detailed information about a specific preset.
	 */
	_showPresetInfo(presetName) {

		try {
			// ✅ SIMPLIFICADO: Usar Settings directamente
			const presetDefinitions = Settings.presetDefinitions;
			const preset = presetDefinitions[presetName];

			if (!preset) {
				console.log(`❌ Preset '${presetName}' not found`);
				this._showAvailablePresets();
				return;
			}

			console.log(`🎵 Preset Info: ${preset.name || presetName}\n`);

			// Configuración básica
			console.log('📊 Configuration:');
			console.log(`   🎼 Tempo: ${preset.bpm} BPM`);
			console.log(`   📏 Division: ${this._getDivisionName(preset.division)}`);
			console.log(`   🎯 Accents: ${preset.accent ? 'Enabled' : 'Disabled'}`);

			// Metadata si está disponible
			if (preset.description) {
				console.log(`\n📝 Description: ${preset.description}`);
			}

			if (preset.genre || preset.difficulty) {
				console.log('\n🏷️ Classification:');
				if (preset.genre) console.log(`   🎸 Genre: ${preset.genre}`);
				if (preset.difficulty) console.log(`   📈 Difficulty: ${preset.difficulty}`);
			}

			if (preset.characteristics) {
				console.log(`\n✨ Characteristics: ${preset.characteristics.join(', ')}`);
			}

			if (preset.recommendedFor) {
				console.log(`\n🎯 Recommended for: ${preset.recommendedFor.join(', ')}`);
			}

			console.log(`\n💡 Usage: preset ${presetName}`);

		} catch (error) {
			console.log(`❌ Error showing preset info. Try: preset ${presetName}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet the required conditions.
	 *
	 * @param {Array} args - The array of arguments to validate.
	 * @return {boolean} Returns true if the arguments are valid, false otherwise.
	 */
	validateArgs(args) {

		if (args.length === 0) return false;

		const presetName = args[0].toLowerCase();

		// Comandos especiales siempre válidos
		if (['list', 'info'].includes(presetName)) {
			return true;
		}

		try {
			// ✅ SIMPLIFICADO: Validar contra Settings directamente
			const presetDefinitions = Settings.presetDefinitions;
			return Object.prototype.hasOwnProperty.call(presetDefinitions, presetName);
		} catch (error) {
			// Fallback: validar contra presets conocidos
			const basicPresets = ['classical', 'jazz', 'rock', 'latin', 'ballad', 'funk', 'metal', 'reggae'];
			return basicPresets.includes(presetName);
		}
	}


	/**
	 * Provides a string detailing the usage instructions for the preset command.
	 *
	 * @return {string} A message describing the proper usage of preset options.
	 */
	getUsage() {

		return 'Usage: preset [name] | preset list | preset info [name]';
	}


	/**
	 * Retrieves the description of a predefined metronome configuration preset.
	 *
	 * @return {string} A string describing the purpose of the preset.
	 */
	getDescription() {

		return 'Loads predefined metronome presets or shows preset information';
	}


	/**
	 * Gets display name for categories.
	 */
	_getCategoryDisplayName(category) {

		const displayNames = {
			classical: '🎼 Classical',
			popular: '🎸 Popular',
			world: '🌍 World',
			extreme: '⚡ Extreme'
		};
		return displayNames[category] || `📂 ${category}`;
	}


	/**
	 * Gets icon for difficulty level.
	 */
	_getDifficultyIcon(difficulty) {

		const icons = {
			beginner: '🟢',
			intermediate: '🟡',
			advanced: '🔴',
			custom: '🛠️'
		};
		return icons[difficulty] || '📊';
	}


	/**
	 * Gets user-friendly division name.
	 */
	_getDivisionName(division) {

		const names = {
			1: 'Quarter notes',
			2: 'Eighth notes',
			3: 'Triplets',
			4: 'Sixteenth notes'
		};
		return names[division] || `Division ${division}`;
	}
}

export default PresetCommand;