
import Settings from "./Settings.js";
import ConsoleManager from "./ConsoleManager.js";
import {AudioEngine} from "./AudioEngine.js";
import {performance} from 'perf_hooks';
import TimelineManager from "./TimelineManager.js";


/**
 * The Core class represents the main functionality of an advanced metronome.
 * It handles metronome playback, timing, presets, and rhythm patterns, integrating
 * audio engine capabilities to provide a professional metronome experience.
 */
class Core {

	/**
	 * Constructs a new instance of the class and initializes its properties and systems.
	 *
	 * This constructor sets up essential components like the Console Manager and Audio Engine.
	 * It establishes default settings for playback, timing, and performance metrics,
	 * as well as defining rhythmic patterns and presets.
	 *
	 * @return {object} A new instance of the class with all systems and properties initialized.
	 */
	constructor() {

		this._console = new ConsoleManager(this);
		this._audioEngine = new AudioEngine();
		this._timelineManager = new TimelineManager(this);

		this._is_playing = false;
		this._bpm = Settings.defaultParams.bpmInitial;
		this._division = Settings.defaultParams.division;
		this._volume = Settings.defaultParams.volume;
		this._accent = true; // Acentuar primer tiempo

		// Advanced timing system
		this._nextTickTime = 0;
		this._lookahead = 15.0; // Reduced for better accuracy
		this._timerWorker = null;
		this._intervalID = null;

		// Performance metrics
		this._startTime = 0;
		this._tickCount = 0;
		this._measureCount = 0;
		this._driftHistory = [];
		this._avgDrift = 0;

		// Rhythmic patterns
		this._currentPattern = 'straight'; // 'straight', 'swing', 'custom'
		this._customPattern = [];

		// Presets
		this._presets = {
			'classical': { bpm: 120, division: 1, accent: true },
			'jazz': { bpm: 140, division: 4, accent: true },
			'rock': { bpm: 120, division: 2, accent: true },
			'latin': { bpm: 100, division: 4, accent: true }
		};

		this._initialize();
	}


