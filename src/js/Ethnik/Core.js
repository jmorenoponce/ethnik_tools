
import Settings from "./Settings.js";
import ConsoleManager from "./ConsoleManager.js";
import { spawn } from 'child_process';
import { performance } from 'perf_hooks';


class Core {

	constructor() {

		this._console = new ConsoleManager(this);

		this._is_playing = false;
		this._bpm = Settings.defaultParams.bpmInitial;
		this._division = Settings.defaultParams.division;
		this._volume = Settings.defaultParams.volume;

		// Sistema de timing de alta precisión
		this._nextTickTime = 0;
		this._lookahead = 25.0; // ms - ventana de anticipación
		this._scheduleAheadTime = 0.1; // s - tiempo de programación adelantada
		this._timerWorker = null;
		this._intervalID = null;

		// Control de drift temporal
		this._startTime = 0;
		this._tickCount = 0;
		this._expectedNextTick = 0;

		this._initialize();
	}


	_initialize() {

		console.clear();
		console.log("🎵 Ethnik Tools - Metrónomo de Alta Precisión");
		console.log("=".repeat(50));
		console.log(`Tempo inicial: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
		console.log(`División: ${this._getDivisionName(this._division)}`);
		console.log(`Volumen: ${this._volume}%`);
		console.log("=".repeat(50));
		console.log();
	}


	play() {

		if (this._is_playing) {
			console.log("⚠️  El metrónomo ya está en funcionamiento");
			return false;
		}

		this._is_playing = true;
		this._tickCount = 0;
		this._startTime = performance.now();
		this._nextTickTime = this._startTime;

		console.log(`▶️  Iniciando metrónomo: ${this._bpm} BPM - ${this._getDivisionName(this._division)}`);
		console.log("Presiona 'stop' para detener\n");

		this._startScheduler();
		return true;
	}


	stop() {

		if (!this._is_playing) {
			console.log("⚠️  El metrónomo no está funcionando");
			return false;
		}

		this._is_playing = false;

		if (this._intervalID) {
			clearInterval(this._intervalID);
			this._intervalID = null;
		}

		const totalTime = (performance.now() - this._startTime) / 1000;
		const expectedTicks = Math.floor(totalTime * (this._bpm / 60) * this._division);
		const accuracy = ((this._tickCount / expectedTicks) * 100).toFixed(2);

		console.log(`\n⏹️  Metrónomo detenido`);
		console.log(`📊 Estadísticas: ${this._tickCount} tics en ${totalTime.toFixed(2)}s`);
		console.log(`🎯 Precisión: ${accuracy}%\n`);
		return true;
	}


	setTempo(newTempo) {

		const tempo = parseInt(newTempo);

		if (isNaN(tempo) || tempo < Settings.defaultParams.bpmMin || tempo > Settings.defaultParams.bpmMax) {
			console.log(`❌ BPM inválido. Rango válido: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`);
			return false;
		}

		const wasPlaying = this._is_playing;
		if (wasPlaying) this.stop();

		this._bpm = tempo;
		console.log(`🎼 Tempo cambiado: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);

		if (wasPlaying) {
			setTimeout(() => this.play(), 100); // Pequeña pausa para evitar clicks
		}
		return true;
	}


	setDivision(division) {

		const div = parseInt(division);

		if (isNaN(div) || div < 1 || div > 16) {
			console.log("❌ División inválida. Rango válido: 1-16");
			return false;
		}

		const wasPlaying = this._is_playing;
		if (wasPlaying) this.stop();

		this._division = div;
		console.log(`📏 División cambiada: ${this._getDivisionName(this._division)}`);

		if (wasPlaying) {
			setTimeout(() => this.play(), 100);
		}
		return true;
	}


	setVolume(volume) {

		const vol = parseInt(volume);

		if (isNaN(vol) || vol < 0 || vol > 100) {
			console.log("❌ Volumen inválido. Rango válido: 0-100");
			return false;
		}

		this._volume = vol;
		console.log(`🔊 Volumen cambiado: ${this._volume}%`);
		return true;
	}


