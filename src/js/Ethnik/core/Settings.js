/**
 * Central configuration hub for Ethnik Tools
 * This class manages all system constants, default parameters, and configuration definitions
 * in a structured and organized manner.
 */
class Settings {

	// ============================================================================
	// SYSTEM CONTROL
	// ============================================================================

	static debug = false;


	// ============================================================================
	// CORE SYSTEM PARAMETERS
	// ============================================================================

	/**
	 * Default parameters for core system functionality
	 */
	static defaultParams = {
		// BPM Configuration
		bpmMin: 20,
		bpmMax: 218,
		bpmInitial: 100,

		// Division and Volume
		division: 1,
		volume: 70,

		lookahead: 15.0,

		// System Limits
		maxHistorySize: 100,
		debounceTime: 50,
		tapTimeoutMs: 3000
	};


	// ============================================================================
	// AUDIO SYSTEM CONSTANTS
	// ============================================================================

	/**
	 * Audio frequencies and durations for different beat types
	 */
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

	/**
	 * 🆕 NEW: Audio file configuration - centralized file paths
	 * This replaces the hardcoded paths in AudioEngine.js
	 */
	static audioFileConstants = {
		// Primary sound files for different tick types
		soundFiles: {
			downbeat: './Ethnik/defaultAssets/sounds/metronome_sound.mp3',
			beat: './Ethnik/defaultAssets/sounds/metronome_sound.mp3',
			subdivision: './Ethnik/defaultAssets/sounds/metronome_sound.mp3'
		},

		// Volume adjustment for different tick types
		volumes: {
			downbeat: 1.0,    // Full volume for downbeat
			beat: 0.8,        // Slightly quieter for beat
			subdivision: 0.6  // Quieter for subdivisions
		},

		// Fallback sound file if specific types are not available
		fallbackSound: './Ethnik/defaultAssets/sounds/metronome_sound.mp3',

		// Supported audio formats (in order of preference)
		supportedFormats: ['.mp3', '.wav', '.ogg', '.m4a'],

		// Alternative sound locations to search
		searchPaths: [
			'./defaultAssets/sounds/',
			'./assets/sounds/',
			'./sounds/',
			'./audio/'
		]
	};

	/**
	 * Audio detection and analysis configuration
	 */
	static audioDetectionConstants = {
		// Detection Thresholds
		defaultThreshold: 0.1,
		defaultSensitivity: 1.0,

		// Audio Capture Settings
		audioCapture: {
			echoCancellation: false,
			noiseSuppression: false,
			autoGainControl: false,
			sampleRate: 44100
		},

		// FFT Configuration
		fft: {
			size: 2048,
			smoothingTimeConstant: 0.3
		},

		// Frequency Analysis Bands (Hz)
		analysisFrequencies: {
			lowCutoff: 80,
			midCutoff: 1000,
			highCutoff: 8000
		},

		// Level Weights (must sum to 1.0)
		levelWeights: {
			low: 0.3,
			mid: 0.5,
			high: 0.2,
			normalize: 255
		},

		// Processing Parameters
		sensitivityExponent: 1.5,
		attackReleaseRatio: 0.7,

		// Memory Management
		maxDetectionHistory: 10,
		maxLogEntries: 20,

		// BPM Validation Range
		bpmValidRange: {
			min: 1,
			max: 300
		}
	};


	// ============================================================================
	// PERFORMANCE AND MONITORING
	// ============================================================================

	/**
	 * A collection of constants used for performance monitoring and evaluation.
	 * This object defines thresholds and delays for various performance-related operations.
	 *
	 * @property {number} driftWarningThreshold - The threshold value in milliseconds for measuring drift and triggering warnings.
	 * @property {number} highSeverityThreshold - The threshold value in milliseconds indicating high severity performance issues.
	 * @property {number} debounceTime - The debounce time in milliseconds used to limit the frequency of operations or notifications.
	 */
	static performanceConstants = {
		driftWarningThreshold: 10,
		highSeverityThreshold: 20,
		debounceTime: 50
	};

