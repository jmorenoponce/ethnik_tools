import Command from '../base/Command.js';

/**
 * Status command implementation.
 */
class StatusCommand extends Command {

	/**
	 * Creates a new StatusCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the status command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		this._core.getStatus();
	}


	/**
	 * Gets usage help text for the status command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: status';
	}


	/**
	 * Gets a description of the status command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Shows the current metronome status and configuration';
	}
}

export default StatusCommand;