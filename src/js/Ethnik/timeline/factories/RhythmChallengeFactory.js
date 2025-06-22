import TimelineFactory from './TimelineFactory.js';
import Settings from "../../core/Settings.js";


/**
 * Handles the creation of rhythm challenge timelines with varying BPMs,
 * patterns, and complexities, allowing users to practice rhythm skills.
 * Extends the base `TimelineFactory` class.
 */
class RhythmChallengeFactory extends TimelineFactory {

	/**
	 * Creates a timeline for a rhythm training session.
	 *
	 * The timeline consists of multiple sections, each with a defined duration, tempo (bpm), rhythm pattern, and optional attributes like division or silence.
	 * This method utilizes predefined sections to compose a structured timeline for rhythm practice.
	 *
	 * @return {Object} A training timeline object containing the rhythm challenge sections and configuration.
	 */
	createTimeline() {

		const config = Settings.timelineConstants.rhythmChallenge;

		// Aplicar defaults y crear secciones
		const sections = config.sections.map(sectionConfig => {
			return this._createSectionWithDefaults(sectionConfig);
		});

		return this.createTrainingTimeline(config.name, sections);
	}


	/**
	 * Creates a section configuration object by merging the specified section configuration
	 * with the default settings.
	 *
	 * @param {Object} sectionConfig - Configuration object containing section-specific properties.
	 * @param {number} [sectionConfig.duration] - The duration of the section.
	 * @param {number} [sectionConfig.bpm=120] - Beats per minute for the section.
	 * @param {string} [sectionConfig.pattern='straight'] - The rhythmic pattern of the section.
	 * @param {number|string} [sectionConfig.division=defaultDivision] - The division for the section.
	 * @param {number} [sectionConfig.volume=defaultVolume] - The volume level for the section.
	 * @param {boolean} [sectionConfig.accent=defaultAccent] - Indicates the presence of accentuation in the section.
	 * @param {boolean} [sectionConfig.silent=false] - Indicates whether the section is silent.
	 * @param {string} [sectionConfig.description=''] - An optional description of the section.
	 * @param {number} [sectionConfig.fadeIn=0] - The fade-in duration for the section.
	 * @param {number} [sectionConfig.fadeOut=0] - The fade-out duration for the section.
	 * @param {Array<string>} [sectionConfig.tracks=['main']] - A list of tracks associated with the section.
	 * @return {Object} The resulting section configuration object with resolved default values.
	 */
	_createSectionWithDefaults(sectionConfig) {

		const defaults = Settings.timelineConstants.defaults;

		return {
			duration: sectionConfig.duration || defaults.sectionDuration,
			bpm: sectionConfig.bpm || 120,
			pattern: sectionConfig.pattern || 'straight',
			division: sectionConfig.division || defaults.defaultDivision,
			volume: sectionConfig.volume || defaults.defaultVolume,
			accent: sectionConfig.accent !== undefined ? sectionConfig.accent : defaults.defaultAccent,
			silent: sectionConfig.silent || false,
			description: sectionConfig.description || '',
			fadeIn: sectionConfig.fadeIn || 0,
			fadeOut: sectionConfig.fadeOut || 0,
			tracks: sectionConfig.tracks || ['main']
		};
	}
}

export default RhythmChallengeFactory;