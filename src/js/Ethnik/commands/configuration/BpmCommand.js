import Command from '../base/Command.js';


/**
 * Class representing a BPM (Beats Per Minute) command.
 * This command is used to set the tempo of a metronome.
 */
class BpmCommand extends Command {

	/**
	 * Constructor for initializing a new instance of the class.
	 *
	 * @param {Object} core - The core object to be associated with this instance.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the method logic by validating the provided arguments and setting the tempo if valid.
	 *
	 * @param {Array} args - The input arguments where the first element is used to set the tempo.
	 * @return {void} - Does not return a value. Logs usage information if the arguments are invalid.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setTempo(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet specific criteria.
	 *
	 * @param {Array} args - An array of arguments to validate.
	 * @return {boolean} Returns true if the arguments array contains at least one element, otherwise returns false.
	 */
	validateArgs(args) {

		return args.length > 0;
	}


	/**
	 * Retrieves the usage information for the application.
	 *
	 * @return {string} A string containing the usage information, typically describing permissible input values or format.
	 */
	getUsage() {

		return 'Usage: bpm [20-218]';
	}


	/**
	 * Retrieves the description for the functionality of the method.
	 *
	 * @return {string} The description of the method's purpose or behavior.
	 */
	getDescription() {

		return 'Sets the metronome tempo in beats per minute';
	}
}

export default BpmCommand;



