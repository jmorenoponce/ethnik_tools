
import Command from "../base/Command.js";
import SettingsValidator from "../../core/SettingsValidator.js";
import Settings from "../../core/Settings.js";


/**
 * Defines a command to set a rhythmic pattern using a metronome's core functionality.
 * This class extends the Command base class and provides validation, execution, and descriptive information.
 * Now uses centralized configuration instead of hardcoded values.
 */
class PatternCommand extends Command {

	/**
	 * Constructs an instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the method logic by validating the provided arguments and setting the pattern in the core component.
	 * Uses centralized validation instead of hardcoded pattern list.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setPattern(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments using centralized configuration.
	 */
	validateArgs(args) {

		return args.length > 0 && SettingsValidator.isValidPattern(args[0]);
	}


	/**
	 * Provides usage information using centralized pattern definitions.
	 */
	getUsage() {

		const validPatterns = Settings.commandConstants.validPatterns.join('/');
		return `Usage: pattern [${validPatterns}]`;
	}


	/**
	 * Retrieves the description of the rhythmic pattern.
	 */
	getDescription() {

		return 'Sets the rhythmic pattern (straight, swing, or custom)';
	}
}

export default PatternCommand;