
import Command from '../base/Command.js';
import SettingsValidator from '../../core/SettingsValidator.js';
import Settings from '../../core/Settings.js';


/**
 * Represents a command to manage and control training timelines.
 * The class allows for starting, stopping, checking the status, skipping, and listing available timelines.
 * Now uses centralized configuration for valid subcommands.
 */
class TimelineCommand extends Command {

	/**
	 * Constructs an instance of the class and initializes it with the provided core object.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the specified subcommand with its arguments.
	 * Uses centralized validation for subcommands.
	 */
	execute(args) {

		if (!this.validateArgs(args)) {
			console.log(`💡 ${this.getUsage()}`);
			return;
		}

		const subcommand = args[0];
		const subArgs = args.slice(1);

		// TODO: Hardcoded commands
		switch(subcommand) {
			case 'start':
				this._executeStart(subArgs);
				break;

			case 'stop':
				this._executeStop();
				break;

			case 'status':
				this._executeStatus();
				break;

			case 'skip':
				this._executeSkip();
				break;

			case 'list':
				this._executeList();
				break;

			default:
				console.log('❌ Invalid timeline subcommand');
				console.log(`💡 ${this.getUsage()}`);
		}
	}


	/**
	 * Executes the start process for a specified timeline type.
	 */
	_executeStart(args) {

		const timelineType = args[0] || 'basic_training';
		this._core.startTimeline(timelineType);
	}


	/**
	 * Stops the timeline execution by invoking the stopTimeline method of the core.
	 */
	_executeStop() {

		this._core.stopTimeline();
	}


	/**
	 * Executes the status retrieval from the timeline using the core functionality.
	 */
	_executeStatus() {

		this._core.getTimelineStatus();
	}


	/**
	 * Executes the skip functionality by progressing the timeline section.
	 */
	_executeSkip() {

		this._core.skipTimelineSection();
	}


	/**
	 * Executes the logic to display a list of available timelines.
	 */
	_executeList() {

		this._showAvailableTimelines();
	}


	/**
	 * Displays a list of available timelines for training, along with their descriptions.
	 */
	_showAvailableTimelines() {

		// TODO: Hardcoded Timelines
		console.log('🎬 Available Training Timelines:');
		console.log('   basic_training     - Progressive basic training');
		console.log('   rhythm_challenge   - Advanced rhythmic challenge');
		console.log('   tempo_crescendo    - Gradual tempo crescendo');
		console.log('💡 Usage: timeline start [type]');
	}


	/**
	 * Validates the provided arguments using centralized subcommand validation.
	 */
	validateArgs(args) {

		return args.length > 0 && SettingsValidator.isValidTimelineSubcommand(args[0]);
	}


	/**
	 * Retrieves the usage instructions using centralized subcommand list.
	 */
	getUsage() {

		const validSubcommands = Settings.commandConstants.timelineSubcommands.join('|');
		return `Usage: timeline [${validSubcommands}] [options...]`;
	}


	/**
	 * Retrieves the description of the functionality provided by this method.
	 */
	getDescription() {

		return 'Manages training timelines with multiple sections and patterns';
	}
}

export default TimelineCommand;