
import TimelineFactory from './TimelineFactory.js';

/**
 * Factory for creating basic training timelines.
 */
class BasicTrainingFactory extends TimelineFactory {

	/**
	 * Creates a basic training timeline with progressive difficulty.
	 *
	 * @return {Object} Basic training timeline.
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