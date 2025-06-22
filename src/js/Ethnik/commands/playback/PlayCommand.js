import Command from '../base/Command.js';


/**
 * Represents a command to start the metronome playback.
 * Inherits from the `Command` class and provides functionality
 * to execute the play action on the associated metronome core.
 */
class PlayCommand extends Command {

	/**
	 * Constructor for creating an instance of the class.
	 *
	 * @param {Object} core - The core object required for initializing the instance.
	 * @return {Object} A new instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the core play functionality.
	 *
	 * @param {Object} args - The arguments required to execute the method. Can include additional options or configurations.
	 * @return {void} This method does not return a value.
	 */
	execute(args) {

		this._core.play();
	}


	/**
	 * Retrieves the usage information for a specific functionality.
	 *
	 * @return {string} A string describing the usage options, separated by a pipe ('|') symbol.
	 */
	getUsage() {

		return 'play | start';
	}


	/**
	 * Returns the description of the method's functionality.
	 *
	 * @return {string} A string describing the action or purpose of the method.
	 */
	getDescription() {

		return 'Starts the metronome playback';
	}
}

export default PlayCommand;