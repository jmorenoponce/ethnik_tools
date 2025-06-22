
import TimelineFactory from './TimelineFactory.js';

/**
 * Factory for creating rhythm challenge timelines.
 */
class RhythmChallengeFactory extends TimelineFactory {

	/**
	 * Creates a rhythm challenge timeline with complex patterns.
	 *
	 * @return {Object} Rhythm challenge timeline.
	 */
	createTimeline() {
		const sections = [
			{
				duration: 4,
				bpm: 90,
				pattern: 'straight',
				description: 'Baseline straight rhythm'
			},
			{
				duration: 4,
				bpm: 90,
				pattern: 'syncopated',
				description: 'Syncopation challenge'
			},
			{
				duration: 4,
				bpm: 110,
				pattern: 'triplets',
				division: 3,
				description: 'Triplet patterns'
			},
			{
				duration: 8,
				bpm: 130,
				pattern: 'subdivision_16',
				division: 4,
				description: '16th note subdivisions'
			},
			{
				duration: 4,
				bpm: 100,
				pattern: 'latin_clave',
				description: 'Latin clave pattern'
			},
			{
				duration: 4,
				bpm: 90,
				pattern: 'straight',
				silent: true,
				description: 'Final silent challenge'
			}
		];

		return this.createTrainingTimeline('Rhythm Challenge', sections);
	}
}

export default RhythmChallengeFactory;