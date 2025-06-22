import Command from "../base/Command.js";

/**
 * Pattern command implementation.
 */
class PatternCommand extends Command {

	/**
	 * Creates a new PatternCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the pattern command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.setPattern(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates pattern command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0 && ['straight', 'swing', 'custom'].includes(args[0]);
	}


	/**
	 * Gets usage help text for the pattern command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: pattern [straight/swing/custom]';
	}


	/**
	 * Gets a description of the pattern command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Sets the rhythmic pattern (straight, swing, or custom)';
	}
}

export default PatternCommand;