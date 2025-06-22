import Command from "../base/Command.js";

/**
 * Division command implementation.
 */
class DivisionCommand extends Command {

	/**
	 * Creates a new DivisionCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the division command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.setDivision(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates division command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0;
	}


	/**
	 * Gets usage help text for the division command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: div [1-16]';
	}


	/**
	 * Gets a description of the division command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Sets the beat division (1=quarter notes, 2=eighth notes, etc.)';
	}
}

export default DivisionCommand;