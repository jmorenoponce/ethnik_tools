import Command from "../base/Command.js";

/**
 * Represents the StopCommand class, which stops the playback of a metronome.
 * Extends the Command class and provides functionality to issue a stop command.
 */
class StopCommand extends Command {

	/**
	 * Constructs an instance of the class with the specified core.
	 *
	 * @param {Object} core - The core object to initialize the instance with.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes a specific operation by stopping the core functionality.
	 *
	 * @param {Object} args - The arguments provided for execution. It can include required data or configurations.
	 * @return {void} This method does not return any value.
	 */
	execute(args) {

		this._core.stop();
	}


	/**
	 * Retrieves the current usage status.
	 *
	 * @return {string} The usage status, specifically the string 'stop'.
	 */
	getUsage() {

		return 'stop';
	}


	/**
	 * Retrieves the description of the method's function or purpose.
	 *
	 * @return {string} A string describing the method's functionality, which in this case is 'Stops the metronome playback'.
	 */
	getDescription() {

		return 'Stops the metronome playback';
	}
}

export default StopCommand;