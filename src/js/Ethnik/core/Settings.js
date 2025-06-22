/**
 * The `Settings` class manages and provides default parameters, tempo names,
 * division names, and validation methods for a rhythm helper application.
 * It also includes debugging capabilities and utility functions for
 * handling presets and configurations.
 */
class Settings {

	static debug = false;

	static audioConstants = {

		frequencies: {
			downbeat: 1000,
			beat: 800,
			subdivision: 600
		},
		durations: {
			downbeat: 120,
			beat: 100,
			subdivision: 80
		}
	};

	static performanceConstants = {

		driftWarningThreshold: 10,
		highSeverityThreshold: 20,
		debounceTime: 50
	};

	static audioDetectionConstants = {
		// Valores por defecto para umbrales
		defaultThreshold: 0.1,
		defaultSensitivity: 1.0,

		// Configuración de captura de audio
		audioCapture: {
			echoCancellation: false,
			noiseSuppression: false,
			autoGainControl: false,
			sampleRate: 44100
		},

		// Configuración FFT (Fast Fourier Transform)
		fft: {
			size: 2048,
			smoothingTimeConstant: 0.3
		},

		// Frecuencias de análisis en Hz
		analysisFrequencies: {
			lowCutoff: 80,      // Frecuencia de corte para graves
			midCutoff: 1000,    // Frecuencia de corte para medios
			highCutoff: 8000    // Frecuencia de corte para agudos
		},

		// Pesos para análisis de nivel (deben sumar 1.0)
		levelWeights: {
			low: 0.3,           // Peso de frecuencias graves
			mid: 0.5,           // Peso de frecuencias medias
			high: 0.2,          // Peso de frecuencias agudas
			normalize: 255      // Factor de normalización FFT
		},

		// Parámetros de procesamiento
		sensitivityExponent: 1.5,     // Exponente para ajuste de sensibilidad
		attackReleaseRatio: 0.7,      // Ratio para detectar fin de ataque (70% del threshold)

		// Límites de memoria y performance
		maxDetectionHistory: 10,      // Máximo número de detecciones en historial
		maxLogEntries: 20,           // Máximo número de entradas en el log

		// Validación de BPM estimado
		bpmValidRange: {
			min: 1,              // BPM mínimo válido
			max: 300            // BPM máximo válido
		}
	};

	static timelineConstants = {
		// Configuraciones por defecto para todas las timelines
		defaults: {
			sectionDuration: 8,
			transitionDuration: 1,
			defaultDivision: 1,
			defaultVolume: 100,
			defaultAccent: true
		},

		// Configuración específica para Basic Training
		basicTraining: {
			name: "Basic Training",
			type: "basic_training",
			description: "Progressive basic training for rhythm development",

			sections: [
				{
					id: "warmup",
					duration: 8,
					bpm: 80,
					pattern: 'straight',
					accent: true,
					description: 'Warm-up - slow straight rhythm'
				},
				{
					id: "building",
					duration: 4,
					bpm: 100,
					pattern: 'straight',
					accent: true,
					description: 'Building tempo'
				},
				{
					id: "backbeat_intro",
					duration: 4,
					bpm: 120,
					pattern: 'backbeat',
					accent: true,
					description: 'Backbeat introduction'
				},
				{
					id: "offbeat_training",
					duration: 8,
					bpm: 100,
					pattern: 'offbeat_only',
					accent: false,
					description: 'Offbeat training'
				},
				{
					id: "silent_practice",
					duration: 4,
					bpm: 80,
					pattern: 'straight',
					silent: true,
					description: 'Silent practice - maintain tempo'
				}
			]
		},

		// Configuración específica para Rhythm Challenge
		rhythmChallenge: {
			name: "Rhythm Challenge",
			type: "rhythm_challenge",
			description: "Advanced rhythmic challenge with complex patterns",

			sections: [
				{
					id: "baseline",
					duration: 4,
					bpm: 90,
					pattern: 'straight',
					description: 'Baseline straight rhythm'
				},
				{
					id: "syncopation",
					duration: 4,
					bpm: 90,
					pattern: 'syncopated',
					description: 'Syncopation challenge'
				},
				{
					id: "triplets",
					duration: 4,
					bpm: 110,
					pattern: 'triplets',
					division: 3,
					description: 'Triplet patterns'
				},
				{
					id: "subdivisions",
					duration: 8,
					bpm: 130,
					pattern: 'subdivision_16',
					division: 4,
					description: '16th note subdivisions'
				},
				{
					id: "latin_clave",
					duration: 4,
					bpm: 100,
					pattern: 'latin_clave',
					description: 'Latin clave pattern'
				},
				{
					id: "final_challenge",
					duration: 4,
					bpm: 90,
					pattern: 'straight',
					silent: true,
					description: 'Final silent challenge'
				}
			]
		},

		// Configuración específica para Tempo Crescendo
		tempoCrescendo: {
			name: "Tempo Crescendo",
			type: "tempo_crescendo",
			description: "Gradual tempo increase and decrease exercise",

			sections: [
				{
					id: "very_slow",
					duration: 8,
					bpm: 60,
					pattern: 'straight',
					description: 'Very slow start'
				},
				{
					id: "gradual_1",
					duration: 8,
					bpm: 80,
					pattern: 'straight',
					description: 'Gradual acceleration'
				},
				{
					id: "moderate",
					duration: 8,
					bpm: 100,
					pattern: 'straight',
					description: 'Moderate tempo'
				},
				{
					id: "fast",
					duration: 8,
					bpm: 120,
					pattern: 'straight',
					description: 'Fast tempo'
				},
				{
					id: "peak",
					duration: 8,
					bpm: 140,
					pattern: 'straight',
					description: 'Peak tempo'
				},
				{
					id: "descent_1",
					duration: 8,
					bpm: 120,
					pattern: 'straight',
					description: 'Controlled descent'
				},
				{
					id: "cooldown",
					duration: 8,
					bpm: 100,
					pattern: 'straight',
					description: 'Cool down'
				}
			]
		}
	};

