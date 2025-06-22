import Command from "../base/Command.js";

/**
 * Volume command implementation.
 */
class VolumeCommand extends Command {

	/**
	 * Creates an instance of the class and initializes it with the provided core object.
	 *
	 * @param {Object} core - The core object used to initialize the instance.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes a command based on the provided arguments. If the arguments are valid,
	 * it sets the volume to the specified value. Otherwise, it displays usage information.
	 *
	 * @param {Array} args - An array of arguments passed to the command. The first argument is expected to be a volume value.
	 * @return {void} No return value. The method performs actions based on the validity of arguments.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setVolume(parseInt(args[0]));
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet specific criteria.
	 *
	 * @param {Array} args An array of arguments to validate. The first element is expected to be a value that can be converted into a numeric volume between 0 and 100.
	 * @return {boolean} Returns true if the arguments are valid; false otherwise.
	 */
	validateArgs(args) {

		if (args.length === 0) return false;
		const volume = parseInt(args[0]);
		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Retrieves the usage instructions for the method or command.
	 *
	 * @return {string} A string containing the usage information, formatted as "Usage: vol [0-100]".
	 */
	getUsage() {

		return 'Usage: vol [0-100]';
	}


	/**
	 * Provides a description of the functionality or purpose of the method.
	 *
	 * @return {string} A description detailing the metronome volume level setting.
	 */
	getDescription() {

		return 'Sets the metronome volume level (0-100%)';
	}
}

export default VolumeCommand;