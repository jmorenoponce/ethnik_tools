
import Command from "../base/Command.js";

/**
 * Represents a command to exit the application gracefully.
 * This command stops playback if running, performs cleanup operations, and exits the process.
 *
 * Extends the `Command` class.
 */
class ExitCommand extends Command {

	/**
	 * Initializes a new instance of the class.
	 *
	 * @param {Object} core - The core instance or configuration required for initialization.
	 * @return {void}
	 */
	constructor(core) {

		super();
		this._core = core;
	}


	/**
	 * Executes the shutdown routine and handles graceful application termination.
	 *
	 * @param {Object} args - Arguments or parameters required to process the execution.
	 * @return {void} Does not return a value.
	 */
	execute(args) {

		console.log('\n👋 Goodbye!');

		// Handle graceful shutdown asynchronously
		this._gracefulExit();
	}


	/**
	 * Handles the graceful shutdown of the application by stopping any ongoing processes, performing cleanup,
	 * and exiting the Node.js process. Stops playback if running, attempts cleanup using the destroy method
	 * (if available), and exits the process with an appropriate exit code.
	 *
	 * @return {Promise<void>} A promise that resolves when the shutdown process has completed successfully.
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
	 * Retrieves the usage instructions for the command.
	 *
	 * @return {string} A string representing the usage instructions.
	 */
	getUsage() {

		return 'Usage: exit | quit';
	}


	/**
	 * Provides a description of the action performed by the method.
	 *
	 * @return {string} A brief explanation of what this method does.
	 */
	getDescription() {

		return 'Exits the application gracefully with proper cleanup';
	}
}

export default ExitCommand;