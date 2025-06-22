import Command from '../base/Command.js';


/**
 * BPM command implementation.
 */
class BpmCommand extends Command {

	/**
	 * Creates a new BpmCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the BPM command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.setTempo(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates BPM command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0;
	}


	/**
	 * Gets usage help text for the BPM command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: bpm [20-218]';
	}


	/**
	 * Gets a description of the BPM command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Sets the metronome tempo in beats per minute';
	}
}

export default BpmCommand;



