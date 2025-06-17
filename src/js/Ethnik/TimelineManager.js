
class TimelineManager {

	/**
	 * Constructor for initializing the class with core functionalities, timeline settings, and predefined patterns.
	 *
	 * @param {Object} core - The core instance or object providing essential dependencies and core functionality.
	 * @return {void}
	 */
	constructor(core) {

		this._core = core;
		this._isTimelineMode = false;
		this._currentTimeline = null;
		this._timelineStartTime = 0;
		this._currentSectionIndex = 0;
		this._sectionStartTime = 0;
		this._tracks = new Map(); // Múltiples pistas de audio

		// Predefined patterns para diferentes tipos de práctica
		this._patternLibrary = this._createPatternLibrary();
	}


	/**
	 * Creates and returns a library of predefined rhythm patterns. Each pattern contains an array of beats
	 * and accents, where the beats define the rhythmic structure and the accents define the emphasis on specific beats.
	 *
	 * @return {Object} An object containing multiple rhythm patterns. Each pattern is defined with a 'beats' array
	 * and an 'accents' array. Patterns are organized by categories such as basic, training, and complex.
	 */
	_createPatternLibrary() {

		return {
			// Patrones básicos
			'straight': { beats: [1, 1, 1, 1], accents: [2, 1, 1, 1] },
			'backbeat': { beats: [0, 1, 0, 1], accents: [0, 2, 0, 2] },
			'syncopated': { beats: [1, 0, 1, 0, 1], accents: [2, 0, 1, 0, 2] },
			'triplets': { beats: [1, 1, 1], accents: [2, 1, 1] },

			// Patrones de entrenamiento
			'offbeat_only': { beats: [0, 1, 0, 1], accents: [0, 1, 0, 1] },
			'strong_beats': { beats: [1, 0, 1, 0], accents: [2, 0, 2, 0] },
			'subdivision_16': { beats: [1, 1, 1, 1, 1, 1, 1, 1], accents: [2, 1, 1, 1, 2, 1, 1, 1] },

			// Patrones complejos
			'latin_clave': { beats: [1, 0, 1, 0, 1, 0, 0, 1], accents: [2, 0, 2, 0, 2, 0, 0, 2] },
			'jazz_swing': { beats: [1, 0, 1, 1, 0, 1], accents: [2, 0, 1, 2, 0, 1] }
		};
	}


	/**
	 * Creates a training timeline with specified sections and configurations for each section.
	 *
	 * @param {string} name - The name of the training timeline.
	 * @param {Array<Object>} sections - An array of objects representing the sections of the timeline. Each section can include properties such as duration, bpm, pattern, division, volume, accent, silent, fadeIn, fadeOut, and tracks.
	 * @return {Object} An object representing the training timeline, including its name, configured sections, and total duration.
	 */
	createTrainingTimeline(name, sections) {

		const timeline = {
			name,
			sections: sections.map(section => ({
				duration: section.duration || 8, // compases
				bpm: section.bpm || this._core._bpm,
				pattern: section.pattern || 'straight',
				division: section.division || 1,
				volume: section.volume || 100,
				accent: section.accent !== undefined ? section.accent : true,
				silent: section.silent || false,
				fadeIn: section.fadeIn || 0,
				fadeOut: section.fadeOut || 0,
				tracks: section.tracks || ['main'] // Múltiples pistas
			})),
			totalDuration: sections.reduce((sum, s) => sum + (s.duration || 8), 0)
		};

		return timeline;
	}


