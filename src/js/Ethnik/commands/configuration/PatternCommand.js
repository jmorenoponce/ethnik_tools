import Command from "../base/Command.js";

/**
 * Defines a command to set a rhythmic pattern using a metronome's core functionality.
 * This class extends the Command base class and provides validation, execution, and descriptive information.
 */
class PatternCommand extends Command {

	/**
	 * Constructs an instance of the class.
	 *
	 * @param {Object} core - The core object to initialize the class with.
	 * @return {Object} A new instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the method logic by validating the provided arguments and setting the pattern in the core component.
	 *
	 * @param {Array} args - The arguments to be validated and processed. The first element of the array is expected to be used as a pattern if validation is successful.
	 * @return {void} This method does not return a value.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setPattern(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet specific criteria.
	 *
	 * @param {Array} args - An array of arguments to be validated. The first element should be a string matching 'straight', 'swing', or 'custom'.
	 * @return {boolean} Returns true if the arguments array is non-empty and the first argument matches one of the allowed values, otherwise false.
	 */
	validateArgs(args) {

		return args.length > 0 && ['straight', 'swing', 'custom'].includes(args[0]);
	}


	/**
	 * Provides usage information for the pattern command.
	 *
	 * @return {string} A string detailing the usage format and options for the pattern command.
	 */
	getUsage() {

		return 'Usage: pattern [straight/swing/custom]';
	}


	/**
	 * Retrieves the description of the rhythmic pattern.
	 *
	 * @return {string} A string describing the rhythmic pattern (e.g., straight, swing, or custom).
	 */
	getDescription() {

		return 'Sets the rhythmic pattern (straight, swing, or custom)';
	}
}

export default PatternCommand;