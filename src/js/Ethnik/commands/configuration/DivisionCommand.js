
import Command from "../base/Command.js";
import SettingsValidator from "../../core/SettingsValidator.js";


/**
 * Represents a command to set the beat division for the core metronome instance.
 * Inherits from the base Command class.
 * Now uses centralized validation instead of hardcoded ranges.
 */
class DivisionCommand extends Command {

	/**
	 * Constructs an instance of the class with the provided core parameter.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes a defined operation based on the provided arguments.
	 * Uses centralized validation for division values.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setDivision(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments using centralized validation.
	 */
	validateArgs(args) {

		if (args.length === 0) return false;
		const division = parseInt(args[0]);
		return SettingsValidator.isValidDivision(division);
	}


	/**
	 * Retrieves the usage instructions for a specific command or function.
	 */
	getUsage() {

		return 'Usage: div [1-16]';
	}


	/**
	 * Returns the description of the beat division setting.
	 */
	getDescription() {

		return 'Sets the beat division (1=quarter notes, 2=eighth notes, etc.)';
	}
}

export default DivisionCommand;