import Command from '../base/Command.js';


/**
 * Represents a command that displays help information about available commands.
 */
class HelpCommand extends Command {

	/**
	 * Creates an instance of the class and initializes it with the provided console manager.
	 *
	 * @param {Object} consoleManager - An instance of the console manager used for managing console operations.
	 * @return {void}
	 */
	constructor(consoleManager) {

		super();
		this._consoleManager = consoleManager;
	}


	/**
	 * Executes a command to display help information.
	 *
	 * @param {string[]} args - An array of arguments specifying the command to display help for. If no arguments are provided, general help information is shown.
	 * @return {void} This method does not return a value.
	 */
	execute(args) {

		if (args.length > 0) {
			// Show help for specific command
			this._showCommandHelp(args[0]);
		} else {
			// Show general help
			this._consoleManager.showHelp();
		}
	}


	/**
	 * Displays help information for a specific command.
	 *
	 * @param {string} commandName - The name of the command to display help for.
	 * @return {void} This method does not return any value.
	 */
	_showCommandHelp(commandName) {

		const commands = this._consoleManager.getCommands();
		const command = commands.get(commandName.toLowerCase());

		if (command) {
			console.log(`📖 Help for '${commandName}':`);
			console.log(`   Description: ${command.getDescription()}`);
			console.log(`   ${command.getUsage()}`);
		} else {
			console.log(`❌ Unknown command: '${commandName}'`);
			console.log("💡 Type 'help' to see all available commands");
		}
	}


	/**
	 * Provides usage instructions for commands within the application.
	 *
	 * @return {string} A string describing how to use the application commands.
	 */
	getUsage() {

		return 'Usage: help [command_name]';
	}


	/**
	 * Provides a description detailing the help information for commands.
	 *
	 * @return {string} A string containing the help description.
	 */
	getDescription() {

		return 'Shows help information for commands';
	}
}

export default HelpCommand;