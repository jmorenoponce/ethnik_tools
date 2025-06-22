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

		// ✅ REFACTORED: Usar configuración centralizada
		const config = Settings.timelineConstants.basicTraining;

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

export default BasicTrainingFactory;