	/**
	 * Loads a preset timeline based on the provided type, creates a corresponding training timeline,
	 * and sets it as the current timeline. Logs details about the loaded timeline and returns
	 * a success status.
	 *
	 * @param {string} type - The type of preset timeline to load. Acceptable values are:
	 *                        'basic_training', 'rhythm_challenge', or 'tempo_crescendo'.
	 *                        If an unknown type is provided, loading will fail.
	 * @return {boolean} - Returns true if the preset timeline was successfully loaded and set as
	 *                     the current timeline. Returns false if the preset type was not found.
	 */
	loadPresetTimeline(type) {

		let timeline;

		switch(type) {
			case 'basic_training':
				timeline = this.createTrainingTimeline('Entrenamiento Básico', [
					{ duration: 8, bpm: 80, pattern: 'straight', accent: true },
					{ duration: 4, bpm: 100, pattern: 'straight', accent: true },
					{ duration: 4, bpm: 120, pattern: 'backbeat', accent: true },
					{ duration: 8, bpm: 100, pattern: 'offbeat_only', accent: false },
					{ duration: 4, bpm: 80, pattern: 'straight', silent: true }
				]);
				break;

			case 'rhythm_challenge':
				timeline = this.createTrainingTimeline('Desafío Rítmico', [
					{ duration: 4, bpm: 90, pattern: 'straight' },
					{ duration: 4, bpm: 90, pattern: 'syncopated' },
					{ duration: 4, bpm: 110, pattern: 'triplets', division: 3 },
					{ duration: 8, bpm: 130, pattern: 'subdivision_16', division: 4 },
					{ duration: 4, bpm: 100, pattern: 'latin_clave' },
					{ duration: 4, bpm: 90, pattern: 'straight', silent: true }
				]);
				break;

			case 'tempo_crescendo':
				timeline = this.createTrainingTimeline('Crescendo de Tempo', [
					{ duration: 8, bpm: 60, pattern: 'straight' },
					{ duration: 8, bpm: 80, pattern: 'straight' },
					{ duration: 8, bpm: 100, pattern: 'straight' },
					{ duration: 8, bpm: 120, pattern: 'straight' },
					{ duration: 8, bmp: 140, pattern: 'straight' },
					{ duration: 8, bpm: 120, pattern: 'straight' },
					{ duration: 8, bpm: 100, pattern: 'straight' }
				]);
				break;

			default:
				console.log(`❌ Timeline preset '${type}' no encontrado`);
				return false;
		}

		this._currentTimeline = timeline;
		console.log(`📅 Timeline cargado: ${timeline.name}`);
		console.log(`   📏 Duración total: ${timeline.totalDuration} compases`);
		console.log(`   🎵 Secciones: ${timeline.sections.length}`);

		return true;
	}


	/**
	 * Starts the timeline if a timeline is loaded and the application is not currently playing a metronome.
	 * It initializes the timeline mode, sets the current section index to 0, marks the start time,
	 * and begins the next section.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if the timeline successfully starts,
	 *                            or false if no timeline is loaded or if the metronome is already playing.
	 */
	async startTimeline() {

		if (!this._currentTimeline) {
			console.log('❌ No hay timeline cargado');
			return false;
		}

		if (this._core._is_playing) {
			console.log('⚠️ Detén el metrónomo normal antes de usar timeline');
			return false;
		}

		this._isTimelineMode = true;
		this._currentSectionIndex = 0;
		this._timelineStartTime = performance.now();

		console.log(`\n🎬 Iniciando Timeline: ${this._currentTimeline.name}`);
		console.log('=' * 50);

		await this._startNextSection();

		return true;
	}


	/**
	 * Starts the next section of the timeline. Handles configuration for the section,
	 * including BPM, duration, pattern, and schedule transitions to subsequent sections.
	 * If the section is silent, it schedules a silent period without playback.
	 *
	 * @return {Promise<void>} Resolves when any asynchronous operations, such as pattern playback, are complete.
	 */
	async _startNextSection() {

		if (this._currentSectionIndex >= this._currentTimeline.sections.length) {
			this._finishTimeline();
			return;
		}

		const section = this._currentTimeline.sections[this._currentSectionIndex];
		this._sectionStartTime = performance.now();

		console.log(`\n🎵 Sección ${this._currentSectionIndex + 1}/${this._currentTimeline.sections.length}:`);
		console.log(`   ⏱️ Duración: ${section.duration} compases`);
		console.log(`   🎼 BPM: ${section.bpm}`);
		console.log(`   🎯 Patrón: ${section.pattern}`);

		if (section.silent) {

			console.log(`   🔇 SILENCIO - Mantén el tempo solo!`);
			this._scheduleSilentSection(section);

		} else {

			// Aplicar configuración de la sección
			this._core._bpm = section.bpm;
			this._core._division = section.division;
			this._core._accent = section.accent;
			this._core._currentPattern = section.pattern;

			// Iniciar reproducción con patrón específico
			await this._startPatternPlayback(section);
		}

		// Programar cambio a siguiente sección
		const sectionDurationMs = (section.duration * 4 * 60000) / section.bpm;

		setTimeout(() => {
			this._currentSectionIndex++;
			this._startNextSection();
		}, sectionDurationMs);
	}


