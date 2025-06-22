
import Settings from '../core/Settings.js';
import PlayCommand from "../commands/playback/PlayCommand.js";
import StopCommand from "../commands/playback/StopCommand.js";
import PatternCommand from "../commands/configuration/PatternCommand.js";
import VolumeCommand from "../commands/configuration/VolumeCommand.js";
import PresetCommand from "../commands/utility/PresetCommand.js";
import TapCommand from "../commands/utility/TapCommand.js";
import StatusCommand from "../commands/utility/StatusCommand.js";
import TimelineCommand from "../commands/timeline/TimelineCommand.js";
import HelpCommand from "../commands/system/HelpCommand.js";
import ClearCommand from "../commands/system/ClearCommand.js";
import ExitCommand from "../commands/system/ExitCommand.js";
import BpmCommand from "../commands/configuration/BpmCommand.js";
import DivisionCommand from "../commands/configuration/DivisionCommand.js";
import AccentCommand from "../commands/configuration/AccentCommand.js";


/**
 * Manages console interactions and input processing for a command-line interface.
 * This class handles user input, command registration, and execution,
 * while also managing command history and providing utilities like tab completion.
 */
class ConsoleManager {

	/**
	 * Constructs a new instance of the console interface with command handling capabilities.
	 *
	 * @param {Object} core - The core object that the console interacts with.
	 * @return {void} This constructor does not return a value.
	 */
	constructor(core) {

		this._core = core;
		this._commandHistory = [];
		this._historyIndex = -1;
		this._maxHistorySize = 50; // Memory management for command history
		this._inputBuffer = '';

		// Command registry using Command pattern
		this._commands = this._initializeCommands();

		// Store bound event handlers for cleanup
		this._boundHandlers = {
			keyInput: this._handleKeyInput.bind(this),
			exit: this._handleExit.bind(this)
		};

		this._initConsoleInterface();
	}


	/**
	 * Initializes and returns a map of command names to their corresponding command objects.
	 * This method sets up various commands, categorized into playback, configuration, preset, timeline, and system commands.
	 *
	 * @return {Map<string, Object>} A map containing command names as keys and their respective command objects as values.
	 */
	_initializeCommands() {

		const commands = new Map();

		// Playback commands
		commands.set('play', new PlayCommand(this._core));
		commands.set('start', new PlayCommand(this._core));
		commands.set('stop', new StopCommand(this._core));

		// Configuration commands
		commands.set('bpm', new BpmCommand(this._core));
		commands.set('tempo', new BpmCommand(this._core));
		commands.set('div', new DivisionCommand(this._core));
		commands.set('division', new DivisionCommand(this._core));
		commands.set('accent', new AccentCommand(this._core));
		commands.set('pattern', new PatternCommand(this._core));
		commands.set('vol', new VolumeCommand(this._core));
		commands.set('volume', new VolumeCommand(this._core));

		// Preset and utility commands
		commands.set('preset', new PresetCommand(this._core));
		commands.set('tap', new TapCommand(this._core));
		commands.set('status', new StatusCommand(this._core));

		// Timeline commands
		commands.set('timeline', new TimelineCommand(this._core));

		// System commands
		commands.set('help', new HelpCommand(this));
		commands.set('?', new HelpCommand(this));
		commands.set('clear', new ClearCommand(this._core));
		commands.set('exit', new ExitCommand(this._core));
		commands.set('quit', new ExitCommand(this._core));

		return commands;
	}


	/**
	 * Initializes the console interface for capturing user input.
	 * It sets up the necessary configurations for stdin to handle input
	 * and binds event handlers for various input/output operations.
	 *
	 * @return {void} This method does not return any value.
	 */
	_initConsoleInterface() {

		try {
			if (process.stdin.isTTY) {
				process.stdin.setRawMode(true);
			}
			process.stdin.setEncoding('utf8');
			process.stdin.resume();

			this._showCommands();
			this._showPrompt();

			// Use bound handlers for proper cleanup
			process.stdin.on('data', this._boundHandlers.keyInput);
			process.on('SIGINT', this._boundHandlers.exit);
			process.on('SIGTERM', this._boundHandlers.exit);
		} catch (error) {
			console.error("Failed to initialize console interface:", error);
			Settings.log("Console initialization error:", error);
		}
	}


