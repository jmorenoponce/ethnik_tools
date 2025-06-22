import Command from '../base/Command.js';

/**
 * Represents a status command for the metronome.
 * This command shows the current status and configuration of the metronome.
 */
class StatusCommand extends Command {

	/**
	 * Creates an instance of the class and initializes it with the provided core object.
	 * The core object is stored internally for use within the class.
	 *
	 * @param {Object} core - The core object required for the initialization of the instance.
	 * @return {void} Does not return a value.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes a specific operation using the provided arguments.
	 *
	 * @param {Object} args - The arguments required for the operation.
	 * @return {void} This method does not return a value.
	 */
	execute(args) {

		this._core.getStatus();
	}


	/**
	 * Retrieves the usage information for the status command.
	 *
	 * @return {string} A string describing the usage instructions for the status command.
	 */
	getUsage() {

		return 'Usage: status';
	}


	/**
	 * Retrieves the description of the current metronome status and configuration.
	 *
	 * @return {string} The description of the current metronome status and configuration.
	 */
	getDescription() {

		return 'Shows the current metronome status and configuration';
	}
}

export default StatusCommand;