	static customTimelineTemplates = {
		// Template para práctica técnica
		technicalPractice: {
			warmupDuration: 4,
			practiceDuration: 8,
			challengeDuration: 4,
			cooldownDuration: 4,
			defaultBpm: 100,
			bpmIncrement: 10
		},

		// Template para trabajo de tempo
		tempoWork: {
			baseBpm: 80,
			targetBpm: 140,
			steps: 6,
			stepDuration: 6,
			includeBreaks: true,
			breakDuration: 2
		}
	};

	static presetDefinitions = {
		// Presets musicales clásicos
		classical: {
			name: "Classical",
			bpm: 120,
			division: 1,
			accent: true,
			description: "Traditional classical music tempo with quarter note emphasis",
			genre: "classical",
			difficulty: "beginner",
			characteristics: ["steady", "moderate", "traditional"],
			recommendedFor: ["sight_reading", "classical_practice", "beginners"]
		},

		jazz: {
			name: "Jazz",
			bpm: 140,
			division: 4,
			accent: true,
			description: "Swing jazz tempo with sixteenth note subdivisions",
			genre: "jazz",
			difficulty: "intermediate",
			characteristics: ["swing", "complex", "syncopated"],
			recommendedFor: ["jazz_practice", "improvisation", "advanced_timing"]
		},

		rock: {
			name: "Rock",
			bpm: 120,
			division: 2,
			accent: true,
			description: "Rock steady beat with eighth note feel",
			genre: "rock",
			difficulty: "beginner",
			characteristics: ["driving", "steady", "powerful"],
			recommendedFor: ["rock_practice", "band_rehearsal", "groove_work"]
		},

		latin: {
			name: "Latin",
			bpm: 100,
			division: 4,
			accent: true,
			description: "Latin groove with complex rhythmic patterns",
			genre: "latin",
			difficulty: "intermediate",
			characteristics: ["syncopated", "groove", "polyrhythmic"],
			recommendedFor: ["latin_practice", "rhythm_training", "cultural_music"]
		},

		// Presets adicionales que podemos agregar fácilmente
		ballad: {
			name: "Ballad",
			bpm: 80,
			division: 1,
			accent: true,
			description: "Slow ballad tempo for expressive playing",
			genre: "ballad",
			difficulty: "beginner",
			characteristics: ["slow", "expressive", "emotional"],
			recommendedFor: ["ballad_practice", "expression_work", "slow_songs"]
		},

		funk: {
			name: "Funk",
			bpm: 110,
			division: 4,
			accent: true,
			description: "Funky groove with tight sixteenth note subdivisions",
			genre: "funk",
			difficulty: "advanced",
			characteristics: ["tight", "groove", "complex"],
			recommendedFor: ["funk_practice", "groove_training", "rhythm_mastery"]
		},

		metal: {
			name: "Metal",
			bpm: 160,
			division: 2,
			accent: true,
			description: "Fast metal tempo with driving eighth note pulse",
			genre: "metal",
			difficulty: "advanced",
			characteristics: ["fast", "aggressive", "precise"],
			recommendedFor: ["metal_practice", "speed_training", "precision_work"]
		},

		reggae: {
			name: "Reggae",
			bpm: 90,
			division: 2,
			accent: false,  // Reggae emphasizes off-beats
			description: "Relaxed reggae tempo with off-beat emphasis",
			genre: "reggae",
			difficulty: "intermediate",
			characteristics: ["laid_back", "off_beat", "groove"],
			recommendedFor: ["reggae_practice", "off_beat_training", "world_music"]
		}
	};

