import Command from '../Command.js';


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


/**
 * Division command implementation.
 */
class DivisionCommand extends Command {

	/**
	 * Creates a new DivisionCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the division command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.setDivision(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates division command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0;
	}


	/**
	 * Gets usage help text for the division command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: div [1-16]';
	}


	/**
	 * Gets a description of the division command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Sets the beat division (1=quarter notes, 2=eighth notes, etc.)';
	}
}


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


/**
 * Pattern command implementation.
 */
class PatternCommand extends Command {

	/**
	 * Creates a new PatternCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the pattern command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		if (this.validateArgs(args)) {
			this._core.setPattern(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates pattern command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		return args.length > 0 && ['straight', 'swing', 'custom'].includes(args[0]);
	}


	/**
	 * Gets usage help text for the pattern command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: pattern [straight/swing/custom]';
	}


	/**
	 * Gets a description of the pattern command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Sets the rhythmic pattern (straight, swing, or custom)';
	}
}


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

export { BpmCommand, DivisionCommand, AccentCommand, PatternCommand, VolumeCommand };