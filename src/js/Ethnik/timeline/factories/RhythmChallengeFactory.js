import TimelineFactory from './TimelineFactory.js';

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