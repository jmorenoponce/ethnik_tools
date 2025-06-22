import Command from '../base/Command.js';
import SettingsValidator from '../../core/SettingsValidator.js';
import Settings from '../../core/Settings.js';


/**
 * Represents a command to enable or disable beat accents within the core metronome.
 * The AccentCommand allows users to toggle accentuation on strong beats by providing
 * appropriate arguments. Now uses centralized configuration instead of hardcoded values.
 */
class AccentCommand extends Command {

	/**
	 * Constructor for creating an instance of the class.
	 *
	 * @param {Object} core - The core instance to be assigned to the class.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the primary functionality of the method based on the provided arguments.
	 * Validates the arguments and sets the accent state if validation passes.
	 *
	 * @param {Array} args - An array of arguments where the first item determines the accent's state.
	 *                       Accepted values for enabling are 'on', 'true', or '1'. Other values will disable it.
	 * @return {void} Does not return a value.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			const enabled = args[0] === 'on' || args[0] === 'true' || args[0] === '1';
			this._core.setAccent(enabled);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the arguments by checking their length and the validity of the first argument.
	 *
	 * @param {Array} args - The array of arguments to validate.
	 * @return {boolean} Returns true if the arguments array is not empty and the first argument is a valid accent value, otherwise false.
	 */
	validateArgs(args) {

		return args.length > 0 && SettingsValidator.isValidAccentValue(args[0]);
	}


	/**
	 * Retrieves the usage instructions for the accent command based on valid values.
	 *
	 * @return {string} A string detailing the usage format and valid options for the accent command.
	 */
	getUsage() {

		const validValues = Settings.commandConstants.validAccentValues.join('/');
		return `Usage: accent [${validValues}]`;
	}


	/**
	 * Retrieves the description of the method functionality.
	 *
	 * @return {string} A description indicating that the method enables or disables beat accents, emphasizing strong beats.
	 */
	getDescription() {

		return 'Enables or disables beat accents (emphasis on strong beats)';
	}
}

export default AccentCommand;