
/**
 * Base factory class for creating timeline objects.
 * Implements Factory pattern for timeline creation.
 */
class TimelineFactory {

	/**
	 * Creates a timeline factory instance.
	 *
	 * @return {void} No return value.
	 */
	constructor() {
		this._patternLibrary = null;
	}

	/**
	 * Sets the pattern library reference.
	 *
	 * @param {PatternLibrary} patternLibrary - Pattern library instance.
	 * @return {void} No return value.
	 */
	setPatternLibrary(patternLibrary) {
		this._patternLibrary = patternLibrary;
	}

	/**
	 * Creates a timeline. Must be implemented by subclasses.
	 *
	 * @return {Object} Timeline object.
	 */
	createTimeline() {
		throw new Error('createTimeline method must be implemented by subclasses');
	}

	/**
	 * Creates a standardized timeline section.
	 *
	 * @param {Object} sectionConfig - Section configuration.
	 * @return {Object} Normalized section object.
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
	 * Creates a complete timeline with metadata.
	 *
	 * @param {string} name - Timeline name.
	 * @param {Array<Object>} sections - Array of section configurations.
	 * @return {Object} Complete timeline object.
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