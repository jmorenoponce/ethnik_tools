import Command from "../base/Command.js";

/**
 * Volume command implementation.
 */
class VolumeCommand extends Command {

	/**
	 * Creates a new VolumeCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the volume command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.setVolume(parseInt(args[0]));
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates volume command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		if (args.length === 0) return false;
		const volume = parseInt(args[0]);
		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Gets usage help text for the volume command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: vol [0-100]';
	}


	/**
	 * Gets a description of the volume command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Sets the metronome volume level (0-100%)';
	}
}

export default VolumeCommand;