/**
 * Base Command class for the Command pattern implementation.
 * All command classes should extend this base class.
 */
class Command {

	/**
	 * Execute the command with given arguments.
	 * This method must be implemented by all concrete command classes.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
	 */
	execute(args) {
		throw new Error('execute method must be implemented by concrete command classes');
	}


	/**
	 * Validates command arguments.
	 * Override this method in concrete classes if argument validation is needed.
	 *
	 * @param {Array<string>} args - Command arguments to validate.
	 * @return {boolean} True if arguments are valid, false otherwise.
	 */
	validateArgs(args) {
		return true;
	}


	/**
	 * Gets usage help text for the command.
	 * Override this method in concrete classes to provide usage information.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'No usage information available';
	}


	/**
	 * Gets a description of what the command does.
	 * Override this method in concrete classes to provide command description.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'No description available';
	}
}

export default Command;