	/**
	 * Initiates the playback of a specific pattern based on the provided section.
	 * Configures the core system for the chosen pattern and starts the scheduler
	 * to handle the playback logic.
	 *
	 * @param {Object} section - The section object containing pattern information.
	 * @param {string} section.pattern - The name or identifier of the pattern to be played.
	 *
	 * @return {Promise<void>} A promise that resolves when the pattern playback setup is complete.
	 */
	async _startPatternPlayback(section) {

		const pattern = this._patternLibrary[section.pattern] || this._patternLibrary['straight'];

		// Configurar el core para este patrón específico
		this._core._customPattern = pattern;
		this._core._is_playing = true;
		this._core._tickCount = 0;
		this._core._nextTickTime = performance.now();

		// Usar el scheduler del core pero con lógica de patrón
		this._startPatternScheduler(section, pattern);
	}


	/**
	 * Starts a pattern scheduler for the given section and pattern.
	 * It calculates the interval based on the section's BPM and division,
	 * and plays audio ticks while providing visual feedback for the pattern's beats and accents.
	 *
	 * @param {Object} section - The section object containing BPM and division information to determine timing.
	 * @param {Object} pattern - The pattern object containing beats and accents to define the rhythm.
	 * @return {void} No return value.
	 */
	_startPatternScheduler(section, pattern) {

		const intervalMs = (60000 / section.bpm) / section.division;
		let patternIndex = 0;
		let measureCount = 0;

		const scheduler = setInterval(() => {

			if (!this._isTimelineMode || this._currentSectionIndex >= this._currentTimeline.sections.length) {
				clearInterval(scheduler);
				return;
			}

			const beat = pattern.beats[patternIndex];
			const accent = pattern.accents[patternIndex];

			if (beat > 0) {

				const frequency = accent === 2 ? 1000 : (accent === 1 ? 800 : 600);
				const duration = accent === 2 ? 120 : (accent === 1 ? 100 : 80);

				this._core._audioEngine.playTick(
					accent === 2 ? 'downbeat' : (accent === 1 ? 'beat' : 'subdivision'),
					frequency,
					duration
				);

				// Visual feedback
				const symbol = accent === 2 ? '🔴' : (accent === 1 ? '🔵' : '⚪');
				process.stdout.write(symbol + ' ');

			} else {

				process.stdout.write('⚫ '); // Silencio en el patrón
			}

			patternIndex = (patternIndex + 1) % pattern.beats.length;

			// Contar compases
			if (patternIndex === 0) {

				measureCount++;
				process.stdout.write(`[${measureCount}] `);

				if (measureCount % 4 === 0) {
					process.stdout.write('\n');
				}
			}

		}, intervalMs);

		// Guardar referencia para poder limpiarlo
		this._currentScheduler = scheduler;
	}


	/**
	 * Schedules a silent section for a given duration and BPM (beats per minute).
	 * Displays visual feedback in the console during the silent section.
	 *
	 * @param {Object} section - The section configuration object.
	 * @param {number} section.duration - The duration of the section in measures (1 measure = 4 beats).
	 * @param {number} section.bpm - The tempo of the section in beats per minute.
	 * @return {void} This method does not return a value.
	 */
	_scheduleSilentSection(section) {

		const totalBeats = section.duration * 4;
		const beatDuration = 60000 / section.bpm;

		let currentBeat = 0;
		const silentScheduler = setInterval(() => {
			currentBeat++;

			// Feedback visual durante silencio
			const isDownbeat = (currentBeat - 1) % 4 === 0;
			process.stdout.write(isDownbeat ? '🟡 ' : '⚫ ');

			if (currentBeat % 4 === 0) {
				process.stdout.write(`[${Math.floor(currentBeat / 4)}] `);
			}

			if (currentBeat >= totalBeats) {
				clearInterval(silentScheduler);
			}

		}, beatDuration);
	}


