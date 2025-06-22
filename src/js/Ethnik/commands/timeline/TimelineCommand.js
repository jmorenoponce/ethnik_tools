import Command from '../base/Command.js';


/**
 * Timeline command implementation with subcommand handling.
 */
class TimelineCommand extends Command {

	/**
	 * Creates a new TimelineCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the timeline command with subcommands.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
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
	 * Executes the timeline start subcommand.
	 *
	 * @param {Array<string>} args - Subcommand arguments.
	 * @return {void} No return value.
	 */
	_executeStart(args) {
		const timelineType = args[0] || 'basic_training';
		this._core.startTimeline(timelineType);
	}


	/**
	 * Executes the timeline stop subcommand.
	 *
	 * @return {void} No return value.
	 */
	_executeStop() {
		this._core.stopTimeline();
	}


	/**
	 * Executes the timeline status subcommand.
	 *
	 * @return {void} No return value.
	 */
	_executeStatus() {
		this._core.getTimelineStatus();
	}


	/**
	 * Executes the timeline skip subcommand.
	 *
	 * @return {void} No return value.
	 */
	_executeSkip() {
		this._core.skipTimelineSection();
	}


	/**
	 * Executes the timeline list subcommand.
	 *
	 * @return {void} No return value.
	 */
	_executeList() {
		this._showAvailableTimelines();
	}


	/**
	 * Shows available timeline types.
	 *
	 * @return {void} No return value.
	 */
	_showAvailableTimelines() {
		console.log('🎬 Available Training Timelines:');
		console.log('   basic_training     - Progressive basic training');
		console.log('   rhythm_challenge   - Advanced rhythmic challenge');
		console.log('   tempo_crescendo    - Gradual tempo crescendo');
		console.log('💡 Usage: timeline start [type]');
	}


	/**
	 * Validates timeline command arguments.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid.
	 */
	validateArgs(args) {
		if (args.length === 0) return false;

		const validSubcommands = ['start', 'stop', 'status', 'skip', 'list'];
		return validSubcommands.includes(args[0]);
	}


	/**
	 * Gets usage help text for the timeline command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: timeline [start|stop|status|skip|list] [options...]';
	}


	/**
	 * Gets a description of the timeline command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Manages training timelines with multiple sections and patterns';
	}
}

export default TimelineCommand;