	static presetCategories = {
		byGenre: {
			classical: ["classical", "ballad"],
			popular: ["rock", "jazz", "funk"],
			world: ["latin", "reggae"],
			extreme: ["metal"]
		},

		byDifficulty: {
			beginner: ["classical", "rock", "ballad"],
			intermediate: ["jazz", "latin", "reggae"],
			advanced: ["funk", "metal"]
		},

		byTempo: {
			slow: ["ballad"],           // < 90 BPM
			moderate: ["reggae", "latin", "rock", "funk", "classical"],  // 90-140 BPM
			fast: ["jazz", "metal"]     // > 140 BPM
		}
	};


	static systemConstants = {
		// Delays de timing del sistema
		timing: {
			initializationDelayMs: 100,    // Delay para inicialización de audio
			playbackResumeDelayMs: 150,    // Delay para reanudar después de pausa
			shutdownDelayMs: 50,           // Delay para operaciones de shutdown
			audioCalibrationDelayMs: 25    // Delay para calibración de audio
		},

		// Configuración de display de consola
		display: {
			bannerWidth: 55,               // Ancho del banner principal
			separatorWidth: 50,            // Ancho de separadores secundarios
			bannerChar: "=",               // Carácter para banners
			separatorChar: "-",            // Carácter para separadores

			// Templates de mensajes
			templates: {
				banner: "🎵 Ethnik Tools - Professional Metronome v2.0",
				shutdown: "👋 Closing Ethnik Tools...",
				initialization: "🔊 System initialized successfully"
			}
		},

		// Configuración de logging y debug
		logging: {
			showTimestamps: true,          // Mostrar timestamps en logs
			debugMode: false,              // Modo debug por defecto
			logLevel: 'INFO'               // Nivel de log por defecto
		}
	};

	static visualAudioConstants = {

		// Configuración de generación visual de tonos
		toneGeneration: {
			intensityLevels: 10,              // Niveles de intensidad para mapeo
			maxSymbolIndex: 2,                // Índice máximo en array de símbolos

			// Símbolos musicales por intensidad (de menor a mayor)
			musicSymbols: {
				chars: '♪♫♬',                 // String de símbolos disponibles
				descriptions: [
					'Eighth note (low intensity)',     // ♪
					'Beamed notes (medium intensity)', // ♫
					'Multiple notes (high intensity)'  // ♬
				]
			},

			// Algoritmo de mapeo frecuencia → intensidad
			mapping: {
				algorithm: 'linear',          // 'linear', 'logarithmic', 'exponential'
				minIntensity: 0,             // Intensidad mínima
				maxIntensity: 10,            // Intensidad máxima
				clampToRange: true           // Limitar intensidad al rango válido
			}
		},

		// Configuración alternativa de símbolos (para futuras extensiones)
		alternativeSymbols: {
			// Símbolos geométricos
			geometric: '●◐◯',
			// Símbolos de volumen
			volume: '🔈🔉🔊',
			// Símbolos de notas clásicas
			classical: '𝄽𝄾𝄿',
			// Símbolos simples ASCII
			ascii: '.oO'
		},

		// Configuración de output visual
		output: {
			useColors: false,             // Para futuro soporte de colores ANSI
			addSpacing: false,            // Agregar espacios entre símbolos
			newlineOnSilence: false       // Nueva línea en silencios largos
		}
	};

	static factoryConstants = {
		// Para Timeline Factories
		defaultSectionDuration: 8,        // Duración por defecto de secciones
		defaultBpmStep: 20,               // Incremento de BPM por defecto

		// Para Preset Factory
		presetCategories: ['classical', 'jazz', 'rock', 'latin', 'custom']
	};

