/**
 * Represents an abstract command that can be executed with arguments.
 * Concrete implementations should extend this class to define specific behaviors.
 */
class Command {

	/**
	 * Executes a specific command. This method should be implemented by concrete command classes.
	 *
	 * @param {Array} args - An array of arguments required for executing the command. The content and structure of the array depend on the specific implementation.
	 * @return {any} The result of the command execution. The return type and value depend on the specific implementation.
	 * @throws {Error} If the method is not implemented in the concrete class.
	 */
	execute(args) {

		throw new Error('execute method must be implemented by concrete command classes');
	}


	/**
	 * Validates the arguments provided to a function.
	 *
	 * @param {Array|Object} args - The arguments to validate. Can be an array or an object containing parameters.
	 * @return {boolean} Returns true if the arguments are valid, otherwise false.
	 */
	validateArgs(args) {

		return true;
	}


	/**
	 * Provides usage information for the current function or program.
	 *
	 * @return {string} A string message indicating that no usage information is available.
	 */
	getUsage() {

		return 'No usage information available';
	}


	/**
	 * Retrieves the description associated with the method.
	 *
	 * @return {string} The description as a string. If no description is available, it returns 'No description available'.
	 */
	getDescription() {

		return 'No description available';
	}
}

export default Command;