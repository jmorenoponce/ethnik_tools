import TimelineFactory from './TimelineFactory.js';

/**
 * A factory class that extends TimelineFactory to create a basic training timeline.
 * The basic training timeline is designed to progressively increase difficulty,
 * focusing on rhythmic patterns, tempo control, and silent practice.
 */
class BasicTrainingFactory extends TimelineFactory {

	/**
	 * Creates a training timeline with predefined sections.
	 * Each section includes specific attributes such as duration, bpm, pattern, accent, and description.
	 * The generated timeline is intended for structured training sessions.
	 *
	 * @return {Object} A training timeline object containing the title and an array of sections with their respective details.
	 */
	createTimeline() {

		const sections = [
			{
				duration: 8,
				bpm: 80,
				pattern: 'straight',
				accent: true,
				description: 'Warm-up - slow straight rhythm'
			},
			{
				duration: 4,
				bpm: 100,
				pattern: 'straight',
				accent: true,
				description: 'Building tempo'
			},
			{
				duration: 4,
				bpm: 120,
				pattern: 'backbeat',
				accent: true,
				description: 'Backbeat introduction'
			},
			{
				duration: 8,
				bpm: 100,
				pattern: 'offbeat_only',
				accent: false,
				description: 'Offbeat training'
			},
			{
				duration: 4,
				bpm: 80,
				pattern: 'straight',
				silent: true,
				description: 'Silent practice - maintain tempo'
			}
		];

		return this.createTrainingTimeline('Basic Training', sections);
	}
}

export default BasicTrainingFactory;