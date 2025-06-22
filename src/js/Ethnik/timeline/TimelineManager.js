import { performance } from 'perf_hooks';
import PatternLibrary from './patterns/PatternLibrary.js';
import {
	BasicTrainingFactory,
	RhythmChallengeFactory,
	TempoCrescendoFactory
} from './factories/FactoriesIndex.js';

/**
 * Manages timeline-based training sessions with multiple sections and patterns.
 * Refactored to use separate Factory and Pattern classes.
 */
class TimelineManager {

	/**
	 * Constructor for initializing the timeline manager with core functionalities and factories.
	 *
	 * @param {Object} core - The core instance providing essential dependencies.
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

		// Initialize pattern library
		this._patternLibrary = new PatternLibrary();

		// Initialize timeline factories
		this._timelineFactories = this._createTimelineFactories();
	}

	/**
	 * Creates and configures timeline factory instances.
	 *
	 * @return {Map} Map of factory names to factory instances.
	 */
	_createTimelineFactories() {
		const factories = new Map();

		// Create factory instances
		const basicFactory = new BasicTrainingFactory();
		const challengeFactory = new RhythmChallengeFactory();
		const crescendoFactory = new TempoCrescendoFactory();

		// Set pattern library for each factory
		basicFactory.setPatternLibrary(this._patternLibrary);
		challengeFactory.setPatternLibrary(this._patternLibrary);
		crescendoFactory.setPatternLibrary(this._patternLibrary);

		// Register factories
		factories.set('basic_training', basicFactory);
		factories.set('rhythm_challenge', challengeFactory);
		factories.set('tempo_crescendo', crescendoFactory);

		return factories;
	}

	/**
	 * Loads a preset timeline using the appropriate factory.
	 *
	 * @param {string} type - The type of preset timeline to load.
	 * @return {boolean} Returns true if the preset timeline was successfully loaded.
	 */
	loadPresetTimeline(type) {
		const factory = this._timelineFactories.get(type);

		if (!factory) {
			console.log(`❌ Timeline preset '${type}' not found`);
			console.log(`💡 Available presets: ${Array.from(this._timelineFactories.keys()).join(', ')}`);
			return false;
		}

		try {
			this._currentTimeline = factory.createTimeline();
			console.log(`📅 Timeline loaded: ${this._currentTimeline.name}`);
			console.log(`   📏 Total duration: ${this._currentTimeline.totalDuration} measures`);
			console.log(`   🎵 Sections: ${this._currentTimeline.sections.length}`);
			console.log(`   🏷️ Type: ${this._currentTimeline.type}`);
			return true;
		} catch (error) {
			console.error(`❌ Error creating timeline: ${error.message}`);
			return false;
		}
	}

	/**
	 * Starts the timeline if a timeline is loaded.
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
	 * Starts the next section of the timeline.
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

		if (section.description) {
			console.log(`   📝 ${section.description}`);
		}

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
	 * Initiates the playback of a specific pattern based on the provided section.
	 *
	 * @param {Object} section - The section object containing pattern information.
	 * @return {Promise<void>} A promise that resolves when the pattern playback setup is complete.
	 */
	async _startPatternPlayback(section) {
		// Get pattern from library
		const pattern = this._patternLibrary.getPattern(section.pattern);

		if (!pattern) {
			console.warn(`⚠️ Pattern '${section.pattern}' not found, using default`);
			const defaultPattern = this._patternLibrary.getPattern('straight');
			this._startPatternScheduler(section, defaultPattern);
		} else {
			// Configure core for this specific pattern
			this._applySectionToCore(section);
			this._startPatternScheduler(section, pattern);
		}
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
	 */
	_getSymbolForAccent(accent) {
		switch (accent) {
			case 2: return '🔴'; // Downbeat
			case 1: return '🔵'; // Beat
			default: return '⚪'; // Subdivision
		}
	}

	/**
	 * Schedules a silent section.
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
	 * Cleans up resources from the current section.
	 */
	_cleanupCurrentSection() {
		if (this._currentScheduler) {
			clearInterval(this._currentScheduler);
			this._currentScheduler = null;
		}
	}

	/**
	 * Schedules the transition to the next section.
	 */
	_scheduleNextSection(section) {
		const sectionDurationMs = (section.duration * 4 * 60000) / section.bpm;

		this._sectionTimer = setTimeout(() => {
			this._currentSectionIndex++;
			this._startNextSection();
		}, sectionDurationMs);
	}

	/**
	 * Finalizes the timeline.
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

		if (currentSection.description) {
			console.log(`   📝 Section: ${currentSection.description}`);
		}
		console.log();
	}

	/**
	 * Skips to the next section in the timeline.
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
	 */
	getAvailableTimelineTypes() {
		return Array.from(this._timelineFactories.keys());
	}

	/**
	 * Gets the pattern library instance.
	 *
	 * @return {PatternLibrary} The pattern library.
	 */
	getPatternLibrary() {
		return this._patternLibrary;
	}

	/**
	 * Adds a new timeline factory.
	 *
	 * @param {string} name - Factory name.
	 * @param {TimelineFactory} factory - Factory instance.
	 * @return {boolean} True if added successfully.
	 */
	addTimelineFactory(name, factory) {
		if (factory.setPatternLibrary) {
			factory.setPatternLibrary(this._patternLibrary);
		}
		this._timelineFactories.set(name, factory);
		return true;
	}

	/**
	 * Gets timeline information.
	 *
	 * @return {Object|null} Current timeline info or null.
	 */
	getCurrentTimelineInfo() {
		if (!this._currentTimeline) return null;

		return {
			name: this._currentTimeline.name,
			type: this._currentTimeline.type,
			totalSections: this._currentTimeline.sections.length,
			totalDuration: this._currentTimeline.totalDuration,
			currentSection: this._currentSectionIndex,
			isActive: this._isTimelineMode,
			createdAt: this._currentTimeline.createdAt
		};
	}

	/**
	 * Determines whether the application is currently in timeline mode.
	 *
	 * @return {boolean} True if the application is in timeline mode.
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
		this._timelineFactories.clear();
	}
}

export default TimelineManager;