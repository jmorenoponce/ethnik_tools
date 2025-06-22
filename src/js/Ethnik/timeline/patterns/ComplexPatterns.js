/**
 * Represents a set of complex rhythm patterns and provides methods
 * to fetch and filter these patterns based on various criteria.
 */
class ComplexPatterns {

	/**
	 * Retrieves a collection of predefined rhythm patterns, each represented by a key-value pair.
	 * The key is a string identifier for the pattern, and the value is an object containing
	 * details about the pattern's beats, accents, description, difficulty level, category, and style.
	 *
	 * @return {Map<string, Object>} A map containing rhythm patterns. Each pattern provides
	 * information about its structure and characteristics.
	 */
	static getPatterns() {

		return new Map([
			['syncopated', {
				beats: [1, 0, 1, 0, 1],
				accents: [2, 0, 1, 0, 2],
				description: 'Syncopated rhythm pattern',
				difficulty: 4,
				category: 'complex',
				style: 'contemporary'
			}],

			['triplets', {
				beats: [1, 1, 1],
				accents: [2, 1, 1],
				description: 'Triplet pattern',
				difficulty: 3,
				category: 'complex',
				style: 'classical'
			}],

			['latin_clave', {
				beats: [1, 0, 1, 0, 1, 0, 0, 1],
				accents: [2, 0, 2, 0, 2, 0, 0, 2],
				description: 'Latin clave pattern (3-2)',
				difficulty: 5,
				category: 'complex',
				style: 'latin'
			}],

			['jazz_swing', {
				beats: [1, 0, 1, 1, 0, 1],
				accents: [2, 0, 1, 2, 0, 1],
				description: 'Jazz swing pattern',
				difficulty: 4,
				category: 'complex',
				style: 'jazz'
			}],

			['polyrhythm_3_over_4', {
				beats: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
				accents: [2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
				description: '3 over 4 polyrhythm',
				difficulty: 6,
				category: 'complex',
				style: 'contemporary'
			}],

			['african_6_8', {
				beats: [1, 0, 1, 1, 0, 1],
				accents: [2, 0, 1, 2, 0, 1],
				description: 'African 6/8 pattern',
				difficulty: 4,
				category: 'complex',
				style: 'world'
			}],

			['odd_meter_7_8', {
				beats: [1, 1, 1, 1, 1, 1, 1],
				accents: [2, 1, 1, 2, 1, 1, 1],
				description: '7/8 odd meter pattern',
				difficulty: 5,
				category: 'complex',
				style: 'progressive'
			}]
		]);
	}


	/**
	 * Retrieves a map of patterns filtered by the specified style.
	 *
	 * @param {string} style - The style used to filter the patterns.
	 * @return {Map<string, Object>} A map containing pattern names as keys and the corresponding patterns as values, filtered by the given style.
	 */
	static getPatternsByStyle(style) {

		const patterns = this.getPatterns();
		const filtered = new Map();

		for (const [name, pattern] of patterns) {
			if (pattern.style === style) {
				filtered.set(name, pattern);
			}
		}

		return filtered;
	}


	/**
	 * Retrieves patterns filtered by a specified difficulty range.
	 *
	 * @param {number} minDifficulty - The minimum difficulty threshold (inclusive).
	 * @param {number} maxDifficulty - The maximum difficulty threshold (inclusive).
	 * @return {Map<string, object>} A map of patterns that fall within the specified difficulty range,
	 * where the key is the pattern name and the value is the pattern object.
	 */
	static getPatternsByDifficultyRange(minDifficulty, maxDifficulty) {

		const patterns = this.getPatterns();
		const filtered = new Map();

		for (const [name, pattern] of patterns) {
			if (pattern.difficulty >= minDifficulty && pattern.difficulty <= maxDifficulty) {
				filtered.set(name, pattern);
			}
		}

		return filtered;
	}
}

export default ComplexPatterns;