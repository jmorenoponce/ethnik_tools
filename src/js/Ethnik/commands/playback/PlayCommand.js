import Command from '../base/Command.js';


/**
 * Play command implementation.
 */
class PlayCommand extends Command {

	/**
	 * Creates a new PlayCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the play command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		this._core.play();
	}


	/**
	 * Gets usage help text for the play command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'play | start';
	}


	/**
	 * Gets a description of the play command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Starts the metronome playback';
	}
}



export default PlayCommand;