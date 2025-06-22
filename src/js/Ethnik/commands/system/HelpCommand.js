import Command from '../base/Command.js';


/**
 * Help command implementation.
 */
class HelpCommand extends Command {

	/**
	 * Creates a new HelpCommand.
	 *
	 * @param {Object} consoleManager - Console manager instance for showing help.
	 * @return {void} No return value.
	 */
	constructor(consoleManager) {
		super();
		this._consoleManager = consoleManager;
	}


	/**
	 * Executes the help command.
	 *
	 * @param {Array<string>} args - Command arguments.
	 * @return {void} No return value.
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
	 * Shows help for a specific command.
	 *
	 * @param {string} commandName - Name of the command to show help for.
	 * @return {void} No return value.
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
	 * Gets usage help text for the help command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: help [command_name]';
	}


	/**
	 * Gets a description of the help command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Shows help information for commands';
	}
}


export default HelpCommand;