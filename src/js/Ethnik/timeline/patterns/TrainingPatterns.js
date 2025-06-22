/**
 * A class providing functionality to retrieve and filter training patterns.
 */
class TrainingPatterns {

	/**
	 * Retrieves a collection of rhythm patterns used for training various musical skills.
	 *
	 * Each pattern includes attributes such as beats, accents, description, difficulty level,
	 * category, and a list of skills the pattern aims to develop.
	 *
	 * @return {Map<string, Object>} A map where the key is the pattern name and the value is an object
	 * containing details about the rhythm pattern.
	 */
	static getPatterns() {

		return new Map([
			['offbeat_only', {
				beats: [0, 1, 0, 1],
				accents: [0, 1, 0, 1],
				description: 'Offbeat training - develops syncopation skills',
				difficulty: 3,
				category: 'training',
				skills: ['syncopation', 'timing']
			}],

			['strong_beats', {
				beats: [1, 0, 1, 0],
				accents: [2, 0, 2, 0],
				description: 'Strong beats only - builds internal timing',
				difficulty: 2,
				category: 'training',
				skills: ['internal_clock', 'subdivision']
			}],

			['subdivision_16', {
				beats: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				accents: [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
				description: '16th note subdivisions for precision',
				difficulty: 4,
				category: 'training',
				skills: ['precision', 'subdivision', 'endurance']
			}],

			['dotted_quarter', {
				beats: [1, 0, 0, 1, 0, 0],
				accents: [2, 0, 0, 1, 0, 0],
				description: 'Dotted quarter note pattern',
				difficulty: 3,
				category: 'training',
				skills: ['compound_time', 'grouping']
			}],

			['skip_beat', {
				beats: [1, 0, 1, 1, 0, 1],
				accents: [2, 0, 1, 1, 0, 1],
				description: 'Skip beat pattern for irregularity training',
				difficulty: 4,
				category: 'training',
				skills: ['irregular_grouping', 'concentration']
			}]
		]);
	}


	/**
	 * Retrieves a filtered map of patterns that are associated with the specified skill.
	 *
	 * @param {string} skill - The skill used to filter patterns.
	 * @return {Map<string, Object>} A map containing pattern names as keys and their respective pattern objects as values, filtered by the provided skill.
	 */
	static getPatternsBySkill(skill) {

		const patterns = this.getPatterns();
		const filtered = new Map();

		for (const [name, pattern] of patterns) {
			if (pattern.skills && pattern.skills.includes(skill)) {
				filtered.set(name, pattern);
			}
		}

		return filtered;
	}
}

export default TrainingPatterns;