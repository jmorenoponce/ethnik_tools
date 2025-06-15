
class ConsoleManager {

	/**
	 * Initializes a new instance of the class with the specified core.
	 *
	 * @param {object} core - The core object that provides necessary functionality or configurations.
	 * @return {void} This constructor does not return a value.
	 */
	constructor(core) {

		this._core = core;
		this._commandHistory = [];
		this._historyIndex = -1;
		this._initConsoleInterface();
	}


	/**
	 * Initializes a console-based interface for receiving and processing user input.
	 * Configures the input stream, handles key events, displays available commands,
	 * and manages the command history. It also sets up cleanup functionality for
	 * graceful termination when certain signals are received.
	 *
	 * @return {void} This method does not return a value.
	 */
	_initConsoleInterface() {

		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true);
		}
		process.stdin.setEncoding('utf8');
		process.stdin.resume();

		this._showCommands();
		this._showPrompt();

		let inputBuffer = '';

		process.stdin.on('data', (key) => {
			if (key === '\u0003') { // Ctrl+C
				this._handleExit();
				return;
			}

			if (key === '\r' || key === '\n') { // Enter
				if (inputBuffer.trim()) {
					this._processCommand(inputBuffer.trim());
					this._commandHistory.push(inputBuffer.trim());
					this._historyIndex = this._commandHistory.length;
				}
				inputBuffer = '';
				this._showPrompt();
				return;
			}

			if (key === '\u007f' || key === '\b') { // Backspace
				if (inputBuffer.length > 0) {
					inputBuffer = inputBuffer.slice(0, -1);
					process.stdout.write('\b \b');
				}
				return;
			}

			if (key >= ' ' && key <= '~') {
				inputBuffer += key;
				process.stdout.write(key);
			}
		});

		process.on('SIGINT', () => this._handleExit());
		process.on('SIGTERM', () => this._handleExit());
	}


	/**
	 * Displays a list of available commands and their descriptions.
	 *
	 * The method prints out categorized blocks of information regarding commands
	 * related to playback, configuration, presets, utilities, and system operations.
	 * It is intended to provide users with an overview of commands supported by the application.
	 *
	 * @return {void} This method does not return a value; it directly logs information to the console.
	 */
	_showCommands() {

		console.log("📝 Comandos Disponibles:");
		console.log("   ▶️  Reproducción:");
		console.log("      play, start           - Iniciar metrónomo");
		console.log("      stop                  - Detener metrónomo");
		console.log("   🎼 Configuración:");
		console.log("      bpm [valor]           - Cambiar tempo (20-218)");
		console.log("      div [valor]           - Cambiar división (1-16)");
		console.log("      accent [on/off]       - Activar/desactivar acentos");
		console.log("      pattern [tipo]        - Cambiar patrón (straight/swing)");
		console.log("      vol [valor]           - Cambiar volumen (0-100)");
		console.log("   🎵 Presets y Utilidades:");
		console.log("      preset [nombre]       - Cargar preset (classical/jazz/rock/latin)");
		console.log("      tap                   - Tap tempo (detectar BPM)");
		console.log("      status                - Mostrar estado completo");
		console.log("   🛠️  Sistema:");
		console.log("      help, ?               - Mostrar esta ayuda");
		console.log("      clear                 - Limpiar pantalla");
		console.log("      exit, quit            - Salir");
		console.log();
	}


	/**
	 * Displays a prompt in the console that indicates the current status (playing or stopped)
	 * and the BPM (Beats Per Minute) of the core instance.
	 *
	 * @return {void} Does not return a value.
	 */
	_showPrompt() {

		const status = this._core._is_playing ? '▶️' : '⏹️';
		const bpm = this._core._bpm;
		process.stdout.write(`${status} ethnik[${bpm}]> `);
	}


	/**
	 * Processes a given command string and performs actions based on the command and its arguments.
	 *
	 * @param {string} input - The input command string containing the command and optional arguments.
	 * @return {void} Does not return any value but executes actions or logs output based on the command.
	 */
	_processCommand(input) {

		const parts = input.toLowerCase().split(' ');
		const command = parts[0];
		const args = parts.slice(1);

		console.log();

		switch(command) {
			case 'play':
			case 'start':
				this._core.play();
				break;

			case 'stop':
				this._core.stop();
				break;

			case 'bpm':
			case 'tempo':
				if (args.length > 0) {
					this._core.setTempo(args[0]);
				} else {
					console.log(`💡 Uso: ${command} [20-218]`);
				}
				break;

			case 'div':
			case 'division':
				if (args.length > 0) {
					this._core.setDivision(args[0]);
				} else {
					console.log(`💡 Uso: ${command} [1-16]`);
				}
				break;

			case 'accent':
				if (args.length > 0) {
					const enabled = args[0] === 'on' || args[0] === 'true' || args[0] === '1';
					this._core.setAccent(enabled);
				} else {
					console.log(`💡 Uso: accent [on/off]`);
				}
				break;

			case 'pattern':
				if (args.length > 0) {
					this._core.setPattern(args[0]);
				} else {
					console.log(`💡 Uso: pattern [straight/swing/custom]`);
				}
				break;

			case 'vol':
			case 'volume':
				if (args.length > 0) {
					this._core.setVolume(parseInt(args[0]));
				} else {
					console.log(`💡 Uso: ${command} [0-100]`);
				}
				break;

			case 'preset':
				if (args.length > 0) {
					this._core.loadPreset(args[0]);
				} else {
					console.log(`💡 Presets: classical, jazz, rock, latin`);
				}
				break;

			case 'tap':
				this._core.tapTempo();
				break;

			case 'status':
				this._core.getStatus();
				break;

			case 'help':
			case '?':
				this._showCommands();
				break;

			case 'clear':
				console.clear();
				this._core._initialize();
				break;

			case 'exit':
			case 'quit':
				this._handleExit();
				break;

			default:
				console.log(`❌ Comando desconocido: '${command}'`);
				console.log("💡 Escribe 'help' para ver comandos disponibles");
		}

		console.log();
	}


	/**
	 * Handles the exit process of the application.
	 * Ensures that any ongoing tasks or processes are stopped before exiting.
	 *
	 * @return {void} Does not return a value.
	 */
	_handleExit() {

		console.log('\n\n👋 Cerrando Ethnik Tools...');
		if (this._core._is_playing) {
			this._core.stop();
		}
		process.exit(0);
	}
}

export default ConsoleManager;