	/**
	 * Rhythm and timing constants
	 */
	static rhythmConstants = {
		// Swing Timing Ratios
		swingRatio: {
			long: 1.33,
			short: 0.67,
			description: "2:1 swing ratio - long notes are 1.33x, short notes are 0.67x"
		},

		// Display Configuration
		display: {
			tickCounterInterval: 16,
			measuresPerDisplayLine: 4,
			beatsPerMeasure: 4
		},

		// Performance Optimization
		performance: {
			validationCacheTimeMs: 1000,
			configChangeThresholdMs: 1000
		}
	};


	// ============================================================================
	// TAP TEMPO CONFIGURATION
	// ============================================================================

	/**
	 * Tap tempo detection and calculation settings
	 */
	static tapTempoConstants = {
		// Basic Configuration
		maxTapHistory: 8,
		minTapsForCalculation: 2,

		// Precision Settings
		accuracyWindow: 0.5,
		outlierDetection: true,

		// Validation Range
		minValidBpm: 30,
		maxValidBpm: 300,

		// Statistical Processing
		useMedian: true,
		smoothingFactor: 0.1,

		// Confidence Calculation
		confidenceFactors: {
			tapWeight: 15,
			maxTapConfidence: 100,
			consistencyWeight: 1
		}
	};


	// ============================================================================
	// VISUAL AND DISPLAY CONFIGURATION
	// ============================================================================

	/**
	 * Visual display constants and layout configuration
	 */
	static visualDisplayConstants = {
		layout: {
			newlineOnDownbeat: true,
			showMeasureMarkers: true,
			showTickCounters: true,
			measureMarkerTemplate: "--- Measure {count} ---"
		}
	};

	/**
	 * Visual audio representation for tone generation
	 */
	static visualAudioConstants = {
		// Tone Generation Configuration
		toneGeneration: {
			intensityLevels: 10,
			maxSymbolIndex: 2,

			// Musical Symbols
			musicSymbols: {
				chars: '♪♫♬',
				descriptions: [
					'Eighth note (low intensity)',
					'Beamed notes (medium intensity)',
					'Multiple notes (high intensity)'
				]
			},

			// Mapping Algorithm
			mapping: {
				algorithm: 'linear',
				minIntensity: 0,
				maxIntensity: 10,
				clampToRange: true
			}
		},

		// Alternative Symbol Sets
		alternativeSymbols: {
			geometric: '●◐◯',
			volume: '🔈🔉🔊',
			classical: '𝄽𝄾𝄿',
			ascii: '.oO'
		},

		// Output Configuration
		output: {
			useColors: false,
			addSpacing: false,
			newlineOnSilence: false
		}
	};

	/**
	 * System-level display and UI constants
	 */
	static systemConstants = {
		// Timing Configuration
		timing: {
			initializationDelayMs: 100,
			playbackResumeDelayMs: 150,
			shutdownDelayMs: 50,
			audioCalibrationDelayMs: 25
		},

		// Console Display
		display: {
			bannerWidth: 55,
			separatorWidth: 50,
			bannerChar: "=",
			separatorChar: "-",

			// Message Templates
			templates: {
				banner: "🎵 Ethnik Tools - Professional Metronome v2.0",
				shutdown: "👋 Closing Ethnik Tools...",
				initialization: "🔊 System initialized successfully"
			}
		},

		// Logging Configuration
		logging: {
			showTimestamps: true,
			debugMode: false,
			logLevel: 'INFO'
		}
	};


	// ============================================================================
	// COMMAND SYSTEM CONFIGURATION
	// ============================================================================

	/**
	 * Command system constants and valid values
	 */
	static commandConstants = {
		// Command aliases mapping
		aliases: {
			'start': 'play',
			'tempo': 'bpm',
			'div': 'division',
			'vol': 'volume',
			'?': 'help',
			'quit': 'exit'
		},

		// Valid pattern types
		validPatterns: ['straight', 'swing', 'custom'],

		// Valid accent command values
		validAccentValues: ['on', 'off', 'true', 'false', '1', '0'],

		// Timeline subcommands
		timelineSubcommands: ['start', 'stop', 'status', 'skip', 'list'],

		// Audio strategy priority order
		audioStrategyPriorities: ['file', 'system', 'tone']
	};


	// ============================================================================
	// TIMELINE SYSTEM CONFIGURATION
	// ============================================================================

