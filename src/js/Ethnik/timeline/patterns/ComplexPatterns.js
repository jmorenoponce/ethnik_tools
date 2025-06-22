
/**
 * Collection of complex patterns for advanced training.
 */
class ComplexPatterns {

	/**
	 * Gets all complex patterns.
	 *
	 * @return {Map} Map of pattern names to pattern objects.
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
	 * Gets patterns filtered by musical style.
	 *
	 * @param {string} style - Musical style filter.
	 * @return {Map} Filtered patterns.
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
	 * Gets patterns filtered by difficulty range.
	 *
	 * @param {number} minDifficulty - Minimum difficulty.
	 * @param {number} maxDifficulty - Maximum difficulty.
	 * @return {Map} Filtered patterns.
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