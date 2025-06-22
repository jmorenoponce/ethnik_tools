import { spawn } from "child_process";
import fs from "fs";
import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';

/**
 * Strategy for audio playback that uses sound files located on the file system.
 * This class extends the AudioPlaybackStrategy and implements audio playback using platform-specific commands.
 */
class FileAudioStrategy extends AudioPlaybackStrategy {

	/**
	 * Creates an instance of the class and initializes it with the provided sound files.
	 *
	 * @param {Array|string} soundFiles - The list of sound files or a single sound file name to be assigned.
	 * @return {Object} A new instance of the class.
	 */
	constructor(soundFiles) {

		super();
		this._soundFiles = soundFiles;
	}


	/**
	 * Plays a tick sound based on the provided type, frequency, and duration.
	 * Uses platform-specific audio playback mechanisms to play the sound.
	 *
	 * @param {string} type - The type of sound to play (e.g., 'beat'). Falls back to a default sound if the type is not found.
	 * @param {number} frequency - The frequency of the sound in Hz.
	 * @param {number} duration - The duration of the sound in milliseconds.
	 * @return {Promise<void>} A promise that resolves when the sound play operation is initiated successfully.
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
	 * Checks if at least one of the sound files in the `_soundFiles` object exists on the file system.
	 *
	 * @return {Promise<boolean>} A promise that resolves to `true` if any sound file exists, otherwise `false`.
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