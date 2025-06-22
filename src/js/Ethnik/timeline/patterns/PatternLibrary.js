
import BasicPatterns from './BasicPatterns.js';
import TrainingPatterns from './TrainingPatterns.js';
import ComplexPatterns from './ComplexPatterns.js';


/**
 * Enhanced PatternLibrary using pattern collection classes.
 */
class PatternLibrary {

	/**
	 * Constructs a new PatternLibrary instance and initializes all patterns.
	 *
	 * @return {void} No return value.
	 */
	constructor() {
		this._patterns = new Map();
		this._categories = new Map();
		this._initializePatterns();
	}

	/**
	 * Initializes all pattern categories using the pattern collection classes.
	 *
	 * @return {void} No return value.
	 */
	_initializePatterns() {
		// Load patterns from collection classes
		this._loadPatternCollection('basic', BasicPatterns.getPatterns());
		this._loadPatternCollection('training', TrainingPatterns.getPatterns());
		this._loadPatternCollection('complex', ComplexPatterns.getPatterns());
	}

	/**
	 * Loads a collection of patterns into the library.
	 *
	 * @param {string} categoryName - Category name.
	 * @param {Map} patterns - Map of patterns to load.
	 * @return {void} No return value.
	 */
	_loadPatternCollection(categoryName, patterns) {
		if (!this._categories.has(categoryName)) {
			this._categories.set(categoryName, []);
		}

		for (const [name, pattern] of patterns) {
			this._patterns.set(name, pattern);
			this._categories.get(categoryName).push(name);
		}
	}

	/**
	 * Gets a pattern by name.
	 *
	 * @param {string} name - Pattern name.
	 * @return {Object|null} Pattern object or null if not found.
	 */
	getPattern(name) {
		return this._patterns.get(name) || null;
	}

	/**
	 * Gets all available pattern names.
	 *
	 * @return {Array<string>} Array of pattern names.
	 */
	getAvailablePatterns() {
		return Array.from(this._patterns.keys());
	}

	/**
	 * Gets patterns by category.
	 *
	 * @param {string} category - Category name.
	 * @return {Array<Object>} Array of patterns in the category.
	 */
	getPatternsByCategory(category) {
		const patternNames = this._categories.get(category) || [];
		return patternNames.map(name => ({
			name,
			...this._patterns.get(name)
		}));
	}

	/**
	 * Gets all available categories.
	 *
	 * @return {Array<string>} Array of category names.
	 */
	getCategories() {
		return Array.from(this._categories.keys());
	}

	/**
	 * Gets patterns filtered by difficulty.
	 *
	 * @param {number} maxDifficulty - Maximum difficulty level.
	 * @return {Array<Object>} Array of patterns within difficulty range.
	 */
	getPatternsByDifficulty(maxDifficulty) {
		const filtered = [];

		for (const [name, pattern] of this._patterns) {
			if (pattern.difficulty && pattern.difficulty <= maxDifficulty) {
				filtered.push({ name, ...pattern });
			}
		}

		return filtered.sort((a, b) => a.difficulty - b.difficulty);
	}

	/**
	 * Searches patterns by description or name.
	 *
	 * @param {string} query - Search query.
	 * @return {Array<Object>} Array of matching patterns.
	 */
	searchPatterns(query) {
		const lowerQuery = query.toLowerCase();
		const results = [];

		for (const [name, pattern] of this._patterns) {
			if (name.toLowerCase().includes(lowerQuery) ||
				(pattern.description && pattern.description.toLowerCase().includes(lowerQuery))) {
				results.push({ name, ...pattern });
			}
		}

		return results;
	}

	/**
	 * Adds a custom pattern to the library.
	 *
	 * @param {string} name - Pattern name.
	 * @param {Object} pattern - Pattern object.
	 * @return {boolean} True if added successfully.
	 */
	addCustomPattern(name, pattern) {
		if (this._validatePattern(pattern)) {
			// Add to custom category
			if (!this._categories.has('custom')) {
				this._categories.set('custom', []);
			}

			this._patterns.set(name, { ...pattern, category: 'custom' });
			this._categories.get('custom').push(name);
			return true;
		}
		return false;
	}

	/**
	 * Validates a pattern structure.
	 *
	 * @param {Object} pattern - Pattern to validate.
	 * @return {boolean} True if pattern is valid.
	 */
	_validatePattern(pattern) {
		return pattern &&
			Array.isArray(pattern.beats) &&
			Array.isArray(pattern.accents) &&
			pattern.beats.length === pattern.accents.length &&
			pattern.beats.length > 0;
	}

	/**
	 * Gets library statistics.
	 *
	 * @return {Object} Statistics about the pattern library.
	 */
	getStatistics() {
		const stats = {
			totalPatterns: this._patterns.size,
			categories: this._categories.size,
			categoryBreakdown: {},
			difficultyRange: { min: Infinity, max: 0 }
		};

		// Category breakdown
		for (const [category, patterns] of this._categories) {
			stats.categoryBreakdown[category] = patterns.length;
		}

		// Difficulty range
		for (const pattern of this._patterns.values()) {
			if (pattern.difficulty) {
				stats.difficultyRange.min = Math.min(stats.difficultyRange.min, pattern.difficulty);
				stats.difficultyRange.max = Math.max(stats.difficultyRange.max, pattern.difficulty);
			}
		}

		if (stats.difficultyRange.min === Infinity) {
			stats.difficultyRange = { min: 0, max: 0 };
		}

		return stats;
	}
}

export default PatternLibrary;