	/**
	 * Timeline and training configuration
	 */
	static timelineConstants = {
		// Default Values
		defaults: {
			sectionDuration: 8,
			transitionDuration: 1,
			defaultDivision: 1,
			defaultVolume: 100,
			defaultAccent: true
		},

		// Basic Training Timeline
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

		// Rhythm Challenge Timeline
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

		// Tempo Crescendo Timeline
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

	/**
	 * Custom timeline templates for extension
	 */
	static customTimelineTemplates = {
		technicalPractice: {
			warmupDuration: 4,
			practiceDuration: 8,
			challengeDuration: 4,
			cooldownDuration: 4,
			defaultBpm: 100,
			bpmIncrement: 10
		},

		tempoWork: {
			baseBpm: 80,
			targetBpm: 140,
			steps: 6,
			stepDuration: 6,
			includeBreaks: true,
			breakDuration: 2
		}
	};


	// ============================================================================
	// PRESET SYSTEM CONFIGURATION
	// ============================================================================

	/**
	 * Predefined metronome presets
	 */
	static presetDefinitions = {
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
			accent: false,
			description: "Relaxed reggae tempo with off-beat emphasis",
			genre: "reggae",
			difficulty: "intermediate",
			characteristics: ["laid_back", "off_beat", "groove"],
			recommendedFor: ["reggae_practice", "off_beat_training", "world_music"]
		}
	};

