import Command from '../base/Command.js';


/**
 * Represents a command to load predefined metronome configuration presets.
 * Extends the base Command class to provide additional functionality specific
 * to managing and applying presets.
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

		if (this.validateArgs(args)) {
			this._core.loadPreset(args[0]);
		} else {
			console.log('💡 Available presets: classical, jazz, rock, latin');
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet the required conditions.
	 *
	 * @param {Array} args - The array of arguments to validate.
	 * @return {boolean} Returns true if the arguments are valid, false otherwise.
	 */
	validateArgs(args) {

		return args.length > 0;
	}


	/**
	 * Provides a string detailing the usage instructions for the preset command.
	 * @return {string} A message describing the proper usage of preset options.
	 */
	getUsage() {

		return 'Usage: preset [classical/jazz/rock/latin]';
	}


	/**
	 * Retrieves the description of a predefined metronome configuration preset.
	 *
	 * @return {string} A string describing the purpose of the preset.
	 */
	getDescription() {

		return 'Loads a predefined metronome configuration preset';
	}
}

export default PresetCommand;