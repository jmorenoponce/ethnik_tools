import Command from "../base/Command.js";

/**
 * Clear command implementation.
 */
class ClearCommand extends Command {

	/**
	 * Creates a new ClearCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the clear command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		console.clear();
		this._core._initialize();
	}


	/**
	 * Gets usage help text for the clear command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: clear';
	}


	/**
	 * Gets a description of the clear command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Clears the console screen and reinitializes the display';
	}
}

export default ClearCommand;