	static rhythmConstants = {
		// Configuración de swing
		swingRatio: {
			long: 1.33,         // Nota larga en swing (4/3)
			short: 0.67,        // Nota corta en swing (2/3)
			description: "2:1 swing ratio - long notes are 1.33x, short notes are 0.67x"
		},

		// Configuración de display y contadores
		display: {
			tickCounterInterval: 16,        // Mostrar contador cada N ticks
			measuresPerDisplayLine: 4,      // Nueva línea cada N compases
			beatsPerMeasure: 4             // Beats por compás (para cálculos)
		},

		// Configuración de cache y performance
		performance: {
			validationCacheTimeMs: 1000,   // Tiempo de cache para validaciones (1 segundo)
			configChangeThresholdMs: 1000  // Umbral para detectar cambios de configuración
		}
	};

	static visualDisplayConstants = {
		// Símbolos para diferentes tipos de beat (ya existían en TickConfiguration)
		// Pero agregar configuración de layout
		layout: {
			newlineOnDownbeat: true,        // Nueva línea en downbeats
			showMeasureMarkers: true,       // Mostrar marcadores de compás
			showTickCounters: true,         // Mostrar contadores de tick
			measureMarkerTemplate: "--- Measure {count} ---"
		}
	};

	/**
	 * An object containing the default configuration parameters for the application.
	 *
	 * Properties:
	 * - bpmMin: Minimum beats per minute (BPM) value.
	 * - bpmMax: Maximum beats per minute (BPM) value.
	 * - bpmInitial: Initial beats per minute (BPM) value on load.
	 * - division: The subdivision or multiplier used for setting tempo granularity.
	 * - volume: Default volume level expressed as a percentage (0-100).
	 * - soundFile: Path to the default sound file used for feedback or metronome sound.
	 * - lookahead: Time in milliseconds to look ahead when scheduling audio events.
	 * - maxHistorySize: Maximum number of entries to maintain in the history log.
	 * - debounceTime: Debouncing time in milliseconds to handle rapid user interactions.
	 * - tapTimeoutMs: Time in milliseconds to reset the tap tempo timeout.
	 *
	 * This object acts as a configuration preset for initializing application state
	 * or default behaviors.
	 */
	static defaultParams = {

		bpmMin: 		20,
		bpmMax: 		218,
		bpmInitial: 	100,
		division:		1,
		volume: 		70,
		soundFile: 		'./defaultAssets/sounds/rhythmHelper_classic_sound.ogg',
		lookahead:		15.0,
		maxHistorySize:	100,
		debounceTime:	50,
		tapTimeoutMs:	3000
	}


	static tapTempoConstants = {
		// Configuración básica
		maxTapHistory: 8,           // Máximo número de taps almacenados
		minTapsForCalculation: 2,   // Mínimo taps necesarios para BPM

		// Configuración de precisión
		accuracyWindow: 0.5,        // Ventana de precisión para filtrar outliers (50%)
		outlierDetection: true,     // Activar detección de outliers

		// Configuración de validación
		minValidBpm: 30,           // BPM mínimo considerado válido para tap tempo
		maxValidBpm: 300,          // BPM máximo considerado válido para tap tempo

		// Configuración de estadísticas
		useMedian: true,           // Usar mediana en lugar de promedio para mejor precisión
		smoothingFactor: 0.1,      // Factor de suavizado para cambios de BPM

		// Configuración de confianza
		confidenceFactors: {
			tapWeight: 15,         // Peso por tap en cálculo de confianza
			maxTapConfidence: 100, // Máxima confianza por número de taps
			consistencyWeight: 1   // Peso de la consistencia en confianza
		}
	};


	/**
	 * Represents a mapping of tempo names to their corresponding BPM (Beats Per Minute) ranges.
	 * Each property of the object corresponds to a tempo name, with the value being an array
	 * representing the minimum and maximum BPM for that tempo.
	 *
	 * Properties:
	 * - larghissimo: [20, 39] - Extremely slow tempo.
	 * - largo: [40, 59] - Very slow, broad tempo.
	 * - lento: [60, 67] - Slowly, sustained tempo.
	 * - adagio: [68, 79] - Slow and stately tempo.
	 * - andante: [80, 99] - Walking pace, moderate tempo.
	 * - moderato: [100, 111] - Moderately paced tempo.
	 * - allegretto: [112, 127] - Moderately fast tempo.
	 * - allegro: [128, 159] - Fast, lively tempo.
	 * - vivace: [160, 169] - Lively and brisk tempo.
	 * - presto: [170, 199] - Very fast tempo.
	 * - prestissimo: [200, 218] - Extremely fast tempo.
	 */
	static tempoNames = {

		larghissimo: 	[20, 39],
		largo:			[40, 59],
		lento:			[60, 67],
		adagio:			[68, 79],
		andante:		[80, 99],
		moderato:		[100, 111],
		allegretto:		[112, 127],
		allegro:		[128, 159],
		vivace:			[160, 169],
		presto:			[170, 199],
		prestissimo:	[200, 218]
	}


