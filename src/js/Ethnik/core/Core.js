import SystemCoordinator from "./SystemCoordinator.js";

/**
 * Core is a singleton class that acts as the main interface for controlling and managing
 * the application's system. It interacts with the SystemCoordinator to handle tasks
 * such as playback control, configuration, timeline management, and more.
 */
class Core {

	static _instance = null;


	/**
	 * Retrieves the singleton instance of the Core class.
	 * Ensures that only one instance of the Core class is created and reused.
	 *
	 * @return {Core} The singleton instance of the Core class.
	 */
	static getInstance() {

		if (!Core._instance) {
			Core._instance = new Core();
		}
		return Core._instance;
	}


	/**
	 * Constructs the Core instance and initializes the system coordinator.
	 * Ensures the class adheres to the singleton pattern by preventing
	 * multiple instances.
	 *
	 * @throws {Error} Throws an error if an attempt is made to create another instance of the singleton class.
	 * @return {Core} Returns an instance of the Core class.
	 */
	constructor() {

		// Enforce singleton
		if (Core._instance) {
			throw new Error('Core is a singleton. Use Core.getInstance()');
		}

		// Initialize the system coordinator
		this._coordinator = new SystemCoordinator();

		// Initialize the system
		this._coordinator.initialize();
	}


	get isPlaying() {

		return this._coordinator.isPlaying;
	}


	get bpm() {

		return this._coordinator.bpm;
	}


	get division() {

		return this._coordinator.division;
	}


	get volume() {

		return this._coordinator.volume;
	}


	get accent() {

		return this._coordinator.accent;
	}


	get currentPattern() {

		return this._coordinator.currentPattern;
	}


	get audioEngine() {

		return this._coordinator.audioEngine;
	}


	async play() {

		return this._coordinator.play();
	}


	stop() {

		return this._coordinator.stop();
	}


	setTempo(newTempo) {

		return this._coordinator.setTempo(newTempo);
	}


	setDivision(division) {

		return this._coordinator.setDivision(division);
	}


	setAccent(enabled) {

		return this._coordinator.setAccent(enabled);
	}


	setPattern(pattern) {

		return this._coordinator.setPattern(pattern);
	}


	setVolume(volume) {

		return this._coordinator.setVolume(volume);
	}


	loadPreset(name) {

		return this._coordinator.loadPreset(name);
	}


	tapTempo() {

		return this._coordinator.tapTempo();
	}


	getStatus() {

		return this._coordinator.getStatus();
	}


	startTimeline(timelineType) {

		return this._coordinator.startTimeline(timelineType);
	}


	stopTimeline() {

		return this._coordinator.stopTimeline();
	}


	getTimelineStatus() {

		return this._coordinator.getTimelineStatus();
	}


	skipTimelineSection() {

		return this._coordinator.skipTimelineSection();
	}


	/**
	 * Retrieves the available timeline types supported by the coordinator.
	 *
	 * @return {Array<string>} An array of strings representing the available timeline types.
	 */
	getAvailableTimelineTypes() {

		return this._coordinator.getAvailableTimelineTypes();
	}


	/**
	 * Initializes the coordinator instance, setting up any necessary configurations
	 * and state for subsequent operations.
	 *
	 * @return {Promise<void>} A promise that resolves when the initialization process is complete.
	 */
	async initialize() {

		return this._coordinator.initialize();
	}


	/**
	 * Destroys the Core instance by shutting down the SystemCoordinator
	 * asynchronously and clearing the singleton instance.
	 *
	 * Any errors encountered during the shutdown process or cleanup are logged
	 * and the singleton is cleared to avoid a stuck state.
	 *
	 * @return {void} No return value.
	 */
	destroy() {

		try {
			// Call async shutdown but don't await it in this sync method
			this._coordinator.shutdown().then(() => {
				// Clear singleton instance after successful shutdown
				Core._instance = null;
			}).catch((error) => {
				console.error("Error during SystemCoordinator shutdown:", error);
				// Clear singleton anyway to avoid stuck state
				Core._instance = null;
			});

		} catch (error) {
			console.error("Error during Core cleanup:", error);
			Core._instance = null;
		}
	}


	/**
	 * Asynchronously shuts down the core system and cleans up resources.
	 * This method ensures that the internal coordinator is properly shut down
	 * and resets the Core singleton instance to null. Any errors during
	 * the cleanup process are logged to the console.
	 *
	 * @return {Promise<void>} A promise that resolves when the core system
	 * has been successfully shut down and resources are cleaned up.
	 */
	async destroyAsync() {

		try {
			await this._coordinator.shutdown();
			Core._instance = null;
		} catch (error) {
			console.error("Error during Core cleanup:", error);
			Core._instance = null;
		}
	}
}

export {Core};