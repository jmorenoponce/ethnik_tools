import Command from "../base/Command.js";

/**
 * Tap tempo command implementation.
 */
class TapCommand extends Command {

	/**
	 * Creates a new TapCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the tap tempo command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		this._core.tapTempo();
	}


	/**
	 * Gets usage help text for the tap command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: tap';
	}


	/**
	 * Gets a description of the tap command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Tap to detect and set the tempo (requires 2+ taps)';
	}
}

export default TapCommand;