	/**
	 * Handles keyboard input for a text-based interface. This method processes various key inputs like Enter, Backspace,
	 * arrow keys, and Tab to facilitate command execution, input editing, and navigation.
	 *
	 * @param {string} key - A single character or control sequence representing the key input to process. Examples include
	 *                       regular printable characters, control keys like Enter or Backspace, and ANSI escape sequences
	 *                       for arrow keys.
	 * @return {void} This method does not return a value, but it modifies the internal state, such as the input buffer
	 *                and command history, or triggers associated functionality like command execution or navigation.
	 */
	_handleKeyInput(key) {

		try {
			if (key === '\u0003') { // Ctrl+C
				this._handleExit();
				return;
			}

			if (key === '\r' || key === '\n') { // Enter
				if (this._inputBuffer.trim()) {
					this._processCommand(this._inputBuffer.trim());
					this._addToHistory(this._inputBuffer.trim());
				}
				this._inputBuffer = '';
				this._showPrompt();
				return;
			}

			if (key === '\u007f' || key === '\b') { // Backspace
				if (this._inputBuffer.length > 0) {
					this._inputBuffer = this._inputBuffer.slice(0, -1);
					process.stdout.write('\b \b');
				}
				return;
			}

			// Arrow keys for history navigation
			if (key === '\u001b[A') { // Up arrow
				this._navigateHistory(-1);
				return;
			}

			if (key === '\u001b[B') { // Down arrow
				this._navigateHistory(1);
				return;
			}

			// Tab for command completion
			if (key === '\t') {
				this._handleTabCompletion();
				return;
			}

			// Regular character input
			if (key >= ' ' && key <= '~') {
				this._inputBuffer += key;
				process.stdout.write(key);
			}
		} catch (error) {
			Settings.log("Error handling key input:", error);
		}
	}


	/**
	 * Handles tab completion functionality for the input buffer.
	 * Based on the current input, suggests or completes potential commands.
	 *
	 * If there is exactly one suggestion, it replaces the input with the suggestion.
	 * If there are multiple suggestions, it displays a list of suggestions to the user.
	 *
	 * @return {void}
	 */
	_handleTabCompletion() {

		const suggestions = this._getCommandSuggestions(this._inputBuffer);

		if (suggestions.length === 1) {
			// Complete the command
			this._clearCurrentInput();
			this._inputBuffer = suggestions[0];
			process.stdout.write(this._inputBuffer);
		} else if (suggestions.length > 1) {
			// Show suggestions
			console.log('\n💡 Suggestions:', suggestions.join(', '));
			this._showPrompt();
			process.stdout.write(this._inputBuffer);
		}
	}


	/**
	 * Navigates through the command history in the specified direction.
	 * Updates the command input based on the history index and displays the relevant historical command.
	 *
	 * @param {number} direction - The direction to navigate the history. Positive values move forward, negative values move backward.
	 * @return {void}
	 */
	_navigateHistory(direction) {

		if (this._commandHistory.length === 0) return;

		// Clear current input
		this._clearCurrentInput();

		// Update history index
		this._historyIndex += direction;
		this._historyIndex = Math.max(-1, Math.min(this._commandHistory.length - 1, this._historyIndex));

		// Display command from history
		if (this._historyIndex >= 0) {
			this._inputBuffer = this._commandHistory[this._historyIndex];
			process.stdout.write(this._inputBuffer);
		} else {
			this._inputBuffer = '';
		}
	}


	/**
	 * Clears the current input by moving the cursor to the beginning
	 * of the input and erasing the characters from the buffer.
	 *
	 * @return {void} This method does not return any value.
	 */
	_clearCurrentInput() {

		// Move cursor to beginning of input and clear line
		for (let i = 0; i < this._inputBuffer.length; i++) {
			process.stdout.write('\b \b');
		}
	}


	/**
	 * Adds a command to the history, ensuring no duplicate consecutive commands are added.
	 * Manages memory by limiting the history size to a maximum value.
	 *
	 * @param {string} command - The command to be added to the history.
	 * @return {void}
	 */
	_addToHistory(command) {

		// Don't add duplicate consecutive commands
		if (this._commandHistory.length > 0 && this._commandHistory[this._commandHistory.length - 1] === command) {
			this._historyIndex = this._commandHistory.length;
			return;
		}

		this._commandHistory.push(command);
		this._historyIndex = this._commandHistory.length;

		// Memory management: keep only recent commands
		if (this._commandHistory.length > this._maxHistorySize) {
			this._commandHistory.shift();
			this._historyIndex = this._commandHistory.length;
		}
	}


	/**
	 * Displays a list of available commands and their descriptions for the user interface.
	 *
	 * The commands are divided into categories such as playback, configuration, presets and utilities, system,
	 * and timeline (training). It provides detailed instructions on usage and functionality.
	 *
	 * @return {void} This method does not return any value.
	 */
	_showCommands() {

		console.log("📝 Available Commands:");
		console.log("   ▶️  Playback:");
		console.log("      play, start           - Start metronome");
		console.log("      stop                  - Stop metronome");

		console.log("   🎼 Configuration:");
		console.log("      bpm [value]           - Change tempo (20-218)");
		console.log("      div [value]           - Change division (1-16)");
		console.log("      accent [on/off]       - Enable/disable accents");
		console.log("      pattern [type]        - Change pattern (straight/swing)");
		console.log("      vol [value]           - Change volume (0-100)");

		console.log("   🎵 Presets and Utilities:");
		console.log("      preset [name]         - Load preset (classical/jazz/rock/latin)");
		console.log("      tap                   - Tap tempo (detect BPM)");
		console.log("      status                - Show complete status");

		console.log("   🛠️  System:");
		console.log("      help, ?               - Show this help");
		console.log("      clear                 - Clear screen");
		console.log("      exit, quit            - Exit");

		console.log("   🎬 Timeline (Training):");
		console.log("      timeline start [type] - Start training timeline");
		console.log("      timeline stop         - Stop timeline");
		console.log("      timeline status       - Timeline status");
		console.log("      timeline skip         - Skip to next section");
		console.log("      timeline list         - View available types");

		console.log("\n💡 Use Tab for command completion, ↑↓ for history");
		console.log();
	}