	getStatus() {

		console.log("\n📋 Estado actual:");
		console.log(`   Estado: ${this._is_playing ? '▶️ Reproduciendo' : '⏹️ Detenido'}`);
		console.log(`   Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
		console.log(`   División: ${this._getDivisionName(this._division)}`);
		console.log(`   Volumen: ${this._volume}%`);
		if (this._is_playing) {
			const runTime = ((performance.now() - this._startTime) / 1000).toFixed(1);
			console.log(`   Tiempo ejecutándose: ${runTime}s`);
			console.log(`   Tics reproducidos: ${this._tickCount}`);
		}
		console.log();
	}


	_startScheduler() {

		// Scheduler principal - verifica cada 25ms
		this._intervalID = setInterval(() => {
			this._scheduler();
		}, this._lookahead);
	}


	_scheduler() {

		const currentTime = performance.now();

		// Programar todos los tics que caen dentro de la ventana de anticipación
		while (this._nextTickTime < currentTime + this._lookahead) {
			this._scheduleTick(this._nextTickTime);
			this._nextTickTime += this._calculateInterval();
		}
	}


	_scheduleTick(time) {

		const delay = Math.max(0, time - performance.now());

		setTimeout(() => {
			if (this._is_playing) {
				this._playTick();
			}
		}, delay);
	}


	_playTick() {

		this._tickCount++;

		// Reproducir sonido usando sistema del OS para máxima precisión
		this._playSystemSound();

		// Feedback visual en consola
		this._renderTick();

		// Detección de drift temporal
		this._checkTiming();
	}


	_playSystemSound() {

		// Usar el comando del sistema para reproducir audio de forma precisa
		// En Linux/Mac: aplay, afplay
		// En Windows: powershell
		try {
			if (process.platform === 'win32') {
				// Windows - usar beep del sistema
				spawn('powershell', ['-c', '[Console]::Beep(800, 100)'], {
					stdio: 'ignore',
					detached: true
				});
			} else if (process.platform === 'darwin') {
				// macOS - usar afplay con archivo de sonido o beep
				spawn('osascript', ['-e', 'beep'], {
					stdio: 'ignore',
					detached: true
				});
			} else {
				// Linux - usar beep o speaker-test
				spawn('speaker-test', ['-t', 'sine', '-f', '800', '-l', '1', '-s', '1'], {
					stdio: 'ignore',
					detached: true
				});
			}
		} catch (error) {
			// Fallback a caracteres de terminal como feedback
			process.stdout.write('♪');
		}
	}


	_renderTick() {

		const beatInMeasure = (this._tickCount - 1) % (4 * this._division) + 1;
		const isDownbeat = beatInMeasure === 1;

		if (isDownbeat) {
			process.stdout.write('\n🔴 '); // Downbeat
		} else if (beatInMeasure % this._division === 1) {
			process.stdout.write('🔵 '); // Beat principal
		} else {
			process.stdout.write('⚪ '); // Subdivisión
		}

		// Mostrar contador cada 16 tics
		if (this._tickCount % 16 === 0) {
			process.stdout.write(` [${this._tickCount}]`);
		}
	}


	_checkTiming() {

		const expectedTime = this._startTime + (this._tickCount * this._calculateInterval());
		const actualTime = performance.now();
		const drift = actualTime - expectedTime;

		// Si hay más de 5ms de drift, advertir
		if (Math.abs(drift) > 5) {
			process.stdout.write(` ⚠️(${drift.toFixed(1)}ms) `);
		}
	}


	_calculateInterval() {

		// Intervalo base en milisegundos
		const baseInterval = (60000 / this._bpm);
		// Aplicar división (1 = negras, 2 = corcheas, 4 = semicorcheas, etc.)
		return baseInterval / this._division;
	}


	_getDivisionName(division) {

		const names = {
			1: "Negras (1/4)",
			2: "Corcheas (1/8)",
			3: "Tresillos de corchea",
			4: "Semicorcheas (1/16)",
			6: "Seisillo",
			8: "Fusas (1/32)"
		};
		return names[division] || `División ${division}`;
	}
}

export { Core };