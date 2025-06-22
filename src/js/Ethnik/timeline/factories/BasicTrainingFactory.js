import TimelineFactory from './TimelineFactory.js';
import Settings from "../../core/Settings.js";


/**
 * A factory class that extends TimelineFactory to create a basic training timeline.
 * The basic training timeline is designed to progressively increase difficulty,
 * focusing on rhythmic patterns, tempo control, and silent practice.
 */
class BasicTrainingFactory extends TimelineFactory {

	/**
	 * Creates a training timeline with predefined sections from Settings.
	 * Each section includes specific attributes such as duration, bpm, pattern, accent, and description.
	 * The generated timeline is intended for structured training sessions.
	 *
	 * @return {Object} A training timeline object containing the title and an array of sections with their respective details.
	 */
	createTimeline() {

		const config = Settings.timelineConstants.basicTraining;

		// Aplicar defaults y crear secciones
		const sections = config.sections.map(sectionConfig => {
			return this._createSectionWithDefaults(sectionConfig);
		});

		return this.createTrainingTimeline(config.name, sections);
	}


	/**
	 * Creates a section object with default values if certain properties are not provided in the configuration.
	 *
	 * @param {Object} sectionConfig - The configuration object for the section.
	 * @param {number} [sectionConfig.duration] - The duration of the section in seconds.
	 * @param {number} [sectionConfig.bpm=120] - The beats per minute (BPM) for the section.
	 * @param {string} [sectionConfig.pattern='straight'] - The rhythmic pattern of the section.
	 * @param {number} [sectionConfig.division] - The division of the beat, default is from timeline constants.
	 * @param {number} [sectionConfig.volume] - The volume level, default is from timeline constants.
	 * @param {boolean} [sectionConfig.accent] - Whether the section has an accent, default is from timeline constants.
	 * @param {boolean} [sectionConfig.silent=false] - Whether the section is silent.
	 * @param {string} [sectionConfig.description=''] - The description of the section.
	 * @param {number} [sectionConfig.fadeIn=0] - The fade-in time for the section in seconds.
	 * @param {number} [sectionConfig.fadeOut=0] - The fade-out time for the section in seconds.
	 * @param {Array<string>} [sectionConfig.tracks=['main']] - The list of tracks in the section.
	 * @return {Object} The section object populated with default values where necessary.
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

export default BasicTrainingFactory;