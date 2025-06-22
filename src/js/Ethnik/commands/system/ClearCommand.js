import Command from "../base/Command.js";

/**
 * Represents a command to clear the console screen and reinitialize the display.
 * Extends the base Command class.
 */
class ClearCommand extends Command {

	/**
	 * Creates an instance of the class and initializes the core property.
	 *
	 * @param {Object} core - An object representing the core logic or functionality that the class interacts with.
	 * @return {Object} A new instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the core functionality by initializing the core and clearing the console.
	 *
	 * @param {Object} args - An object containing the arguments necessary for execution.
	 * @return {void} This method does not return a value.
	 */
	execute(args) {

		console.clear();
		this._core.initialize();
	}


	/**
	 * Retrieves a string describing the usage instructions for a command.
	 *
	 * @return {string} The usage instructions for the command.
	 */
	getUsage() {

		return 'Usage: clear';
	}


	/**
	 * Provides a description of the functionality performed by the method.
	 *
	 * @return {string} A string explaining the operation of the method.
	 */
	getDescription() {

		return 'Clears the console screen and reinitializes the display';
	}
}

export default ClearCommand;