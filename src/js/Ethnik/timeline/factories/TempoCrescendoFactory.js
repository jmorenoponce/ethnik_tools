import TimelineFactory from './TimelineFactory.js';

/**
 * Factory for creating tempo crescendo timelines.
 */
class TempoCrescendoFactory extends TimelineFactory {

	/**
	 * Creates a tempo crescendo timeline with gradual speed increases.
	 *
	 * @return {Object} Tempo crescendo timeline.
	 */
	createTimeline() {
		const sections = [
			{
				duration: 8,
				bpm: 60,
				pattern: 'straight',
				description: 'Very slow start'
			},
			{
				duration: 8,
				bpm: 80,
				pattern: 'straight',
				description: 'Gradual acceleration'
			},
			{
				duration: 8,
				bpm: 100,
				pattern: 'straight',
				description: 'Moderate tempo'
			},
			{
				duration: 8,
				bpm: 120,
				pattern: 'straight',
				description: 'Fast tempo'
			},
			{
				duration: 8,
				bpm: 140,
				pattern: 'straight',
				description: 'Peak tempo'
			},
			{
				duration: 8,
				bpm: 120,
				pattern: 'straight',
				description: 'Controlled descent'
			},
			{
				duration: 8,
				bpm: 100,
				pattern: 'straight',
				description: 'Cool down'
			}
		];

		return this.createTrainingTimeline('Tempo Crescendo', sections);
	}
}

export default TempoCrescendoFactory;