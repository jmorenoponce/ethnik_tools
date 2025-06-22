import SystemCoordinator from "./SystemCoordinator.js";

/**
 * Core - Minimal entry point for the metronome application.
 * True Facade pattern implementation that delegates everything to SystemCoordinator.
 * Maintains Singleton pattern for backward compatibility.
 */
class Core {

	static _instance = null;

	/**
	 * Gets the singleton instance of Core.
	 *
	 * @return {Core} The Core singleton instance.
	 */
	static getInstance() {

		if (!Core._instance) {
			Core._instance = new Core();
		}
		return Core._instance;
	}

	/**
	 * Constructs a new Core instance with SystemCoordinator.
	 *
	 * @return {void} No return value.
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

	// =====================================================
	// PUBLIC API - All methods delegate to SystemCoordinator
	// =====================================================

	// Getters
	get isPlaying() { return this._coordinator.isPlaying; }
	get bpm() { return this._coordinator.bpm; }
	get division() { return this._coordinator.division; }
	get volume() { return this._coordinator.volume; }
	get accent() { return this._coordinator.accent; }
	get currentPattern() { return this._coordinator.currentPattern; }
	get audioEngine() { return this._coordinator.audioEngine; }

	// Playback control
	async play() { return this._coordinator.play(); }
	stop() { return this._coordinator.stop(); }

	// Configuration
	setTempo(newTempo) { return this._coordinator.setTempo(newTempo); }
	setDivision(division) { return this._coordinator.setDivision(division); }
	setAccent(enabled) { return this._coordinator.setAccent(enabled); }
	setPattern(pattern) { return this._coordinator.setPattern(pattern); }
	setVolume(volume) { return this._coordinator.setVolume(volume); }

	// Presets
	loadPreset(name) { return this._coordinator.loadPreset(name); }

	// Tap tempo
	tapTempo() { return this._coordinator.tapTempo(); }

	// Status
	getStatus() { return this._coordinator.getStatus(); }

	// Timeline
	startTimeline(timelineType) { return this._coordinator.startTimeline(timelineType); }
	stopTimeline() { return this._coordinator.stopTimeline(); }
	getTimelineStatus() { return this._coordinator.getTimelineStatus(); }
	skipTimelineSection() { return this._coordinator.skipTimelineSection(); }
	getAvailableTimelineTypes() { return this._coordinator.getAvailableTimelineTypes(); }

	// System lifecycle
	async initialize() { return this._coordinator.initialize(); }

	/**
	 * Cleanup method to be called when shutting down.
	 * IMPORTANT: This method is now synchronous for compatibility with ExitCommand
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
	 * Asynchronous version of destroy for when you can await.
	 *
	 * @return {Promise<void>} Resolves when cleanup is complete.
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