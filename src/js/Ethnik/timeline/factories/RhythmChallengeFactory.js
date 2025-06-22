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

		// ✅ REFACTORED: Usar configuración centralizada
		const config = Settings.timelineConstants.rhythmChallenge;

		// Aplicar defaults y crear secciones
		const sections = config.sections.map(sectionConfig => {
			return this._createSectionWithDefaults(sectionConfig);
		});

		return this.createTrainingTimeline(config.name, sections);
	}


	/**
	 * Crea una sección aplicando valores por defecto de Settings.
	 *
	 * @param {Object} sectionConfig - Configuración de la sección
	 * @return {Object} Sección completa con defaults aplicados
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