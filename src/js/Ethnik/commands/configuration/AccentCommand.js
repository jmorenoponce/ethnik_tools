import Command from '../base/Command.js';

/**
 * Accent command implementation.
 */
class AccentCommand extends Command {

	/**
	 * Creates a new AccentCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the accent command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			const enabled = args[0] === 'on' || args[0] === 'true' || args[0] === '1';
			this._core.setAccent(enabled);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates accent command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0 && ['on', 'off', 'true', 'false', '1', '0'].includes(args[0]);
	}


	/**
	 * Gets usage help text for the accent command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: accent [on/off]';
	}


	/**
	 * Gets a description of the accent command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Enables or disables beat accents (emphasis on strong beats)';
	}
}

export default AccentCommand;