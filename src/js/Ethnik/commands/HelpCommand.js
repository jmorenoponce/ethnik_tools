import Command from '../Command.js';


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


/**
 * Clear command implementation.
 */
class ClearCommand extends Command {

	/**
	 * Creates a new ClearCommand.
	 *
	 * @param {Object} core - Core metronome instance.
	 * @return {void} No return value.
	 */
	constructor(core) {
		super();
		this._core = core;
	}


	/**
	 * Executes the clear command.
	 *
	 * @param {Array<string>} args - Command arguments (unused).
	 * @return {void} No return value.
	 */
	execute(args) {
		console.clear();
		this._core._initialize();
	}


	/**
	 * Gets usage help text for the clear command.
	 *
	 * @return {string} Usage help text.
	 */
	getUsage() {
		return 'Usage: clear';
	}


	/**
	 * Gets a description of the clear command.
	 *
	 * @return {string} Command description.
	 */
	getDescription() {
		return 'Clears the console screen and reinitializes the display';
	}
}


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
		if (this._core._isPlaying) {
			this._core.stop();
		}
		this._core.destroy();
		process.exit(0);
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
		return 'Exits the application gracefully';
	}
}

export { HelpCommand, ClearCommand, ExitCommand };