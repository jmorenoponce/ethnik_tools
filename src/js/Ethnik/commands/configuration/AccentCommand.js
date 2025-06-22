import Command from '../base/Command.js';

/**
 * Represents a command to enable or disable beat accents within the core metronome.
 * The AccentCommand allows users to toggle accentuation on strong beats by providing
 * appropriate arguments such as 'on', 'off', 'true', 'false', '1', or '0'.
 * This class extends the base Command class.
 */
class AccentCommand extends Command {

	/**
	 * Creates an instance of the class and initializes it with the provided core object.
	 *
	 * @param {Object} core - The core object used for initializing the instance.
	 * @return {Object} An instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the method to set the accent state based on the provided arguments.
	 *
	 * @param {Array} args - An array of arguments where the first element specifies the accent state.
	 * It can be 'on', 'true', or '1' to enable the accent; otherwise, it will disable it.
	 *
	 * @return {void} This method does not return any value.
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
	 * Validates the provided arguments to ensure they meet specific criteria.
	 *
	 * @param {Array<string>} args - An array of strings representing the arguments to validate.
	 * @return {boolean} Returns true if the first argument exists and is one of the allowed values ('on', 'off', 'true', 'false', '1', '0'), otherwise false.
	 */
	validateArgs(args) {

		return args.length > 0 && ['on', 'off', 'true', 'false', '1', '0'].includes(args[0]);
	}


	/**
	 * Retrieves the usage string that provides guidance on how to use the accent feature.
	 *
	 * @return {string} A string indicating the correct usage of the accent feature, e.g., "Usage: accent [on/off]".
	 */
	getUsage() {

		return 'Usage: accent [on/off]';
	}


	/**
	 * Retrieves the description of the method.
	 *
	 * @return {string} A string describing the functionality of enabling or disabling beat accents (emphasis on strong beats).
	 */
	getDescription() {

		return 'Enables or disables beat accents (emphasis on strong beats)';
	}
}

export default AccentCommand;