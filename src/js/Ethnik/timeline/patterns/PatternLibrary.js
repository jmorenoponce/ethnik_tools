import BasicPatterns from './BasicPatterns.js';
import TrainingPatterns from './TrainingPatterns.js';
import ComplexPatterns from './ComplexPatterns.js';


/**
 * The PatternLibrary class manages a collection of rhythmic patterns across various categories.
 * It provides methods to retrieve, search, and add patterns, as well as functionality to
 * categorize and filter patterns based on difficulty and other attributes.
 */
class PatternLibrary {

	/**
	 * Initializes a new instance of the class and sets up internal structures.
	 * It initializes the `_patterns` and `_categories` maps and calls the private method `_initializePatterns`
	 * to configure the initial set of patterns.
	 *
	 * @return {Object} A new instance of the class with prepared patterns and categories.
	 */
	constructor() {

		this._patterns = new Map();
		this._categories = new Map();
		this._initializePatterns();
	}


	/**
	 * Initializes and loads various pattern collections into the system.
	 * The method retrieves patterns from predefined pattern collections
	 * and prepares them for use by the application.
	 *
	 * @return {void} Does not return a value.
	 */
	_initializePatterns() {

		// TODO: Hardcoded patterns
		// Load patterns from collection classes
		this._loadPatternCollection('basic', BasicPatterns.getPatterns());
		this._loadPatternCollection('training', TrainingPatterns.getPatterns());
		this._loadPatternCollection('complex', ComplexPatterns.getPatterns());
	}


	/**
	 * Loads a collection of patterns into the specified category.
	 * If the category does not exist, it will be created.
	 *
	 * @param {string} categoryName - The name of the category to which the patterns belong.
	 * @param {Map<string, any>} patterns - A collection of patterns where each key is the pattern name and the value is the pattern data.
	 * @return {void} Does not return a value.
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
	 * Retrieves a pattern from the internal collection based on the provided name.
	 *
	 * @param {string} name - The name of the pattern to retrieve.
	 * @return {?object} The pattern object if found, otherwise null.
	 */
	getPattern(name) {

		return this._patterns.get(name) || null;
	}


	/**
	 * Retrieves a list of all available patterns.
	 *
	 * @return {string[]} An array of strings representing the keys of the available patterns.
	 */
	getAvailablePatterns() {

		return Array.from(this._patterns.keys());
	}

	/**
	 * Retrieves patterns belonging to a specified category.
	 *
	 * @param {string} category - The name of the category for which patterns should be retrieved.
	 * @return {Array<Object>} An array of pattern objects, each containing the pattern's name and associated data.
	 */
	getPatternsByCategory(category) {

		const patternNames = this._categories.get(category) || [];
		return patternNames.map(name => ({
			name,
			...this._patterns.get(name)
		}));
	}


	/**
	 * Retrieves a list of category names.
	 *
	 * @return {string[]} An array of category names derived from the keys of the `_categories` map.
	 */
	getCategories() {

		return Array.from(this._categories.keys());
	}


	/**
	 * Retrieves patterns filtered by the specified maximum difficulty.
	 *
	 * @param {number} maxDifficulty - The maximum difficulty value to filter the patterns.
	 * @return {Array<Object>} An array of pattern objects sorted by difficulty in ascending order.
	 */
	getPatternsByDifficulty(maxDifficulty) {

		const filtered = [];

		for (const [name, pattern] of this._patterns) {
			if (pattern.difficulty && pattern.difficulty <= maxDifficulty) {
				filtered.push({name, ...pattern});
			}
		}

		return filtered.sort((a, b) => a.difficulty - b.difficulty);
	}


	/**
	 * Searches patterns based on the provided query string.
	 *
	 * @param {string} query The search query used to filter patterns. The search is case-insensitive and matches against pattern names and their descriptions.
	 * @return {Array.<Object>} Returns an array of matched patterns. Each element in the array contains the pattern name and its associated properties.
	 */
	searchPatterns(query) {

		const lowerQuery = query.toLowerCase();
		const results = [];

		for (const [name, pattern] of this._patterns) {
			if (name.toLowerCase().includes(lowerQuery) ||
				(pattern.description && pattern.description.toLowerCase().includes(lowerQuery))) {
				results.push({name, ...pattern});
			}
		}

		return results;
	}


	/**
	 * Adds a custom pattern to the collection if the provided pattern passes validation.
	 *
	 * @param {string} name - The name of the custom pattern to be added.
	 * @param {Object} pattern - The pattern object to be validated and added.
	 * @return {boolean} Returns true if the pattern is successfully validated and added, otherwise false.
	 */
	addCustomPattern(name, pattern) {

		if (this._validatePattern(pattern)) {
			// Add to custom category
			if (!this._categories.has('custom')) {
				this._categories.set('custom', []);
			}

			this._patterns.set(name, {...pattern, category: 'custom'});
			this._categories.get('custom').push(name);
			return true;
		}
		return false;
	}


	/**
	 * Validates the given pattern object to ensure it meets the required criteria.
	 *
	 * @param {Object} pattern - The pattern object to validate.
	 * @param {Array} pattern.beats - An array representing beats in the pattern.
	 * @param {Array} pattern.accents - An array representing accents corresponding to the beats.
	 * @return {boolean} Returns true if the pattern is valid, otherwise false.
	 */
	_validatePattern(pattern) {

		return pattern &&
			Array.isArray(pattern.beats) &&
			Array.isArray(pattern.accents) &&
			pattern.beats.length === pattern.accents.length &&
			pattern.beats.length > 0;
	}


	/**
	 * Computes and returns statistics about patterns and categories.
	 * The statistics include the total number of patterns, the number of categories,
	 * a breakdown of the number of patterns per category, and the range of difficulty levels.
	 *
	 * @return {Object} An object containing:
	 * - `totalPatterns`: The total number of patterns.
	 * - `categories`: The total number of categories.
	 * - `categoryBreakdown`: An object where keys represent categories and values represent the number of patterns in each category.
	 * - `difficultyRange`: An object with `min` and `max` representing the range of difficulty levels for the patterns.
	 */
	getStatistics() {

		const stats = {
			totalPatterns: this._patterns.size,
			categories: this._categories.size,
			categoryBreakdown: {},
			difficultyRange: {min: Infinity, max: 0}
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
			stats.difficultyRange = {min: 0, max: 0};
		}

		return stats;
	}
}

export default PatternLibrary;