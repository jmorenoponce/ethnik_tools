import {performance} from 'perf_hooks';
import PatternLibrary from './patterns/PatternLibrary.js';
import BasicTrainingFactory from "./factories/BasicTrainingFactory.js";
import RhythmChallengeFactory from "./factories/RhythmChallengeFactory.js";
import TempoCrescendoFactory from "./factories/TempoCrescendoFactory.js";
import Settings from "../core/Settings.js";
import TickConfiguration from '../audio/TickConfiguration.js';


class TimelineManager {

	/**
	 * Creates an instance of the class with the provided core and initializes
	 * the necessary properties and components for managing timelines, sections,
	 * and schedules.
	 *
	 * @param {Object} core - The core dependency required for initializing the class functionality.
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
	 * Creates and initializes a collection of timeline factories with their respective pattern libraries.
	 *
	 * @return {Map<string, Object>} A map where the keys represent factory types and the values are the corresponding factory instances.
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
	 * Loads a preset timeline based on the provided type.
	 *
	 * @param {string} type The type of timeline preset to load.
	 * @return {boolean} Returns true if the timeline was successfully loaded, false if the preset was not found or an error occurred.
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
	 * Starts the currently loaded timeline, if available. Ensures that the timeline runs under specific conditions,
	 * such as not playing concurrently with an active metronome. Logs status messages and initializes timeline settings
	 * before starting the next section.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if the timeline is successfully started,
	 * or false if no timeline is loaded or if the metronome is currently playing.
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
	 * Initiates and transitions to the next section in the current timeline. Cleans up the previous section,
	 * processes the current section data, and schedules the transition to the next section.
	 *
	 * The method checks if the end of the timeline is reached and, if so, finishes the timeline. Otherwise,
	 * it retrieves the current section information, logs details such as duration, BPM, pattern, and optional
	 * description, and determines whether the section is silent or requires pattern playback. Schedules
	 * the next section accordingly.
	 *
	 * @return {Promise<void>} Resolves when the method completes processing the current section and
	 * schedules the transition to the next section.
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
	 * Starts the playback of a specified pattern within a section.
	 *
	 * The method retrieves the required pattern from the pattern library based on the provided section's pattern name.
	 * If the pattern is not found, it falls back to a default pattern and logs a warning.
	 * Once a pattern is determined, the method applies the section's configuration to the core
	 * and initiates the pattern scheduler for playback.
	 *
	 * @param {Object} section - The section object containing configuration and pattern information.
	 * @param {string} section.pattern - The name of the pattern to be played.
	 * @return {Promise<void>} A promise indicating the completion of the playback start process.
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
	 * Applies the properties of the given section to the core object.
	 *
	 * @param {Object} section - The section object containing BPM, division, accent, and pattern information.
	 * @param {number} section.bpm - The beats per minute value to apply to the core.
	 * @param {string} section.division - The rhythmic division value to apply to the core.
	 * @param {string} section.accent - The accent pattern to apply to the core.
	 * @param {Array} section.pattern - The pattern data to apply to the core.
	 * @return {void} This method does not return any value.
	 */
	_applySectionToCore(section) {

		this._core._bpm = section.bpm;
		this._core._division = section.division;
		this._core._accent = section.accent;
		this._core._currentPattern = section.pattern;
	}


	/**
	 * Starts a scheduler to play a given musical pattern based on the specified section properties.
	 *
	 * @param {Object} section - The section object containing tempo and structure information.
	 * @param {number} section.bpm - Beats per minute for the section.
	 * @param {number} section.division - The number of divisions for the section's timing.
	 * @param {Object} pattern - The pattern object containing beat sequence and arrangement details.
	 * @param {Array} pattern.beats - Array representing the sequence of beats in the pattern.
	 * @return {void} This method does not return a value but schedules the pattern playback at intervals.
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
	 * Plays a specific beat from the given rhythm pattern using the specified pattern index.
	 *
	 * @param {Object} pattern - The rhythm pattern containing beats and accents.
	 * @param {number[]} pattern.beats - An array of beats, where a positive value indicates a beat to be played.
	 * @param {number[]} pattern.accents - An array of accents corresponding to the beats, defining their characteristics.
	 * @param {number} patternIndex - The index of the beat in the pattern to be played.
	 * @return {void} This method does not return a value.
	 */
	_playPatternBeat(pattern, patternIndex) {

		const beat = pattern.beats[patternIndex];
		const accent = pattern.accents[patternIndex];

		if (beat > 0) {
			const frequency = TickConfiguration.getFrequency(accent);
			const duration = TickConfiguration.getDuration(accent);
			const tickType = TickConfiguration.getTickType(accent);

			this._core._audioEngine.playTick(tickType, frequency, duration);

			// Visual feedback
			const symbol = TickConfiguration.getSymbol(accent);
			process.stdout.write(symbol + ' ');
		} else {
			process.stdout.write('⚫ '); // Silence in pattern
		}
	}


