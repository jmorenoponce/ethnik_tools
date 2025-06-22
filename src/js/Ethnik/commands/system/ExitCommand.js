import Command from "../base/Command.js";

/**
 * Exit command implementation.
 */
class ExitCommand extends Command {

	/**
	 * Creates a new ExitCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the exit command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		console.log('\n👋 Goodbye!');
		if (this._core._isPlaying) {
			this._core.stop();
		}
		this._core.destroy();
		process.exit(0);
	}


	/**
	 * Gets usage help text for the exit command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: exit | quit';
	}


	/**
	 * Gets a description of the exit command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Exits the application gracefully';
	}
}

export default ExitCommand;