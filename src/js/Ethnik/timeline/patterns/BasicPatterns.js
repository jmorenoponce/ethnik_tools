/**
 * Class representing a collection of basic rhythmic patterns.
 */
class BasicPatterns {

	/**
	 * Retrieves a collection of predefined rhythm patterns with their associated attributes.
	 *
	 * @return {Map<string, Object>} A map where each key is the name of the rhythm pattern and the value is an object containing:
	 * - beats: An array denoting the rhythm structure in terms of beat or silence.
	 * - accents: An array specifying the emphasis or accentuation on beats.
	 * - description: A brief description of the rhythm pattern.
	 * - difficulty: The difficulty level of the rhythm pattern.
	 * - category: The classification or type of the rhythm pattern.
	 */
	static getPatterns() {

		return new Map([
			['straight', {
				beats: [1, 1, 1, 1],
				accents: [2, 1, 1, 1],
				description: 'Basic straight quarter note rhythm',
				difficulty: 1,
				category: 'basic'
			}],

			['half_notes', {
				beats: [1, 0, 1, 0],
				accents: [2, 0, 2, 0],
				description: 'Half note rhythm',
				difficulty: 1,
				category: 'basic'
			}],

			['backbeat', {
				beats: [0, 1, 0, 1],
				accents: [0, 2, 0, 2],
				description: 'Backbeat emphasis on beats 2 and 4',
				difficulty: 2,
				category: 'basic'
			}],

			['eighth_notes', {
				beats: [1, 1, 1, 1, 1, 1, 1, 1],
				accents: [2, 1, 1, 1, 2, 1, 1, 1],
				description: 'Steady eighth note pattern',
				difficulty: 2,
				category: 'basic'
			}]
		]);
	}


	/**
	 * Retrieves patterns filtered by a specified maximum difficulty level.
	 *
	 * @param {number} maxDifficulty - The maximum allowable difficulty for patterns to be included.
	 * @return {Map<string, Object>} A map containing patterns whose difficulty is less than or equal to the specified maximum difficulty.
	 */
	static getPatternsByDifficulty(maxDifficulty) {

		const patterns = this.getPatterns();
		const filtered = new Map();

		for (const [name, pattern] of patterns) {
			if (pattern.difficulty <= maxDifficulty) {
				filtered.set(name, pattern);
			}
		}

		return filtered;
	}
}

export default BasicPatterns;
