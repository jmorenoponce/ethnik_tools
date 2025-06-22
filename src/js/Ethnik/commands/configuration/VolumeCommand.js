
import Command from "../base/Command.js";
import SettingsValidator from "../../core/SettingsValidator.js";


/**
 * Volume command implementation.
 * Now uses centralized validation instead of hardcoded ranges.
 */
class VolumeCommand extends Command {

	/**
	 * Creates an instance of the class and initializes it with the provided core object.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes a command based on the provided arguments. If the arguments are valid,
	 * it sets the volume to the specified value. Otherwise, it displays usage information.
	 * Uses centralized validation for volume range.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setVolume(parseInt(args[0]));
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments using centralized validation.
	 */
	validateArgs(args) {

		if (args.length === 0) return false;
		const volume = parseInt(args[0]);
		return SettingsValidator.isValidVolume(volume);
	}


	/**
	 * Retrieves the usage instructions for the method or command.
	 */
	getUsage() {

		return 'Usage: vol [0-100]';
	}


	/**
	 * Provides a description of the functionality or purpose of the method.
	 */
	getDescription() {

		return 'Sets the metronome volume level (0-100%)';
	}
}

export default VolumeCommand;