	/**
	 * Finalizes the timeline by stopping any ongoing scheduler, resetting relevant flags, and logging a summary of the timeline performance.
	 *
	 * @return {void} This method does not return a value.
	 */
	_finishTimeline() {

		this._isTimelineMode = false;
		this._core._is_playing = false;

		if (this._currentScheduler) {
			clearInterval(this._currentScheduler);
			this._currentScheduler = null;
		}

		const totalTime = (performance.now() - this._timelineStartTime) / 1000;

		console.log('\n🏁 Timeline completado!');
		console.log(`   ⏱️ Tiempo total: ${totalTime.toFixed(1)}s`);
		console.log(`   🎵 Timeline: ${this._currentTimeline.name}`);
		console.log('   🎯 ¡Excelente práctica!');
		console.log();
	}



	/**
	 * Stops the timeline if it is currently active.
	 * Halts any ongoing timeline playback and clears the scheduler.
	 * Logs the status of the timeline stop operation to the console.
	 *
	 * @return {boolean} Returns true if the timeline was successfully stopped, or false if no timeline was in playback.
	 */
	stopTimeline() {

		if (!this._isTimelineMode) {
			console.log('❌ No hay timeline en reproducción');
			return false;
		}

		this._isTimelineMode = false;
		this._core._is_playing = false;

		if (this._currentScheduler) {
			clearInterval(this._currentScheduler);
			this._currentScheduler = null;
		}

		console.log('⏹️ Timeline detenido');

		return true;
	}


	/**
	 * Retrieves and logs the current status of the timeline.
	 * Logs detailed information about the timeline's current state, including
	 * the timeline name, section index, BPM, pattern, elapsed time, and progress percentage.
	 *
	 * @return {undefined} This method does not return a value. Instead, it logs the timeline status to the console.
	 */
	getTimelineStatus() {

		if (!this._isTimelineMode) {
			console.log('ℹ️ Modo timeline inactivo');
			return;
		}

		const currentSection = this._currentTimeline.sections[this._currentSectionIndex];
		const elapsed = (performance.now() - this._timelineStartTime) / 1000;
		const progress = (this._currentSectionIndex / this._currentTimeline.sections.length) * 100;

		console.log('\n📊 Estado del Timeline:');
		console.log(`   🎬 Timeline: ${this._currentTimeline.name}`);
		console.log(`   📍 Sección: ${this._currentSectionIndex + 1}/${this._currentTimeline.sections.length}`);
		console.log(`   🎼 BPM actual: ${currentSection.bpm}`);
		console.log(`   🎯 Patrón actual: ${currentSection.pattern}`);
		console.log(`   ⏱️ Tiempo transcurrido: ${elapsed.toFixed(1)}s`);
		console.log(`   📊 Progreso: ${progress.toFixed(1)}%`);
		console.log();
	}


	/**
	 * Skips to the next section in the timeline if the timeline mode is active.
	 * If the timeline mode is not active, logs a warning message and does not perform the action.
	 *
	 * @return {boolean} Returns true if the timeline mode is active and the operation is successful, otherwise returns false.
	 */
	skipToNextSection() {

		if (!this._isTimelineMode) {
			console.log('❌ Timeline no activo');
			return false;
		}

		this._currentSectionIndex++;
		console.log('⏭️ Saltando a siguiente sección...');
		this._startNextSection();

		return true;
	}


	/**
	 * Determines whether the application is currently in timeline mode.
	 *
	 * @return {boolean} True if the application is in timeline mode, otherwise false.
	 */
	get isTimelineMode() {

		return this._isTimelineMode;
	}
}

export default TimelineManager;