import Command from '../base/Command.js';


/**
 * Preset command implementation.
 */
class PresetCommand extends Command {

	/**
	 * Creates a new PresetCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the preset command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
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
	 * Validates preset command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0;
	}


	/**
	 * Gets usage help text for the preset command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: preset [classical/jazz/rock/latin]';
	}


	/**
	 * Gets a description of the preset command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Loads a predefined metronome configuration preset';
	}
}





export default PresetCommand;