// TimelineManager.js - Sistema de patrones y multipistas

class TimelineManager {

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

	// Crear biblioteca de patrones predefinidos
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

	// Crear un timeline de entrenamiento
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

	// Cargar timeline predefinido para entrenamiento
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

	// Iniciar reproducción de timeline
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

	// Iniciar la siguiente sección del timeline
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

	// Reproducir patrón específico
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

	// Scheduler específico para patrones
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

	// Manejar sección silenciosa
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

	// Finalizar timeline
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

	// Detener timeline
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

	// Obtener información del timeline actual
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

	// Saltar a siguiente sección
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

	// Getter para saber si está en modo timeline
	get isTimelineMode() {
		return this._isTimelineMode;
	}
}

export default TimelineManager;