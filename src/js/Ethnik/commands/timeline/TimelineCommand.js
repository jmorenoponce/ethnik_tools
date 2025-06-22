import Command from '../base/Command.js';


/**
 * Represents a command to manage and control training timelines.
 * The class allows for starting, stopping, checking the status, skipping, and listing available timelines.
 * It processes specific subcommands (e.g., start, stop) and performs corresponding operations via the provided core instance.
 */
class TimelineCommand extends Command {

	/**
	 * Constructs an instance of the class and initializes it with the provided core object.
	 *
	 * @param {Object} core - The core object used for initialization.
	 * @return {undefined} This constructor does not return a value.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the specified subcommand with its arguments.
	 *
	 * @param {Array<string>} args - The array of arguments where the first element is the subcommand,
	 * and the remaining elements are the arguments for that subcommand.
	 * @return {void} This method does not return a value but performs operations based on the subcommand.
	 */
	execute(args) {

		if (!this.validateArgs(args)) {
			console.log(`💡 ${this.getUsage()}`);
			return;
		}

		const subcommand = args[0];
		const subArgs = args.slice(1);

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
	 *
	 * @param {Array} args - An array of arguments where the first element specifies the type of timeline.
	 *                        If not provided, defaults to 'basic_training'.
	 * @return {void} This method does not return any value.
	 */
	_executeStart(args) {

		const timelineType = args[0] || 'basic_training';
		this._core.startTimeline(timelineType);
	}


	/**
	 * Stops the timeline execution by invoking the stopTimeline method of the core.
	 *
	 * @return {void} Does not return a value.
	 */
	_executeStop() {

		this._core.stopTimeline();
	}


	/**
	 * Executes the status retrieval from the timeline using the core functionality.
	 *
	 * @return {void} This method does not return a value.
	 */
	_executeStatus() {

		this._core.getTimelineStatus();
	}


	/**
	 * Executes the skip functionality by progressing the timeline section.
	 *
	 * This method triggers the associated core functionality to skip the current section of the timeline being processed.
	 *
	 * @return {void} Does not return a value.
	 */
	_executeSkip() {

		this._core.skipTimelineSection();
	}


	/**
	 * Executes the logic to display a list of available timelines.
	 *
	 * This method internally invokes `_showAvailableTimelines` to handle the display
	 * of timelines that are currently available.
	 *
	 * @return {void} Does not return any value.
	 */
	_executeList() {

		this._showAvailableTimelines();
	}


	/**
	 * Displays a list of available timelines for training, along with their descriptions.
	 * The output includes the timeline names and their respective purposes.
	 *
	 * @return {void} No return value. Outputs the information directly to the console.
	 */
	_showAvailableTimelines() {

		console.log('🎬 Available Training Timelines:');
		console.log('   basic_training     - Progressive basic training');
		console.log('   rhythm_challenge   - Advanced rhythmic challenge');
		console.log('   tempo_crescendo    - Gradual tempo crescendo');
		console.log('💡 Usage: timeline start [type]');
	}


	/**
	 * Validates the provided arguments to ensure they contain a valid subcommand.
	 *
	 * @param {Array} args - An array of arguments where the first element is expected to be a subcommand.
	 * @return {boolean} Returns true if the first argument is a valid subcommand, otherwise false.
	 */
	validateArgs(args) {

		if (args.length === 0) return false;

		const validSubcommands = ['start', 'stop', 'status', 'skip', 'list'];
		return validSubcommands.includes(args[0]);
	}


	/**
	 * Retrieves the usage instructions for the timeline command.
	 *
	 * @return {string} A string describing the syntax and available options for the timeline command.
	 */
	getUsage() {

		return 'Usage: timeline [start|stop|status|skip|list] [options...]';
	}


	/**
	 * Retrieves the description of the functionality provided by this method.
	 *
	 * @return {string} A brief description of how training timelines and patterns are managed.
	 */
	getDescription() {

		return 'Manages training timelines with multiple sections and patterns';
	}
}

export default TimelineCommand;