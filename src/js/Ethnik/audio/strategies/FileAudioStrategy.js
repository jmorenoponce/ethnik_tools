import { spawn } from "child_process";
import fs from "fs";
import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';

/**
 * File-based audio playback strategy
 */
class FileAudioStrategy extends AudioPlaybackStrategy {

	/**
	 * Constructs an instance of the FileAudioStrategy.
	 *
	 * @param {Object} soundFiles - Object containing paths to sound files.
	 * @return {void} No return value.
	 */
	constructor(soundFiles) {

		super();
		this._soundFiles = soundFiles;
	}


	/**
	 * Play an audio file based on the provided type and system platform.
	 *
	 * @param {string} type - The type of sound file to play, which determines the file to be used.
	 * @param {number} frequency - Not used in file strategy but kept for interface consistency.
	 * @param {number} duration - Not used in file strategy but kept for interface consistency.
	 * @return {Promise<void>} A promise that resolves when the file playback is initiated.
	 */
	async playTick(type, frequency, duration) {

		const file = this._soundFiles[type] || this._soundFiles.beat;

		try {

			if (process.platform === 'win32') {

				spawn('powershell', ['-c', `(New-Object Media.SoundPlayer "${file}").PlaySync()`], {
					stdio: 'ignore',
					detached: true
				});

			} else if (process.platform === 'darwin') {

				spawn('afplay', [file], {
					stdio: 'ignore',
					detached: true
				});

			} else {

				spawn('aplay', [file], {
					stdio: 'ignore',
					detached: true
				});
			}

		} catch (error) {

			console.error(`Error playing audio file: ${error.message}`);
		}
	}


	/**
	 * Check if sound files exist and are accessible.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if files are available.
	 */
	async isAvailable() {

		return Object.values(this._soundFiles).some(file => {
			try {
				return fs.existsSync(file);
			} catch {
				return false;
			}
		});
	}
}

export default FileAudioStrategy;