

/**
 * Collection of basic rhythm patterns for fundamental training.
 */
class BasicPatterns {

	/**
	 * Gets all basic patterns.
	 *
	 * @return {Map} Map of pattern names to pattern objects.
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
	 * Gets patterns filtered by difficulty.
	 *
	 * @param {number} maxDifficulty - Maximum difficulty level.
	 * @return {Map} Filtered patterns.
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