	/**
	 * Preset categorization system
	 */
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
			slow: ["ballad"],
			moderate: ["reggae", "latin", "rock", "funk", "classical"],
			fast: ["jazz", "metal"]
		}
	};


	// ============================================================================
	// FACTORY CONFIGURATION
	// ============================================================================

	/**
	 * Factory system constants
	 */
	static factoryConstants = {
		defaultSectionDuration: 8,
		defaultBpmStep: 20,
		presetCategories: ['classical', 'jazz', 'rock', 'latin', 'custom']
	};


	// ============================================================================
	// MUSICAL KNOWLEDGE BASE
	// ============================================================================

	/**
	 * Tempo name mappings (Italian musical terms)
	 */
	static tempoNames = {
		larghissimo: [20, 39],
		largo: [40, 59],
		lento: [60, 67],
		adagio: [68, 79],
		andante: [80, 99],
		moderato: [100, 111],
		allegretto: [112, 127],
		allegro: [128, 159],
		vivace: [160, 169],
		presto: [170, 199],
		prestissimo: [200, 218]
	};

	/**
	 * Musical division names (Spanish)
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
	};


	// ============================================================================
	// UTILITY METHODS FOR AUDIO FILE MANAGEMENT
	// ============================================================================

	/**
	 * 🆕 NEW: Get the appropriate audio file for a tick type
	 * @param {string} tickType - 'downbeat', 'beat', or 'subdivision'
	 * @return {string} Path to the audio file
	 */
	static getAudioFile(tickType = 'beat') {
		const soundFiles = Settings.audioFileConstants.soundFiles;
		return soundFiles[tickType] || soundFiles.beat || Settings.audioFileConstants.fallbackSound;
	}

	/**
	 * 🆕 NEW: Get volume for specific tick type
	 * @param {string} tickType - 'downbeat', 'beat', or 'subdivision'
	 * @return {number} Volume multiplier (0.0 to 1.0)
	 */
	static getAudioVolume(tickType = 'beat') {
		const volumes = Settings.audioFileConstants.volumes;
		return volumes[tickType] || volumes.beat || 0.8;
	}

	/**
	 * 🆕 NEW: Check if audio file exists
	 * @param {string} filePath - Path to audio file
	 * @return {boolean} True if file exists
	 */
	static audioFileExists(filePath) {
		try {
			const fs = require('fs');
			return fs.existsSync(filePath);
		} catch (error) {
			return false;
		}
	}

	/**
	 * 🆕 NEW: Find best available audio file from search paths
	 * @param {string} fileName - Name of the audio file
	 * @return {string|null} Full path to file or null if not found
	 */
	static findAudioFile(fileName) {
		const searchPaths = Settings.audioFileConstants.searchPaths;
		const supportedFormats = Settings.audioFileConstants.supportedFormats;

		for (const basePath of searchPaths) {
			for (const format of supportedFormats) {
				const fileNameWithFormat = fileName.includes('.') ? fileName : fileName + format;
				const fullPath = basePath + fileNameWithFormat;

				if (Settings.audioFileExists(fullPath)) {
					return fullPath;
				}
			}
		}

		return null;
	}


	// ============================================================================
	// VALIDATION METHODS (KEPT FOR BACKWARD COMPATIBILITY)
	// ============================================================================

	/**
	 * Validates BPM value against system limits
	 * @deprecated Use SettingsValidator.isValidBpm() instead
	 */
	static isValidBpm(bpm) {

		return !isNaN(bpm) &&
			bpm >= Settings.defaultParams.bpmMin &&
			bpm <= Settings.defaultParams.bpmMax;
	}


	/**
	 * Validates division value
	 * @deprecated Use SettingsValidator.isValidDivision() instead
	 */
	static isValidDivision(division) {

		return !isNaN(division) && division >= 1 && division <= 16;
	}


	/**
	 * Validates volume value
	 * @deprecated Use SettingsValidator.isValidVolume() instead
	 */
	static isValidVolume(volume) {

		return !isNaN(volume) && volume >= 0 && volume <= 100;
	}


	/**
	 * Validates basic preset structure
	 * @deprecated Use SettingsValidator.validatePreset() instead
	 */
	static validatePreset(preset) {

		if (!preset || typeof preset !== 'object') {
			Settings.log('Invalid preset: not an object');
			return false;
		}

		const isValid = this.isValidBpm(preset.bpm) &&
			this.isValidDivision(preset.division) &&
			typeof preset.accent === 'boolean';

		if (!isValid) {
			Settings.log('Invalid preset configuration:', preset);
		}

		return isValid;
	}


	/**
	 * Validates extended preset with additional metadata
	 * @deprecated Use SettingsValidator.validateExtendedPreset() instead
	 */
	static validateExtendedPreset(preset) {

		if (!this.validatePreset(preset)) {
			return false;
		}

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


	// ============================================================================
	// UTILITY METHODS
	// ============================================================================

	/**
	 * Debug logging utility
	 */
	static log(...args) {

		if (this.debug) {
			console.log('[DEBUG]', new Date().toISOString(), ...args);
		}
	}


	/**
	 * Get list of tempo names
	 */
	static getTempoList() {

		return Settings.tempoNames;
	}


	/**
	 * Get tempo name for BPM value
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
	 * Get division name
	 */
	static getDivisionName(division) {

		return Settings.divisionNames[division] || `División ${division}`;
	}


	/**
	 * Calculates and returns a visual symbol representing the tone intensity based on a given frequency.
	 * It uses a predefined configuration and symbol set to determine the appropriate visual representation.
	 *
	 * @param {number} frequency The frequency value to calculate the tone intensity and corresponding symbol.
	 * @param {string} [symbolSet='default'] The name of the symbol set to use for obtaining visual symbols. Defaults to 'default'.
	 * @return {string} The visual symbol corresponding to the calculated tone intensity.
	 */
	static getVisualToneSymbol(frequency, symbolSet = 'default') {

		const config = Settings.visualAudioConstants.toneGeneration;
		const maxFreq = Settings.audioConstants.frequencies.downbeat;

		const intensity = Math.floor(
			(frequency / maxFreq) * config.mapping.maxIntensity
		);

		let symbols = config.musicSymbols.chars;
		if (symbolSet !== 'default' && Settings.visualAudioConstants.alternativeSymbols[symbolSet]) {
			symbols = Settings.visualAudioConstants.alternativeSymbols[symbolSet];
		}

		let index = intensity;
		if (config.mapping.clampToRange) {
			index = Math.min(intensity, config.maxSymbolIndex);
			index = Math.max(index, 0);
		}

		return symbols[index] || symbols[symbols.length - 1];
	}


	/**
	 * Get presets filtered by category and subcategory
	 * @deprecated Use SettingsValidator.getPresetsByCategory() instead
	 */
	static getPresetsByCategory(category, subcategory) {

		const categoryMap = Settings.presetCategories[category];
		if (!categoryMap || !categoryMap[subcategory]) {
			return [];
		}

		return categoryMap[subcategory].map(presetName => ({
			name: presetName,
			...Settings.presetDefinitions[presetName]
		}));
	}


	/**
	 * Enable debug mode
	 */
	static enableDebug() {

		this.debug = true;
		this.log('Debug mode enabled');
	}


	/**
	 * Disable debug mode
	 */
	static disableDebug() {

		this.log('Debug mode disabled');
		this.debug = false;
	}
}

export default Settings;