
/**
 * A factory class for creating and managing timelines and their sections.
 * This class serves as a base for creating customized timelines, allowing
 * extensions through subclassing to define specific timeline behaviors or formats.
 */
class TimelineFactory {

	/**
	 * Constructs an instance of the class and initializes its properties.
	 *
	 * @return {Object} An instance of the class with default values set.
	 */
	constructor() {

		this._patternLibrary = null;
	}


	/**
	 * Sets the pattern library for the system.
	 *
	 * @param {Object} patternLibrary - The pattern library object to be set.
	 * @return {void} Updates the internal pattern library reference.
	 */
	setPatternLibrary(patternLibrary) {

		this._patternLibrary = patternLibrary;
	}


	/**
	 * Creates a timeline object. This method is abstract and must be implemented by subclasses.
	 * @return {Object} The timeline object created. The exact structure and properties of the object depend on the implementation in the subclass.
	 */
	createTimeline() {

		throw new Error('createTimeline method must be implemented by subclasses');
	}


	/**
	 * Creates and returns a timeline section configuration object with default values if not provided.
	 *
	 * @param {Object} sectionConfig - The configuration options for the timeline section.
	 * @param {number} [sectionConfig.duration=8] - The duration of the section, in beats.
	 * @param {number} [sectionConfig.bpm=120] - Beats per minute for the section.
	 * @param {string} [sectionConfig.pattern='straight'] - The rhythmic pattern to be applied.
	 * @param {number} [sectionConfig.division=1] - Divisions for the beat in the section.
	 * @param {number} [sectionConfig.volume=100] - Volume level of the section (0-100).
	 * @param {boolean} [sectionConfig.accent=true] - Indicates whether accents are applied to the section.
	 * @param {boolean} [sectionConfig.silent=false] - Indicates whether the section is silent.
	 * @param {number} [sectionConfig.fadeIn=0] - Fade-in duration at the beginning of the section.
	 * @param {number} [sectionConfig.fadeOut=0] - Fade-out duration at the end of the section.
	 * @param {Array<string>} [sectionConfig.tracks=['main']] - List of tracks included in the section.
	 *
	 * @return {Object} The constructed timeline section configuration object.
	 */
	createTimelineSection(sectionConfig) {

		return {
			duration: sectionConfig.duration || 8,
			bpm: sectionConfig.bpm || 120,
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
	 * Creates a training timeline object with provided name and sections.
	 *
	 * @param {string} name - The name of the training timeline.
	 * @param {Array<Object>} sections - An array of section objects, each containing details like duration.
	 * @return {Object} A training timeline object containing name, processed sections, total duration, creation timestamp, and type.
	 */
	createTrainingTimeline(name, sections) {

		const timeline = {
			name,
			sections: sections.map(section => this.createTimelineSection(section)),
			totalDuration: sections.reduce((sum, s) => sum + (s.duration || 8), 0),
			createdAt: new Date().toISOString(),
			type: this.constructor.name.replace('Factory', '').toLowerCase()
		};

		return timeline;
	}
}

export default TimelineFactory;