import Command from "../base/Command.js";

/**
 * Exit command implementation.
 */
class ExitCommand extends Command {

	/**
	 * Creates a new ExitCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the exit command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {

		console.log('\n👋 Goodbye!');

		// Handle graceful shutdown asynchronously
		this._gracefulExit();
	}


	/**
	 * Handles graceful application exit.
	 *
	 * @return {Promise<void>} Resolves when exit is complete.
	 */
	async _gracefulExit() {

		try {
			// Stop playback if running
			if (this._core.isPlaying) {
				console.log('⏹️ Stopping playback...');
				this._core.stop();
			}

			// Check if destroy method exists and is async
			if (typeof this._core.destroy === 'function') {
				console.log('🧹 Cleaning up system...');
				const destroyResult = this._core.destroy();

				// If destroy returns a promise, await it
				if (destroyResult && typeof destroyResult.then === 'function') {
					await destroyResult;
				}
			} else {
				console.log('🧹 Basic cleanup...');
				// Fallback cleanup for older Core version
			}

			console.log('✅ System shutdown complete');

			// Exit process
			process.exit(0);

		} catch (error) {
			console.error('❌ Error during shutdown:', error.message);

			// Force exit if graceful shutdown fails
			console.log('🚨 Forcing exit...');
			process.exit(1);
		}
	}


	/**
	 * Gets usage help text for the exit command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {

		return 'Usage: exit | quit';
	}


	/**
	 * Gets a description of the exit command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {

		return 'Exits the application gracefully with proper cleanup';
	}
}

export default ExitCommand;