	/**
	 * Initializes the system by clearing the console, displaying application details, and logging relevant audio and configuration information.
	 *
	 * @return {Promise<void>} Resolves when the initialization process, including audio setup, is complete.
	 */
	async _initialize() {

		console.clear();
		console.log("🎵 Ethnik Tools - Metrónomo Profesional v2.0");
		console.log("=".repeat(55));

		// Wait for the audio to initialise
		await new Promise(resolve => setTimeout(resolve, 100));

		const audioInfo = this._audioEngine.getAudioInfo();
		console.log(`🔊 Audio: ${audioInfo.method} (latencia: ${audioInfo.latency.toFixed(1)}ms)`);
		console.log(`🎼 Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
		console.log(`📏 División: ${this._getDivisionName(this._division)}`);
		console.log(`🎯 Acentos: ${this._accent ? 'Activados' : 'Desactivados'}`);
		console.log(`🔊 Volumen: ${this._volume}%`);
		console.log("=".repeat(55));
		console.log();
	}


	/**
	 * Starts the metronome playback if it's not already running.
	 * Initializes necessary properties and scheduler for playback.
	 *
	 * @return {Promise<boolean>} A promise that resolves to `true` if the
	 * playback starts successfully, or `false` if the metronome is already running.
	 */
	async play() {

		if (this._timelineManager.isTimelineMode) {
			console.log("⚠️ Timeline activo. Usa 'timeline stop' primero");
			return false;
		}

		if (this._is_playing) {
			console.log("⚠️  El metrónomo ya está funcionando");
			return false;
		}

		this._is_playing = true;
		this._tickCount = 0;
		this._measureCount = 0;
		this._driftHistory = [];
		this._startTime = performance.now();
		this._nextTickTime = this._startTime;

		console.log(`▶️  Iniciando: ${this._bpm} BPM - ${this._getDivisionName(this._division)}`);
		console.log(`🎯 Patrón: ${this._currentPattern} | Acentos: ${this._accent ? 'Sí' : 'No'}`);
		console.log("Presiona 'stop' para detener\n");

		this._startScheduler();
		return true;
	}


	/**
	 * Stops the metronome if it is currently running.
	 *
	 * @return {boolean} Returns true if the metronome was successfully stopped, false if the metronome was not running.
	 */
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

		this._showPerformanceStats();
		return true;
	}


	/**
	 * Displays performance statistics of the metronome.
	 * Outputs details about the total runtime, ticks played, measures completed, accuracy, average drift, and audio method.
	 *
	 * @return {void} Logs the performance statistics to the console.
	 */
	_showPerformanceStats() {

		const totalTime = (performance.now() - this._startTime) / 1000;
		const expectedTicks = Math.floor(totalTime * (this._bpm / 60) * this._division);
		const accuracy = ((this._tickCount / expectedTicks) * 100).toFixed(2);

		console.log(`\n⏹️  Metrónomo detenido`);
		console.log(`📊 Rendimiento:`);
		console.log(`   ⏱️  Tiempo total: ${totalTime.toFixed(2)}s`);
		console.log(`   🎵 Tics reproducidos: ${this._tickCount}`);
		console.log(`   📏 Compases completos: ${this._measureCount}`);
		console.log(`   🎯 Precisión: ${accuracy}%`);
		console.log(`   📈 Drift promedio: ${this._avgDrift.toFixed(2)}ms`);
		console.log(`   🔊 Método de audio: ${this._audioEngine.getAudioInfo().method}`);
		console.log();
	}


	/**
	 * Sets the tempo for the current playback, validating it against the allowed range.
	 * If a playback is currently active, it will stop and restart after changing the tempo.
	 *
	 * @param {number|string} newTempo - The new tempo (BPM) to be set. Must be within the valid range defined by Settings.defaultParams.bpmMin and Settings.defaultParams.bpmMax.
	 * @return {boolean} Returns true if the tempo was successfully updated, false if the new tempo is invalid.
	 */
	setTempo(newTempo) {

		const tempo = parseInt(newTempo);

		if (isNaN(tempo) || tempo < Settings.defaultParams.bpmMin || tempo > Settings.defaultParams.bpmMax) {
			console.log(`❌ BPM inválido. Rango: ${Settings.defaultParams.bpmMin}-${Settings.defaultParams.bpmMax}`);
			return false;
		}

		const wasPlaying = this._is_playing;

		if (wasPlaying) this.stop();

		this._bpm = tempo;

		console.log(`🎼 Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);

		if (wasPlaying) {
			setTimeout(() => this.play(), 150);
		}

		return true;
	}


	/**
	 * Sets the division value for the instance after validating the input.
	 * If the provided division is invalid (not a number or out of the 1-16 range),
	 * an error message is logged and the method returns false.
	 * If a valid division is set, any ongoing playback is temporarily stopped to apply the new division.
	 *
	 * @param {number|string} division - The division value to set. Must be an integer between 1 and 16.
	 * @return {boolean} Returns true if the division is successfully set, otherwise false.
	 */
	setDivision(division) {

		const div = parseInt(division);

		if (isNaN(div) || div < 1 || div > 16) {
			console.log("❌ División inválida. Rango: 1-16");
			return false;
		}

		const wasPlaying = this._is_playing;

		if (wasPlaying) this.stop();

		this._division = div;
		console.log(`📏 División: ${this._getDivisionName(this._division)}`);

		if (wasPlaying) {
			setTimeout(() => this.play(), 150);
		}

		return true;
	}


	/**
	 * Toggles the accent state of the application.
	 *
	 * @param {boolean} enabled - Determines whether the accent is enabled (true) or disabled (false).
	 * @return {boolean} Returns true to indicate the method executed successfully.
	 */
	setAccent(enabled) {

		this._accent = enabled;
		console.log(`🎯 Acentos: ${this._accent ? 'Activados' : 'Desactivados'}`);

		return true;
	}


