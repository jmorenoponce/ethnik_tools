import { performance } from 'perf_hooks';


/**
 * Manages timeline-based training sessions with multiple sections and patterns.
 * Implements Command pattern for timeline operations and Factory pattern for preset creation.
 */
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
		this._currentScheduler = null;
		this._tracks = new Map();

		// Pattern library for different practice types
		this._patternLibrary = this._createPatternLibrary();

		// Timeline factories
		this._timelineFactories = this._createTimelineFactories();
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
			// Basic patterns
			'straight': { beats: [1, 1, 1, 1], accents: [2, 1, 1, 1] },
			'backbeat': { beats: [0, 1, 0, 1], accents: [0, 2, 0, 2] },
			'syncopated': { beats: [1, 0, 1, 0, 1], accents: [2, 0, 1, 0, 2] },
			'triplets': { beats: [1, 1, 1], accents: [2, 1, 1] },

			// Training patterns
			'offbeat_only': { beats: [0, 1, 0, 1], accents: [0, 1, 0, 1] },
			'strong_beats': { beats: [1, 0, 1, 0], accents: [2, 0, 2, 0] },
			'subdivision_16': { beats: [1, 1, 1, 1, 1, 1, 1, 1], accents: [2, 1, 1, 1, 2, 1, 1, 1] },

			// Complex patterns
			'latin_clave': { beats: [1, 0, 1, 0, 1, 0, 0, 1], accents: [2, 0, 2, 0, 2, 0, 0, 2] },
			'jazz_swing': { beats: [1, 0, 1, 1, 0, 1], accents: [2, 0, 1, 2, 0, 1] }
		};
	}


	/**
	 * Creates timeline factory methods for different preset types.
	 *
	 * @return {Object} An object containing factory methods for each timeline type.
	 */
	_createTimelineFactories() {

		return {
			'basic_training': () => this._createBasicTrainingTimeline(),
			'rhythm_challenge': () => this._createRhythmChallengeTimeline(),
			'tempo_crescendo': () => this._createTempoCrescendoTimeline()
		};
	}


	/**
	 * Creates a basic training timeline with progressive difficulty.
	 *
	 * @return {Object} Timeline object for basic training.
	 */
	_createBasicTrainingTimeline() {

		return this._createTrainingTimeline('Basic Training', [
			{ duration: 8, bpm: 80, pattern: 'straight', accent: true },
			{ duration: 4, bpm: 100, pattern: 'straight', accent: true },
			{ duration: 4, bpm: 120, pattern: 'backbeat', accent: true },
			{ duration: 8, bpm: 100, pattern: 'offbeat_only', accent: false },
			{ duration: 4, bpm: 80, pattern: 'straight', silent: true }
		]);
	}


	/**
	 * Creates a rhythm challenge timeline with complex patterns.
	 *
	 * @return {Object} Timeline object for rhythm challenge.
	 */
	_createRhythmChallengeTimeline() {

		return this._createTrainingTimeline('Rhythm Challenge', [
			{ duration: 4, bpm: 90, pattern: 'straight' },
			{ duration: 4, bpm: 90, pattern: 'syncopated' },
			{ duration: 4, bpm: 110, pattern: 'triplets', division: 3 },
			{ duration: 8, bpm: 130, pattern: 'subdivision_16', division: 4 },
			{ duration: 4, bpm: 100, pattern: 'latin_clave' },
			{ duration: 4, bpm: 90, pattern: 'straight', silent: true }
		]);
	}


	/**
	 * Creates a tempo crescendo timeline with gradual speed increases.
	 *
	 * @return {Object} Timeline object for tempo crescendo.
	 */
	_createTempoCrescendoTimeline() {

		return this._createTrainingTimeline('Tempo Crescendo', [
			{ duration: 8, bpm: 60, pattern: 'straight' },
			{ duration: 8, bpm: 80, pattern: 'straight' },
			{ duration: 8, bpm: 100, pattern: 'straight' },
			{ duration: 8, bpm: 120, pattern: 'straight' },
			{ duration: 8, bpm: 140, pattern: 'straight' }, // Fixed typo: was "bmp"
			{ duration: 8, bpm: 120, pattern: 'straight' },
			{ duration: 8, bpm: 100, pattern: 'straight' }
		]);
	}


	/**
	 * Creates a training timeline with specified sections and configurations for each section.
	 *
	 * @param {string} name - The name of the training timeline.
	 * @param {Array<Object>} sections - An array of objects representing the sections of the timeline.
	 * @return {Object} An object representing the training timeline, including its name, configured sections, and total duration.
	 */
	_createTrainingTimeline(name, sections) {

		const timeline = {
			name,
			sections: sections.map(section => this._createTimelineSection(section)),
			totalDuration: sections.reduce((sum, s) => sum + (s.duration || 8), 0)
		};

		return timeline;
	}


	/**
	 * Creates a standardized timeline section with default values.
	 *
	 * @param {Object} sectionConfig - Configuration object for the section.
	 * @return {Object} Normalized section object.
	 */
	_createTimelineSection(sectionConfig) {

		return {
			duration: sectionConfig.duration || 8,
			bpm: sectionConfig.bpm || this._core._bpm,
			pattern: sectionConfig.pattern || 'straight',
			division: sectionConfig.division || 1,
			volume: sectionConfig.volume || 100,
			accent: sectionConfig.accent !== undefined ? sectionConfig.accent : true,
			silent: sectionConfig.silent || false,
			fadeIn: sectionConfig.fadeIn || 0,
			fadeOut: sectionConfig.fadeOut || 0,
			tracks: sectionConfig.tracks || ['main']
		};
	}


	/**
	 * Loads a preset timeline based on the provided type using the factory pattern.
	 *
	 * @param {string} type - The type of preset timeline to load.
	 * @return {boolean} Returns true if the preset timeline was successfully loaded.
	 */
	loadPresetTimeline(type) {

		const factory = this._timelineFactories[type];

		if (!factory) {
			console.log(`❌ Timeline preset '${type}' not found`);
			console.log(`💡 Available presets: ${Object.keys(this._timelineFactories).join(', ')}`);
			return false;
		}

		this._currentTimeline = factory();
		console.log(`📅 Timeline loaded: ${this._currentTimeline.name}`);
		console.log(`   📏 Total duration: ${this._currentTimeline.totalDuration} measures`);
		console.log(`   🎵 Sections: ${this._currentTimeline.sections.length}`);

		return true;
	}


	/**
	 * Starts the timeline if a timeline is loaded and the application is not currently playing a metronome.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if the timeline successfully starts.
	 */
	async startTimeline() {

		if (!this._currentTimeline) {
			console.log('❌ No timeline loaded');
			return false;
		}

		if (this._core._isPlaying) {
			console.log('⚠️ Stop the metronome before using timeline');
			return false;
		}

		this._isTimelineMode = true;
		this._currentSectionIndex = 0;
		this._timelineStartTime = performance.now();

		console.log(`\n🎬 Starting Timeline: ${this._currentTimeline.name}`);
		console.log('='.repeat(50));

		await this._startNextSection();
		return true;
	}


	/**
	 * Starts the next section of the timeline with proper cleanup and configuration.
	 *
	 * @return {Promise<void>} Resolves when the section setup is complete.
	 */
	async _startNextSection() {

		// Clean up previous section
		this._cleanupCurrentSection();

		if (this._currentSectionIndex >= this._currentTimeline.sections.length) {
			this._finishTimeline();
			return;
		}

		const section = this._currentTimeline.sections[this._currentSectionIndex];
		this._sectionStartTime = performance.now();

		console.log(`\n🎵 Section ${this._currentSectionIndex + 1}/${this._currentTimeline.sections.length}:`);
		console.log(`   ⏱️ Duration: ${section.duration} measures`);
		console.log(`   🎼 BPM: ${section.bpm}`);
		console.log(`   🎯 Pattern: ${section.pattern}`);

		if (section.silent) {
			console.log(`   🔇 SILENCE - Keep the tempo yourself!`);
			this._scheduleSilentSection(section);
		} else {
			await this._startPatternPlayback(section);
		}

		// Schedule transition to next section
		this._scheduleNextSection(section);
	}


	/**
	 * Cleans up resources from the current section.
	 *
	 * @return {void} No return value.
	 */
	_cleanupCurrentSection() {

		if (this._currentScheduler) {
			clearInterval(this._currentScheduler);
			this._currentScheduler = null;
		}
	}


	/**
	 * Schedules the transition to the next section.
	 *
	 * @param {Object} section - Current section configuration.
	 * @return {void} No return value.
	 */
	_scheduleNextSection(section) {

		const sectionDurationMs = (section.duration * 4 * 60000) / section.bpm;

		this._sectionTimer = setTimeout(() => {
			this._currentSectionIndex++;
			this._startNextSection();
		}, sectionDurationMs);
	}


	/**
	 * Initiates the playback of a specific pattern based on the provided section.
	 *
	 * @param {Object} section - The section object containing pattern information.
	 * @return {Promise<void>} A promise that resolves when the pattern playback setup is complete.
	 */
	async _startPatternPlayback(section) {

		const pattern = this._patternLibrary[section.pattern] || this._patternLibrary['straight'];

		// Configure core for this specific pattern
		this._applySectionToCore(section);
		this._startPatternScheduler(section, pattern);
	}


	/**
	 * Applies section configuration to the core metronome.
	 *
	 * @param {Object} section - Section configuration to apply.
	 * @return {void} No return value.
	 */
	_applySectionToCore(section) {

		this._core._bpm = section.bpm;
		this._core._division = section.division;
		this._core._accent = section.accent;
		this._core._currentPattern = section.pattern;
	}


	/**
	 * Starts a pattern scheduler for the given section and pattern.
	 *
	 * @param {Object} section - The section object containing BPM and division information.
	 * @param {Object} pattern - The pattern object containing beats and accents.
	 * @return {void} No return value.
	 */
	_startPatternScheduler(section, pattern) {

		const intervalMs = (60000 / section.bpm) / section.division;
		let patternIndex = 0;
		let measureCount = 0;

		this._currentScheduler = setInterval(() => {

			if (!this._isTimelineMode || this._currentSectionIndex >= this._currentTimeline.sections.length) {
				return;
			}

			this._playPatternBeat(pattern, patternIndex);

			patternIndex = (patternIndex + 1) % pattern.beats.length;

			// Count measures and provide visual feedback
			if (patternIndex === 0) {
				measureCount++;
				process.stdout.write(`[${measureCount}] `);

				if (measureCount % 4 === 0) {
					process.stdout.write('\n');
				}
			}

		}, intervalMs);
	}


	/**
	 * Plays a single beat in the pattern.
	 *
	 * @param {Object} pattern - The pattern object containing beats and accents.
	 * @param {number} patternIndex - Current index in the pattern.
	 * @return {void} No return value.
	 */
	_playPatternBeat(pattern, patternIndex) {

		const beat = pattern.beats[patternIndex];
		const accent = pattern.accents[patternIndex];

		if (beat > 0) {
			const frequency = this._getFrequencyForAccent(accent);
			const duration = this._getDurationForAccent(accent);
			const tickType = this._getTickTypeForAccent(accent);

			this._core._audioEngine.playTick(tickType, frequency, duration);

			// Visual feedback
			const symbol = this._getSymbolForAccent(accent);
			process.stdout.write(symbol + ' ');
		} else {
			process.stdout.write('⚫ '); // Silence in pattern
		}
	}


	/**
	 * Gets the appropriate frequency for an accent level.
	 *
	 * @param {number} accent - Accent level (0-2).
	 * @return {number} Frequency in Hz.
	 */
	_getFrequencyForAccent(accent) {

		switch (accent) {
			case 2: return 1000; // Downbeat
			case 1: return 800;  // Beat
			default: return 600; // Subdivision
		}
	}


	/**
	 * Gets the appropriate duration for an accent level.
	 *
	 * @param {number} accent - Accent level (0-2).
	 * @return {number} Duration in milliseconds.
	 */
	_getDurationForAccent(accent) {

		switch (accent) {
			case 2: return 120; // Downbeat
			case 1: return 100; // Beat
			default: return 80; // Subdivision
		}
	}


	/**
	 * Gets the appropriate tick type for an accent level.
	 *
	 * @param {number} accent - Accent level (0-2).
	 * @return {string} Tick type identifier.
	 */
	_getTickTypeForAccent(accent) {

		switch (accent) {
			case 2: return 'downbeat';
			case 1: return 'beat';
			default: return 'subdivision';
		}
	}


	/**
	 * Gets the appropriate visual symbol for an accent level.
	 *
	 * @param {number} accent - Accent level (0-2).
	 * @return {string} Visual symbol.
	 */
	_getSymbolForAccent(accent) {

		switch (accent) {
			case 2: return '🔴'; // Downbeat
			case 1: return '🔵'; // Beat
			default: return '⚪'; // Subdivision
		}
	}


	/**
	 * Schedules a silent section for a given duration and BPM.
	 *
	 * @param {Object} section - The section configuration object.
	 * @return {void} No return value.
	 */
	_scheduleSilentSection(section) {

		const totalBeats = section.duration * 4;
		const beatDuration = 60000 / section.bpm;
		let currentBeat = 0;

		this._currentScheduler = setInterval(() => {
			currentBeat++;

			// Visual feedback during silence
			const isDownbeat = (currentBeat - 1) % 4 === 0;
			process.stdout.write(isDownbeat ? '🟡 ' : '⚫ ');

			if (currentBeat % 4 === 0) {
				process.stdout.write(`[${Math.floor(currentBeat / 4)}] `);
			}

			if (currentBeat >= totalBeats) {
				clearInterval(this._currentScheduler);
				this._currentScheduler = null;
			}

		}, beatDuration);
	}


	/**
	 * Finalizes the timeline by stopping any ongoing processes and logging summary.
	 *
	 * @return {void} No return value.
	 */
	_finishTimeline() {

		this._stopTimeline();

		const totalTime = (performance.now() - this._timelineStartTime) / 1000;

		console.log('\n🏁 Timeline completed!');
		console.log(`   ⏱️ Total time: ${totalTime.toFixed(1)}s`);
		console.log(`   🎵 Timeline: ${this._currentTimeline.name}`);
		console.log('   🎯 Excellent practice!');
		console.log();
	}


	/**
	 * Stops the timeline if it is currently active.
	 *
	 * @return {boolean} Returns true if the timeline was successfully stopped.
	 */
	stopTimeline() {

		if (!this._isTimelineMode) {
			console.log('❌ No timeline in playback');
			return false;
		}

		this._stopTimeline();
		console.log('⏹️ Timeline stopped');
		return true;
	}


	/**
	 * Internal method to stop timeline and clean up resources.
	 *
	 * @return {void} No return value.
	 */
	_stopTimeline() {

		this._isTimelineMode = false;
		this._cleanupCurrentSection();

		if (this._sectionTimer) {
			clearTimeout(this._sectionTimer);
			this._sectionTimer = null;
		}
	}


	/**
	 * Retrieves and logs the current status of the timeline.
	 *
	 * @return {void} No return value.
	 */
	getTimelineStatus() {

		if (!this._isTimelineMode) {
			console.log('ℹ️ Timeline mode inactive');
			return;
		}

		const currentSection = this._currentTimeline.sections[this._currentSectionIndex];
		const elapsed = (performance.now() - this._timelineStartTime) / 1000;
		const progress = (this._currentSectionIndex / this._currentTimeline.sections.length) * 100;

		console.log('\n📊 Timeline Status:');
		console.log(`   🎬 Timeline: ${this._currentTimeline.name}`);
		console.log(`   📍 Section: ${this._currentSectionIndex + 1}/${this._currentTimeline.sections.length}`);
		console.log(`   🎼 Current BPM: ${currentSection.bpm}`);
		console.log(`   🎯 Current pattern: ${currentSection.pattern}`);
		console.log(`   ⏱️ Elapsed time: ${elapsed.toFixed(1)}s`);
		console.log(`   📊 Progress: ${progress.toFixed(1)}%`);
		console.log();
	}


	/**
	 * Skips to the next section in the timeline if the timeline mode is active.
	 *
	 * @return {boolean} Returns true if the operation is successful.
	 */
	skipToNextSection() {

		if (!this._isTimelineMode) {
			console.log('❌ Timeline not active');
			return false;
		}

		// Cancel current section timer
		if (this._sectionTimer) {
			clearTimeout(this._sectionTimer);
			this._sectionTimer = null;
		}

		this._currentSectionIndex++;
		console.log('⏭️ Skipping to next section...');
		this._startNextSection();

		return true;
	}


	/**
	 * Gets available timeline types.
	 *
	 * @return {Array<string>} Array of available timeline type names.
	 */
	getAvailableTimelineTypes() {

		return Object.keys(this._timelineFactories);
	}


	/**
	 * Determines whether the application is currently in timeline mode.
	 *
	 * @return {boolean} True if the application is in timeline mode, otherwise false.
	 */
	get isTimelineMode() {

		return this._isTimelineMode;
	}


	/**
	 * Cleanup method to be called when the manager is no longer needed.
	 *
	 * @return {void} No return value.
	 */
	destroy() {

		this._stopTimeline();
		this._currentTimeline = null;
		this._tracks.clear();
	}
}

export default TimelineManager;