	/**
	 * Schedules a silent section for a specified duration and provides visual feedback for each beat.
	 *
	 * @param {Object} section - The section object containing duration and BPM (beats per minute) information.
	 * @param {number} section.duration - The duration of the silent section in measures.
	 * @param {number} section.bpm - The tempo in beats per minute.
	 * @return {void} This method does not return a value.
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
	 * Cleans up the current section by clearing the existing scheduler, if any, and setting it to null.
	 *
	 * @return {void} Does not return any value.
	 */
	_cleanupCurrentSection() {

		if (this._currentScheduler) {
			clearInterval(this._currentScheduler);
			this._currentScheduler = null;
		}
	}


	/**
	 * Schedules the next section to be played by calculating the duration of the current section
	 * and setting a timeout to start the next section.
	 *
	 * @param {Object} section - The section object containing information about the current section.
	 * @param {number} section.duration - The duration of the section in beats.
	 * @param {number} section.bpm - The beats per minute (tempo) of the section.
	 * @return {void} This method does not return a value.
	 */
	_scheduleNextSection(section) {

		const sectionDurationMs = (section.duration * 4 * 60000) / section.bpm;

		this._sectionTimer = setTimeout(() => {
			this._currentSectionIndex++;
			this._startNextSection();
		}, sectionDurationMs);
	}


	/**
	 * Finalizes the current timeline by stopping the timeline tracking process,
	 * calculating the total elapsed time, and logging a summary of the timeline details.
	 *
	 * @return {void} This method does not return a value.
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
	 * Stops the timeline playback if it is currently active.
	 *
	 * @return {boolean} Returns true if the timeline was successfully stopped.
	 * Returns false if the timeline was not active.
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
	 * Stops the timeline mode and performs necessary cleanup operations.
	 *
	 * This method disables the timeline mode by resetting the internal state,
	 * cleans up the current section, and clears any active section timer.
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
	 * Retrieves and logs the current status of the timeline, including timeline details,
	 * current section information, elapsed time, and progress percentage.
	 *
	 * @return {void} This method does not return any value. It logs the timeline status to the console.
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
	 * Skips the current section and proceeds to the next section in timeline mode.
	 * If the timeline mode is not active, the method will log a message and return false.
	 * The current section timer is cleared before moving to the next section.
	 *
	 * @return {boolean} Returns true if the operation is successful and the next section is initiated, otherwise returns false.
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
	 * Retrieves the available timeline types from the internal timeline factories.
	 *
	 * @return {Array} An array of strings representing the available timeline types.
	 */
	getAvailableTimelineTypes() {

		return Array.from(this._timelineFactories.keys());
	}


	/**
	 * Retrieves the pattern library associated with the current instance.
	 *
	 * @return {Object} The pattern library object.
	 */
	getPatternLibrary() {

		return this._patternLibrary;
	}


	/**
	 * Adds a timeline factory to the internal collection and associates it with a given name.
	 * If the factory supports setting a pattern library, it is configured with the current pattern library.
	 *
	 * @param {string} name - The unique identifier for the timeline factory.
	 * @param {Object} factory - The factory object to be added, which may have a `setPatternLibrary` method.
	 * @return {boolean} Returns true if the factory was successfully added.
	 */
	addTimelineFactory(name, factory) {

		if (factory.setPatternLibrary) {
			factory.setPatternLibrary(this._patternLibrary);
		}
		this._timelineFactories.set(name, factory);
		return true;
	}


	/**
	 * Retrieves the information of the current timeline.
	 *
	 * @return {Object|null} An object containing the current timeline's details such as name, type, total sections, total duration, current section index, active status, and creation date, or null if no timeline is active.
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
	 * Determines if the current mode is set to timeline mode.
	 *
	 * @return {boolean} Returns true if the current mode is timeline mode, otherwise false.
	 */
	get isTimelineMode() {

		return this._isTimelineMode;
	}


	/**
	 * Cleans up and releases resources used by the instance. This method stops any active timelines, resets the current timeline, and clears all tracks and timeline factories associated with the instance.
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