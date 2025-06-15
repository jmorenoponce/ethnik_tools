
class ConsoleManager {


	constructor(core) {

		this._core = core;
		this._commandHistory = [];
		this._historyIndex = -1;
		this._initConsoleInterface();
	}


	_initConsoleInterface() {

		// Configurar entrada raw para mejor control
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true);
		}
		process.stdin.setEncoding('utf8');
		process.stdin.resume();

		this._showCommands();
		this._showPrompt();

		let inputBuffer = '';

		process.stdin.on('data', (key) => {
			// Manejar caracteres especiales
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

			// Agregar carácter normal
			if (key >= ' ' && key <= '~') {
				inputBuffer += key;
				process.stdout.write(key);
			}
		});

		// Manejo limpio de salida
		process.on('SIGINT', () => this._handleExit());
		process.on('SIGTERM', () => this._handleExit());
	}


	_showCommands() {

		console.log("📝 Comandos disponibles:");
		console.log("   play, start          - Iniciar metrónomo");
		console.log("   stop                 - Detener metrónomo");
		console.log("   bpm [valor]          - Cambiar tempo (20-218)");
		console.log("   tempo [valor]        - Alias para bpm");
		console.log("   div [valor]          - Cambiar división (1-16)");
		console.log("   division [valor]     - Alias para div");
		console.log("   vol [valor]          - Cambiar volumen (0-100)");
		console.log("   volume [valor]       - Alias para vol");
		console.log("   status               - Mostrar estado actual");
		console.log("   help, ?              - Mostrar ayuda");
		console.log("   clear                - Limpiar pantalla");
		console.log("   exit, quit           - Salir del programa");
		console.log();
	}


	_showPrompt() {

		const status = this._core._is_playing ? '▶️' : '⏹️';
		process.stdout.write(`${status} ethnik> `);
	}


	_processCommand(input) {

		const parts = input.toLowerCase().split(' ');
		const command = parts[0];
		const args = parts.slice(1);

		console.log(); // Nueva línea después del comando

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
					console.log(`💡 Uso: ${command} [valor]`);
					console.log(`   Ejemplo: ${command} 120`);
				}
				break;

			case 'div':
			case 'division':
				if (args.length > 0) {
					this._core.setDivision(args[0]);
				} else {
					console.log(`💡 Uso: ${command} [valor]`);
					console.log(`   Ejemplo: ${command} 4`);
				}
				break;

			case 'vol':
			case 'volume':
				if (args.length > 0) {
					this._core.setVolume(args[0]);
				} else {
					console.log(`💡 Uso: ${command} [valor]`);
					console.log(`   Ejemplo: ${command} 80`);
				}
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
				console.log("💡 Escribe 'help' para ver los comandos disponibles");
		}

		console.log();
	}


	_handleExit() {

		console.log('\n\n👋 Cerrando Ethnik Tools...');

		if (this._core._is_playing) {
			this._core.stop();
		}

		process.exit(0);
	}
}

export default ConsoleManager;