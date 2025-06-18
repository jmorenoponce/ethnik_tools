import Command from '../Command.js';


/**
 * Preset command implementation.
 */
class PresetCommand extends Command {

	/**
	 * Creates a new PresetCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the preset command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.loadPreset(args[0]);
		} else {
			console.log('💡 Available presets: classical, jazz, rock, latin');
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates preset command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0;
	}


	/**
	 * Gets usage help text for the preset command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: preset [classical/jazz/rock/latin]';
	}


	/**
	 * Gets a description of the preset command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Loads a predefined metronome configuration preset';
	}
}


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

export { PresetCommand, TapCommand, StatusCommand };