	/**
	 * An object that maps numerical division keys to their corresponding musical note division names.
	 * The keys represent division factors, and the values are the names of the respective musical note divisions.
	 *
	 * Properties:
	 * - 1: Represents "Negras (1/4)"
	 * - 2: Represents "Corcheas (1/8)"
	 * - 3: Represents "Tresillos"
	 * - 4: Represents "Semicorcheas (1/16)"
	 * - 6: Represents "Seisillos"
	 * - 8: Represents "Fusas (1/32)"
	 * - 12: Represents "Docesillos"
	 * - 16: Represents "Semicorcheas cuádruples"
	 */
	static divisionNames = {

		1: "Negras (1/4)",
		2: "Corcheas (1/8)",
		3: "Tresillos",
		4: "Semicorcheas (1/16)",
		6: "Seisillos",
		8: "Fusas (1/32)",
		12: "Docesillos",
		16: "Semicorcheas cuádruples"
	}


	/**
	 * Logs a debug message to the console if debugging is enabled.
	 *
	 * @param {...any} args - The arguments to be logged. These can be any type and are passed to `console.log`.
	 * @return {void} This method does not return a value.
	 */
	static log(...args) {

		if (this.debug) {
			console.log('[DEBUG]', new Date().toISOString(), ...args);
		}
	}


	/**
	 * Retrieves the list of tempo names from the application settings.
	 *
	 * @return {Array} An array containing the names of tempos available in the settings.
	 */
	static getTempoList() {

		return Settings.tempoNames;
	}


	/**
	 * Retrieves the tempo name corresponding to a given beats per minute (BPM) value.
	 *
	 * @param {number} bpm - The beats per minute value to evaluate.
	 * @return {string} The tempo name corresponding to the BPM value, or 'unknown' if no match is found.
	 */
	static getTempoName(bpm) {

		for (const tempoName in Settings.tempoNames) {

			const [min, max] = Settings.tempoNames[tempoName];
			if (bpm >= min && bpm <= max) {
				return tempoName;
			}
		}

		return 'unknown';
	}


	/**
	 * Retrieves the name of the division based on the given division identifier.
	 *
	 * @param {string|number} division - The identifier for the division.
	 * @return {string} The name of the division associated with the given identifier, or a default formatted name if not found.
	 */
	static getDivisionName(division) {

		return Settings.divisionNames[division] || `División ${division}`;
	}


	/**
	 * Checks if the provided BPM (beats per minute) value is valid.
	 *
	 * A BPM value is considered valid if it is a number and falls within
	 * the predefined minimum and maximum BPM range defined in the Settings.
	 *
	 * @param {number} bpm - The BPM value to be validated.
	 * @return {boolean} True if the bpm is valid, otherwise false.
	 */
	static isValidBpm(bpm) {

		return !isNaN(bpm) && bpm >= Settings.defaultParams.bpmMin && bpm <= Settings.defaultParams.bpmMax;
	}


	/**
	 * Checks if the provided division value is valid.
	 *
	 * A valid division is a number between 1 and 16 (inclusive).
	 *
	 * @param {number} division - The division value to validate.
	 * @return {boolean} Returns true if the division is valid, otherwise false.
	 */
	static isValidDivision(division) {

		return !isNaN(division) && division >= 1 && division <= 16;
	}


