
import Command from "../base/Command.js";


/**
 * Represents a tap tempo command that allows the user to detect and set the tempo
 * by tapping a rhythm. Designed to be integrated with a core metronome instance.
 */
class TapCommand extends Command {

	/**
	 * Creates an instance of the class.
	 *
	 * @param {Object} core - The core object responsible for main functionalities.
	 * @return {Constructor} A new instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the core functionality encapsulated within the `tapTempo` method.
	 *
	 * @param {Object} args - The arguments required for the execution context.
	 * @return {void} This method does not return any value.
	 */
	execute(args) {

		this._core.tapTempo();
	}


	/**
	 * Retrieves the usage instructions or information.
	 *
	 * @return {string} A string representing the usage details.
	 */
	getUsage() {

		return 'Usage: tap';
	}


	/**
	 * Retrieves the description for the tap-to-detect-and-set-tempo functionality.
	 *
	 * @return {string} The description of the tempo detection feature, indicating it requires 2 or more taps.
	 */
	getDescription() {

		return 'Tap to detect and set the tempo (requires 2+ taps)';
	}
}

export default TapCommand;