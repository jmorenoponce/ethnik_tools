import { PlayCommand, StopCommand, BpmCommand, DivisionCommand, AccentCommand, PatternCommand, VolumeCommand, PresetCommand, TapCommand, StatusCommand, TimelineCommand, HelpCommand, ClearCommand, ExitCommand } from './commands/index.js';
import Settings from './Settings.js';


/**
 * Manages the console interface for the metronome application.
 * Implements Command pattern for command processing and maintains command history.
 */
class ConsoleManager {

	/**
	 * Initializes a new instance of the ConsoleManager with the specified core.
	 *
	 * @param {Object} core - The core object that provides necessary functionality.
	 * @return {void} No return value.
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
	 * Initializes the command registry with all available commands.
	 *
	 * @return {Map} Map of command names to command objects.
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
	 * Initializes the console interface for receiving and processing user input.
	 *
	 * @return {void} No return value.
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
	 * Handles individual key inputs from the console.
	 *
	 * @param {string} key - The key that was pressed.
	 * @return {void} No return value.
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
	 * Handles tab completion for commands.
	 *
	 * @return {void} No return value.
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
	 * Navigates through command history.
	 *
	 * @param {number} direction - Direction to navigate (-1 for up, 1 for down).
	 * @return {void} No return value.
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
	 * Clears the current input line.
	 *
	 * @return {void} No return value.
	 */
	_clearCurrentInput() {

		// Move cursor to beginning of input and clear line
		for (let i = 0; i < this._inputBuffer.length; i++) {
			process.stdout.write('\b \b');
		}
	}


	/**
	 * Adds a command to the history with memory management.
	 *
	 * @param {string} command - The command to add to history.
	 * @return {void} No return value.
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
	 * Displays a list of available commands and their descriptions.
	 *
	 * @return {void} No return value.
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
	 * Displays a prompt showing current status and BPM.
	 *
	 * @return {void} No return value.
	 */
	_showPrompt() {

		const status = this._core.isPlaying ? '▶️' : '⏹️';
		const bpm = this._core.bpm;
		process.stdout.write(`${status} ethnik[${bpm}]> `);
	}


	/**
	 * Processes a given command string using the Command pattern.
	 *
	 * @param {string} input - The input command string.
	 * @return {void} No return value.
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
	 * Gets command suggestions based on partial input.
	 *
	 * @param {string} partial - Partial command input.
	 * @return {Array<string>} Array of matching command names.
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
	 * Handles the exit process of the application.
	 *
	 * @return {void} No return value.
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
	 * Gets the list of available commands for help display.
	 *
	 * @return {Map} Map of commands.
	 */
	getCommands() {

		return this._commands;
	}


	/**
	 * Re-displays the command help.
	 *
	 * @return {void} No return value.
	 */
	showHelp() {

		this._showCommands();
	}


	/**
	 * Cleanup method to be called when the manager is no longer needed.
	 *
	 * @return {void} No return value.
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