	/**
	 * Validates if the given volume is within the acceptable range.
	 *
	 * @param {number} volume - The volume value to be validated.
	 * @return {boolean} Returns true if the volume is a number between 0 and 100 (inclusive), otherwise false.
	 */
	static isValidVolume(volume) {

		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Validates a given preset object to ensure it meets specific configuration requirements.
	 *
	 * @param {Object} preset - The preset object to be validated.
	 * @param {number} preset.bpm - The beats per minute (bpm) value of the preset.
	 * @param {string} preset.division - The division value of the preset.
	 * @param {boolean} preset.accent - The accent flag indicating specific configuration.
	 * @return {boolean} Returns true if the preset is valid; otherwise, returns false.
	 */
	static validatePreset(preset) {

		if (!preset || typeof preset !== 'object') {
			this.log('Invalid preset: not an object');
			return false;
		}

		const isValid = this.isValidBpm(preset.bpm) &&
			this.isValidDivision(preset.division) &&
			typeof preset.accent === 'boolean';

		if (!isValid) {
			this.log('Invalid preset configuration:', preset);
		}

		return isValid;
	}


	/**
	 * Enables debug mode for the application, allowing more detailed logging information.
	 * This method sets the internal 'debug' state to true and logs a confirmation message.
	 *
	 * @return {void} Does not return a value.
	 */
	static enableDebug() {

		this.debug = true;
		this.log('Debug mode enabled');
	}


	/**
	 * Disables the debug mode for the application. Once called, debug logs and related functionality will be turned off.
	 *
	 * @return {void} This method does not return any value.
	 */
	static disableDebug() {

		this.log('Debug mode disabled');
		this.debug = false;
	}

	static getVisualToneSymbol(frequency, symbolSet = 'default') {

		const config = this.visualAudioConstants.toneGeneration;
		const maxFreq = this.audioConstants.frequencies.downbeat;

		// Calcular intensidad usando configuración centralizada
		const intensity = Math.floor(
			(frequency / maxFreq) * config.mapping.maxIntensity
		);

		// Seleccionar set de símbolos
		let symbols = config.musicSymbols.chars;
		if (symbolSet !== 'default' && this.visualAudioConstants.alternativeSymbols[symbolSet]) {
			symbols = this.visualAudioConstants.alternativeSymbols[symbolSet];
		}

		// Obtener índice con clamp opcional
		let index = intensity;
		if (config.mapping.clampToRange) {
			index = Math.min(intensity, config.maxSymbolIndex);
			index = Math.max(index, 0);
		}

		return symbols[index] || symbols[symbols.length - 1];
	}

	static generateCrescendoSections() {

		const config = this.timelineConstants.tempoCrescendo.crescendoConfig;
		const sections = [];
		let currentBpm = config.startBpm;

		// Fase ascendente
		for (let i = 0; i < config.stepsUp; i++) {
			sections.push({
				id: `crescendo_step_${i + 1}`,
				duration: config.stepDuration,
				bpm: currentBpm,
				pattern: 'straight',
				description: this._getCrescendoDescription(currentBpm, 'ascending'),
				tags: ['crescendo', 'ascending', `step_${i + 1}`]
			});
			currentBpm += config.bpmIncrement;
		}

		// Pico
		sections.push({
			id: 'peak',
			duration: config.stepDuration,
			bpm: config.peakBpm,
			pattern: 'straight',
			description: 'Peak tempo',
			tags: ['peak', 'maximum_tempo']
		});

		// Fase descendente
		currentBpm = config.peakBpm - config.bpmIncrement;
		for (let i = 0; i < config.stepsDown; i++) {
			sections.push({
				id: `diminuendo_step_${i + 1}`,
				duration: config.stepDuration,
				bpm: currentBpm,
				pattern: 'straight',
				description: this._getCrescendoDescription(currentBpm, 'descending'),
				tags: ['diminuendo', 'descending', `step_${i + 1}`]
			});
			currentBpm -= config.bpmIncrement;
		}

		return sections;
	}


	static _getCrescendoDescription(bpm, phase) {

		const tempoName = this.getTempoName(bpm);
		if (phase === 'ascending') {
			return `Gradual acceleration - ${bpm} BPM (${tempoName})`;
		} else {
			return `Controlled descent - ${bpm} BPM (${tempoName})`;
		}
	}


	static getPresetsByCategory(category, subcategory) {

		const categoryMap = this.presetCategories[category];
		if (!categoryMap || !categoryMap[subcategory]) {
			return [];
		}

		return categoryMap[subcategory].map(presetName => ({
			name: presetName,
			...this.presetDefinitions[presetName]
		}));
	}

	static validateExtendedPreset(preset) {

		if (!this.validatePreset(preset)) {
			return false;
		}

		// Validaciones adicionales opcionales
		const validGenres = ['classical', 'jazz', 'rock', 'latin', 'ballad', 'funk', 'metal', 'reggae', 'custom'];
		const validDifficulties = ['beginner', 'intermediate', 'advanced'];

		if (preset.genre && !validGenres.includes(preset.genre)) {
			return false;
		}

		if (preset.difficulty && !validDifficulties.includes(preset.difficulty)) {
			return false;
		}

		return true;
	}
}

export default Settings;