	/**
	 * Sets the rhythmic pattern for the system.
	 *
	 * @param {string} pattern The pattern to be set, must be one of 'straight', 'swing', or 'custom'.
	 * @return {boolean} Returns true if the pattern is valid and successfully set, otherwise false.
	 */
	setPattern(pattern) {

		const validPatterns = ['straight', 'swing', 'custom'];

		if (!validPatterns.includes(pattern)) {
			console.log(`❌ Patrón inválido. Opciones: ${validPatterns.join(', ')}`);
			return false;
		}

		this._currentPattern = pattern;
		console.log(`🎵 Patrón rítmico: ${pattern}`);

		return true;
	}


	/**
	 * Loads a preset by its name and applies its configuration settings such as bpm, division, and accent.
	 * If a preset is currently playing, it will stop and resume playback after loading the new preset.
	 *
	 * @param {string} name - The name of the preset to load. Must match an existing preset in the internal presets list.
	 * @return {boolean} Returns true if the preset was successfully loaded, otherwise false if the preset does not exist.
	 */
	loadPreset(name) {

		const preset = this._presets[name];

		if (!preset) {
			console.log(`❌ Preset '${name}' no encontrado`);
			console.log(`💡 Presets disponibles: ${Object.keys(this._presets).join(', ')}`);
			return false;
		}

		const wasPlaying = this._is_playing;
		if (wasPlaying) this.stop();

		this._bpm = preset.bpm;
		this._division = preset.division;
		this._accent = preset.accent;

		console.log(`📁 Preset '${name}' cargado:`);
		console.log(`   🎼 Tempo: ${this._bpm} BPM`);
		console.log(`   📏 División: ${this._getDivisionName(this._division)}`);
		console.log(`   🎯 Acentos: ${this._accent ? 'Sí' : 'No'}`);

		if (wasPlaying) {
			setTimeout(() => this.play(), 150);
		}

		return true;
	}


	/**
	 * Adjusts the tempo based on the interval between consecutive user interactions (taps).
	 * Calculates the average BPM (Beats Per Minute) from the timing of the taps, and updates the tempo if it falls within the allowed range.
	 * The method dynamically adapts to user input by maintaining a rolling window of the last eight taps.
	 *
	 * @return {void} This method does not return a value.
	 */
	tapTempo() {

		if (!this._tapTimes) {
			this._tapTimes = [];
		}

		const now = performance.now();
		this._tapTimes.push(now);

		// Keep only the last 8 taps
		if (this._tapTimes.length > 8) {
			this._tapTimes.shift();
		}

		if (this._tapTimes.length >= 2) {
			const intervals = [];
			for (let i = 1; i < this._tapTimes.length; i++) {
				intervals.push(this._tapTimes[i] - this._tapTimes[i - 1]);
			}

			const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
			const bpm = Math.round(60000 / avgInterval);

			if (bpm >= Settings.defaultParams.bpmMin && bpm <= Settings.defaultParams.bpmMax) {
				this.setTempo(bpm);
				console.log(`🥁 Tap tempo detectado: ${bpm} BPM (${this._tapTimes.length} taps)`);
			}
		} else {
			console.log(`🥁 Tap ${this._tapTimes.length}/2+ (sigue tocando...)`);
		}

		// Cleaning old taps (more than 3 seconds)
		setTimeout(() => {
			this._tapTimes = this._tapTimes.filter(time => now - time < 3000);
		}, 3000);
	}


