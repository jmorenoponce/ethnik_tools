import Command from "../base/Command.js";

/**
 * Stop command implementation.
 */
class StopCommand extends Command {

	/**
	 * Creates a new StopCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the stop command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		this._core.stop();
	}


	/**
	 * Gets usage help text for the stop command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'stop';
	}


	/**
	 * Gets a description of the stop command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Stops the metronome playback';
	}
}

export default StopCommand;