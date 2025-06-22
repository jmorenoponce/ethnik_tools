import TimelineFactory from './TimelineFactory.js';

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