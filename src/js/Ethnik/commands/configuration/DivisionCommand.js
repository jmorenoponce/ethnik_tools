import Command from "../base/Command.js";

/**
 * Represents a command to set the beat division for the core metronome instance.
 * Inherits from the base Command class.
 */
class DivisionCommand extends Command {

	/**
	 * Constructs an instance of the class with the provided core parameter.
	 * Initializes the core property of the class.
	 *
	 * @param {Object} core - The core object used for initializing the instance.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes a defined operation based on the provided arguments.
	 *
	 * @param {Array} args An array of arguments required for the operation. The first element of this array should be the division to set.
	 * @return {void} This method does not return any values, but logs usage guidelines if the arguments are invalid.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setDivision(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet specific criteria.
	 *
	 * @param {Array} args - The list of arguments to validate.
	 * @return {boolean} Returns true if the arguments are valid, otherwise false.
	 */
	validateArgs(args) {

		return args.length > 0;
	}


	/**
	 * Retrieves the usage instructions for a specific command or function.
	 *
	 * @return {string} A string describing the usage format and allowed range.
	 */
	getUsage() {

		return 'Usage: div [1-16]';
	}


	/**
	 * Returns the description of the beat division setting.
	 *
	 * @return {string} A string describing the beat division, indicating the relationship between note types and values (e.g., 1 for quarter notes, 2 for eighth notes, etc.).
	 */
	getDescription() {

		return 'Sets the beat division (1=quarter notes, 2=eighth notes, etc.)';
	}
}

export default DivisionCommand;