	/**
	 * Displays the prompt with the current playback status and BPM.
	 * The prompt format indicates whether the system is playing or stopped,
	 * followed by the BPM (beats per minute).
	 *
	 * @return {void} Does not return any value.
	 */
	_showPrompt() {

		const status = this._core.isPlaying ? '▶️' : '⏹️';
		const bpm = this._core.bpm;
		process.stdout.write(`${status} ethnik[${bpm}]> `);
	}


	/**
	 * Processes a given command by parsing the input, identifying the command, and executing it if valid.
	 * Provides feedback for unknown commands and suggests possible alternatives.
	 *
	 * @param {string} input - The raw command input as a string.
	 * @return {void} This method does not return a value but logs outputs or errors.
	 */
	_processCommand(input) {

		const parts = input.toLowerCase().split(' ');
		const commandName = parts[0];
		const args = parts.slice(1);

		console.log();

		const command = this._commands.get(commandName);

		if (command) {
			try {
				command.execute(args);
			} catch (error) {
				console.error(`❌ Error executing command: ${error.message}`);
				Settings.log(`Command execution error: ${commandName}`, error);
			}
		} else {
			console.log(`❌ Unknown command: '${commandName}'`);

			// Show suggestions for similar commands
			const suggestions = this._getCommandSuggestions(commandName);
			if (suggestions.length > 0) {
				console.log(`💡 Did you mean: ${suggestions.slice(0, 3).join(', ')}?`);
			} else {
				console.log("💡 Type 'help' to see available commands");
			}
		}

		console.log();
	}


	/**
	 * Retrieves a list of command suggestions based on a partial string input.
	 * The method prioritizes prefix matches before considering substring matches if no prefixes are found.
	 * Returns up to a maximum of five suggestions.
	 *
	 * @param {string} partial The partial input string to match available commands against.
	 * @return {string[]} An array of command suggestions that match the given partial string.
	 */
	_getCommandSuggestions(partial) {

		if (!partial) return [];

		const lowerPartial = partial.toLowerCase();

		// First, try exact prefix matches
		const prefixMatches = Array.from(this._commands.keys())
			.filter(cmd => cmd.startsWith(lowerPartial));

		// If no prefix matches, try substring matches
		if (prefixMatches.length === 0) {
			return Array.from(this._commands.keys())
				.filter(cmd => cmd.includes(lowerPartial))
				.slice(0, 5);
		}

		return prefixMatches.slice(0, 5);
	}


	/**
	 * Handles the cleanup and termination process for the application.
	 * This method ensures that resources are properly released, any ongoing
	 * operations are stopped, and the application exits gracefully.
	 *
	 * @return {void} This method does not return any value.
	 */
	_handleExit() {

		console.log('\n\n👋 Closing Ethnik Tools...');

		// Clean up before exit
		this.destroy();

		if (this._core.isPlaying) {
			this._core.stop();
		}
		this._core.destroy();

		process.exit(0);
	}


	/**
	 * Retrieves the list of commands.
	 *
	 * @return {Array} An array of commands stored in the object.
	 */
	getCommands() {

		return this._commands;
	}


	/**
	 * Displays a list of available commands and their descriptions to assist the user.
	 *
	 * @return {void} Does not return a value.
	 */
	showHelp() {

		this._showCommands();
	}


	/**
	 * Destroys the ConsoleManager instance by removing event listeners,
	 * resetting settings, and performing cleanup tasks to release resources.
	 *
	 * @return {void} Does not return a value.
	 */
	destroy() {

		try {
			// Remove event listeners using bound handlers
			process.stdin.removeListener('data', this._boundHandlers.keyInput);
			process.removeListener('SIGINT', this._boundHandlers.exit);
			process.removeListener('SIGTERM', this._boundHandlers.exit);

			// Reset stdin if possible
			if (process.stdin.isTTY) {
				process.stdin.setRawMode(false);
			}

			// Clean up command history
			this._commandHistory = [];
			this._commands.clear();

			// Reset input state
			this._inputBuffer = '';
			this._historyIndex = -1;

			Settings.log("ConsoleManager destroyed");
		} catch (error) {
			console.error("Error during ConsoleManager cleanup:", error);
		}
	}
}

export default ConsoleManager;