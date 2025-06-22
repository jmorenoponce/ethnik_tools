
import Command from '../base/Command.js';
import Settings from '../../core/Settings.js';


/**
 * Class representing a BPM (Beats Per Minute) command.
 * This command is used to set the tempo of a metronome.
 * Now uses centralized configuration for BPM ranges.
 */
class BpmCommand extends Command {

	/**
	 * Constructor for initializing a new instance of the class.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the method logic by validating the provided arguments and setting the tempo if valid.
	 */
	execute(args) {

		if (this.validateArgs(args)) {
			this._core.setTempo(args[0]);
		} else {
			console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Validates the provided arguments to ensure they meet specific criteria.
	 */
	validateArgs(args) {

		return args.length > 0;
	}


	/**
	 * Retrieves the usage information using centralized BPM range configuration.
	 */
	getUsage() {

		const { bpmMin, bpmMax } = Settings.defaultParams;
		return `Usage: bpm [${bpmMin}-${bpmMax}]`;
	}


	/**
	 * Retrieves the description for the functionality of the method.
	 */
	getDescription() {

		return 'Sets the metronome tempo in beats per minute';
	}
}

export default BpmCommand;