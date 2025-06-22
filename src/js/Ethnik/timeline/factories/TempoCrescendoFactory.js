import TimelineFactory from './TimelineFactory.js';
import Settings from "../../core/Settings.js";


/**
 * This class is responsible for creating a tempo crescendo timeline.
 * It extends the TimelineFactory base class to generate a structured
 * series of tempo-based workout sections with increasing and decreasing speeds.
 *
 * The timeline includes distinct sections, each defined by a specific
 * duration and beats per minute (BPM), representing a gradual increase
 * to a peak tempo and subsequent controlled deceleration.
 */
class TempoCrescendoFactory extends TimelineFactory {

	/**
	 * Creates and returns a timeline configuration for a training session.
	 * The timeline consists of multiple sections, each with specific duration, BPM (beats per minute),
	 * pattern, and description to guide the training progression.
	 *
	 * @return {Object} An object representing the training timeline with specified sections.
	 */
	createTimeline() {

		const config = Settings.timelineConstants.tempoCrescendo;

		// Aplicar defaults y crear secciones
		const sections = config.sections.map(sectionConfig => {
			return this._createSectionWithDefaults(sectionConfig);
		});

		return this.createTrainingTimeline(config.name, sections);
	}


	/**
	 * Creates a section configuration object by merging user-provided configuration with default values.
	 *
	 * @param {Object} sectionConfig - The user-defined section configuration.
	 * @param {number} [sectionConfig.duration] - The duration of the section in seconds.
	 * @param {number} [sectionConfig.bpm] - Beats per minute (tempo) for the section.
	 * @param {string} [sectionConfig.pattern] - The rhythm pattern of the section (e.g., "straight").
	 * @param {number} [sectionConfig.division] - The time division setting.
	 * @param {number} [sectionConfig.volume] - The volume level for the section.
	 * @param {boolean} [sectionConfig.accent] - Indicates if accenting is enabled.
	 * @param {boolean} [sectionConfig.silent] - Specifies whether the section is silent.
	 * @param {string} [sectionConfig.description] - A description for the section.
	 * @param {number} [sectionConfig.fadeIn] - The fade-in duration for the section in seconds.
	 * @param {number} [sectionConfig.fadeOut] - The fade-out duration for the section in seconds.
	 * @param {Array<string>} [sectionConfig.tracks] - A list of tracks included in the section.
	 * @return {Object} A section configuration object with filled default values where necessary.
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

export default TempoCrescendoFactory;