	/**
	 * Logs the current status of the system including playback status, tempo, division, accents, pattern, volume,
	 * audio information, and runtime details if the system is playing.
	 *
	 * @return {void} This method does not return a value.
	 */
	getStatus() {

		const audioInfo = this._audioEngine.getAudioInfo();

		console.log("\n📋 Estado del Sistema:");
		console.log(`   🎵 Estado: ${this._is_playing ? '▶️ Reproduciendo' : '⏹️ Detenido'}`);
		console.log(`   🎼 Tempo: ${this._bpm} BPM (${Settings.getTempoName(this._bpm)})`);
		console.log(`   📏 División: ${this._getDivisionName(this._division)}`);
		console.log(`   🎯 Acentos: ${this._accent ? 'Activados' : 'Desactivados'}`);
		console.log(`   🎵 Patrón: ${this._currentPattern}`);
		console.log(`   🔊 Volumen: ${this._volume}%`);
		console.log(`   🔧 Audio: ${audioInfo.method} (${audioInfo.latency.toFixed(1)}ms latencia)`);

		if (this._is_playing) {
			const runTime = ((performance.now() - this._startTime) / 1000).toFixed(1);
			console.log(`   ⏱️  Ejecutándose: ${runTime}s`);
			console.log(`   🎵 Tics: ${this._tickCount} | Compases: ${this._measureCount}`);
			console.log(`   📊 Drift promedio: ${this._avgDrift.toFixed(2)}ms`);
		}
		console.log();
	}


	/**
	 * Starts the scheduler which runs at regular intervals determined by the lookahead time.
	 * The scheduler executes a defined task repeatedly until it is explicitly stopped.
	 *
	 * @return {void} This method does not return a value.
	 */
	_startScheduler() {

		this._intervalID = setInterval(() => {
			this._scheduler();
		}, this._lookahead);
	}


	/**
	 * Manages and schedules future tasks or events based on the current time and a specified lookahead interval.
	 * Continuously calculates the next tick time and ensures tasks are scheduled at appropriate intervals.
	 *
	 * @return {void} This method does not return a value.
	 */
	_scheduler() {

		const currentTime = performance.now();

		while (this._nextTickTime < currentTime + this._lookahead) {
			this._scheduleTick(this._nextTickTime);
			this._nextTickTime += this._calculateInterval();
		}
	}


	/**
	 * Schedules the next tick based on the provided time.
	 *
	 * @param {number} time - The target time in milliseconds to schedule the next tick.
	 * @return {void} This method does not return a value.
	 */
	_scheduleTick(time) {

		const delay = Math.max(0, time - performance.now());

		setTimeout(() => {
			if (this._is_playing) {
				this._playTick();
			}
		}, delay);
	}


	/**
	 * Plays a single tick in a sequence, incrementing the tick count and rendering auditory and visual feedback.
	 * Determines the type of tick (downbeat, strong beat, or subdivision) based on the current position within the measure,
	 * and adjusts the sound's frequency and duration accordingly. Also updates metrics and measure count if applicable.
	 *
	 * @return {Promise<void>} A promise that resolves once the tick has been played and associated actions have been completed.
	 */
	async _playTick() {

		this._tickCount++;
		const beatInMeasure = ((this._tickCount - 1) % (4 * this._division)) + 1;
		const isDownbeat = beatInMeasure === 1;
		const isStrongBeat = beatInMeasure % this._division === 1;

		// Determine sound type
		let tickType = 'subdivision';
		let frequency = 600;
		let duration = 80;

		if (isDownbeat && this._accent) {
			tickType = 'downbeat';
			frequency = 1000;
			duration = 120;
			this._measureCount++;
		} else if (isStrongBeat && this._accent) {
			tickType = 'beat';
			frequency = 800;
			duration = 100;
		}

		// Play sound
		await this._audioEngine.playTick(tickType, frequency, duration);

		// Feedback visual
		this._renderTick(isDownbeat, isStrongBeat);

		// Performance metrics
		this._updatePerformanceMetrics();
	}


	/**
	 * Renders a visual representation of the beat or tick during playback.
	 *
	 * @param {boolean} isDownbeat - Indicates if the current tick is a downbeat.
	 * @param {boolean} isStrongBeat - Indicates if the current tick is a strong beat.
	 * @return {void} This method does not return a value.
	 */
	_renderTick(isDownbeat, isStrongBeat) {

		if (isDownbeat) {
			process.stdout.write('\n🔴 '); // Downbeat
		} else if (isStrongBeat) {
			process.stdout.write('🔵 '); // Beat fuerte
		} else {
			process.stdout.write('⚪ '); // Subdivisión
		}

		// Display counter every 16 ticks
		if (this._tickCount % 16 === 0) {
			process.stdout.write(` [${this._tickCount}]`);
		}

		// New line every 4 bars
		if (this._measureCount > 0 && this._measureCount % 4 === 0 && isDownbeat) {
			process.stdout.write(`\n--- Compás ${this._measureCount} ---`);
		}
	}


	/**
	 * Updates the performance metrics by calculating and storing timing drifts.
	 * This method calculates the expected versus actual execution time,
	 * computes the drift, updates the drift history, and calculates the
	 * average drift. If the drift exceeds a defined threshold, it logs a warning.
	 *
	 * @return {void} This method does not return a value.
	 */
	_updatePerformanceMetrics() {

		const expectedTime = this._startTime + (this._tickCount * this._calculateInterval());
		const actualTime = performance.now();
		const drift = actualTime - expectedTime;

		this._driftHistory.push(drift);

		// Keep only the last 100 values
		if (this._driftHistory.length > 100) {
			this._driftHistory.shift();
		}

		// Deriva calcular media
		this._avgDrift = this._driftHistory.reduce((a, b) => a + b) / this._driftHistory.length;

		// Warn if there is excessive drift
		if (Math.abs(drift) > 10) {
			process.stdout.write(` ⚠️(${drift.toFixed(1)}ms) `);
		}
	}


	/**
	 * Calculates the time interval for the current tick based on BPM, division, and pattern.
	 * If the current pattern is 'swing', alternates between long and short intervals
	 * to implement a swing rhythm.
	 *
	 * @return {number} The calculated interval in milliseconds.
	 */
	_calculateInterval() {

		const baseInterval = (60000 / this._bpm);

		// Apply modifications according to the pattern
		let interval = baseInterval / this._division;

		if (this._currentPattern === 'swing') {
			// Implement swing: Alternate between long and short intervals.
			const isEvenTick = this._tickCount % 2 === 0;
			interval *= isEvenTick ? 1.33 : 0.67; // Ratio swing 2:1
		}

		return interval;
	}


	/**
	 * Gets the name of a division based on its numeric value.
	 *
	 * @param {number} division - The numeric representation of the division.
	 * @return {string} The name of the division, or a default string if the division is not found.
	 */
	_getDivisionName(division) {

		const names = {
			1: "Negras (1/4)",
			2: "Corcheas (1/8)",
			3: "Tresillos",
			4: "Semicorcheas (1/16)",
			6: "Seisillos",
			8: "Fusas (1/32)",
			12: "Docesillos",
			16: "Semicorcheas cuádruples"
		};
		return names[division] || `División ${division}`;
	}


	/**
	 * Starts a timeline of the specified type. Ensures the timeline is not started if already playing.
	 *
	 * @param {string} timelineType - The type of timeline to be started, which determines the preset configuration to load.
	 * @return {boolean} Returns false if the timeline is already playing, otherwise returns the result of the timeline start operation.
	 */
	startTimeline(timelineType) {

		if (this._is_playing) {
			console.log("⚠️ Detén el metrónomo antes de iniciar timeline");
			return false;
		}

		this._timelineManager.loadPresetTimeline(timelineType);

		return this._timelineManager.startTimeline();
	}


	/**
	 * Stops the currently active timeline managed by the timeline manager.
	 *
	 * @return {boolean} Returns true if the timeline was successfully stopped, otherwise false.
	 */
	stopTimeline() {

		return this._timelineManager.stopTimeline();
	}


	/**
	 * Retrieves the current status of the timeline.
	 *
	 * @return {Object} The status of the timeline as provided by the timeline manager.
	 */
	getTimelineStatus() {

		this._timelineManager.getTimelineStatus();
	}


	/**
	 * Skips the current timeline section and moves to the next section.
	 *
	 * @return {boolean} Returns true if the operation to skip to the next timeline section was successful, otherwise false.
	 */
	skipTimelineSection() {

		return this._timelineManager.skipToNextSection();
	}

}

export { Core };