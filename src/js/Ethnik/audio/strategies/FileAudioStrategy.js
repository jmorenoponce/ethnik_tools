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
	 * @param {Object} soundFiles - Object mapping tick types to sound file paths
	 * @return {Object} A new instance of the class.
	 */
	constructor(soundFiles) {

		super();
		this._soundFiles = soundFiles || {};
		this._volume = 1.0; // Default volume
		this._debugMode = false;
	}

	/**
	 * 🆕 NEW: Update sound files at runtime
	 * @param {Object} soundFiles - New sound file mappings
	 */
	updateSoundFiles(soundFiles) {
		this._soundFiles = soundFiles || {};
		this._log('Sound files updated', this._soundFiles);
	}

	/**
	 * 🆕 NEW: Set volume level
	 * @param {number} volume - Volume level (0-100)
	 */
	setVolume(volume) {
		this._volume = Math.max(0, Math.min(100, volume)) / 100;
		this._log(`Volume set to ${this._volume * 100}%`);
	}

	/**
	 * 🆕 NEW: Enable/disable debug logging
	 * @param {boolean} enabled - Whether to enable debug logging
	 */
	setDebugMode(enabled) {
		this._debugMode = enabled;
	}

	/**
	 * Plays a tick sound based on the provided type, frequency, and duration.
	 * Uses platform-specific audio playback mechanisms to play the sound.
	 * 🔧 FIXED: Added MP3 support and better error handling
	 * 🔧 ENHANCED: Added volume support and improved cross-platform compatibility
	 *
	 * @param {string} type - The type of sound to play (e.g., 'beat'). Falls back to a default sound if the type is not found.
	 * @param {number} frequency - The frequency of the sound in Hz (used for fallback generation if needed).
	 * @param {number} duration - The duration of the sound in milliseconds (used for fallback if needed).
	 * @param {number} [volume] - Optional volume override for this specific tick
	 * @return {Promise<void>} A promise that resolves when the sound play operation is initiated successfully.
	 */
	async playTick(type, frequency, duration, volume = null) {

		// Determine which file to play
		const file = this._soundFiles[type] || this._soundFiles.beat || Object.values(this._soundFiles)[0];

		if (!file) {
			throw new Error('No audio files configured');
		}

		if (!fs.existsSync(file)) {
			throw new Error(`Audio file not found: ${file}`);
		}

		// Use provided volume or instance volume
		const playbackVolume = volume !== null ? volume / 100 : this._volume;

		this._log(`Playing ${type} tick: ${file} (volume: ${(playbackVolume * 100).toFixed(0)}%)`);

		try {
			await this._playAudioFile(file, playbackVolume);
		} catch (error) {
			console.error(`❌ Error playing audio file ${file}: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 🆕 NEW: Platform-specific audio file playback with volume support
	 * @param {string} filePath - Path to the audio file
	 * @param {number} volume - Volume level (0.0 to 1.0)
	 * @return {Promise<void>}
	 */
	async _playAudioFile(filePath, volume) {

		const platform = process.platform;

		switch (platform) {
			case 'win32':
				return this._playAudioWindows(filePath, volume);

			case 'darwin':
				return this._playAudioMacOS(filePath, volume);

			case 'linux':
			default:
				return this._playAudioLinux(filePath, volume);
		}
	}

	/**
	 * 🔧 FIXED: Windows audio playback with MP3 support and volume control
	 * @param {string} filePath - Path to the audio file
	 * @param {number} volume - Volume level (0.0 to 1.0)
	 * @return {Promise<void>}
	 */
	async _playAudioWindows(filePath, volume) {

		const fileExtension = filePath.split('.').pop().toLowerCase();

		try {
			if (fileExtension === 'wav') {
				// Use simple PowerShell SoundPlayer for WAV files
				const powershellCommand = `
					$player = New-Object System.Media.SoundPlayer('${filePath}');
					$player.PlaySync();
				`;

				return this._spawnProcess('powershell', ['-Command', powershellCommand]);

			} else {
				// Use MediaPlayer for MP3/other formats with volume support
				const volumePercent = Math.round(volume * 100);
				const powershellCommand = `
					Add-Type -AssemblyName PresentationCore;
					$mediaPlayer = New-Object System.Windows.Media.MediaPlayer;
					$mediaPlayer.Volume = ${volume};
					$mediaPlayer.Open([System.Uri]::new('${filePath}'));
					$mediaPlayer.Play();
					Start-Sleep -Milliseconds 100;
					while($mediaPlayer.NaturalDuration.HasTimeSpan -eq $false) {
						Start-Sleep -Milliseconds 10;
					}
					$duration = $mediaPlayer.NaturalDuration.TimeSpan.TotalMilliseconds;
					if($duration -gt 0) {
						Start-Sleep -Milliseconds $duration;
					} else {
						Start-Sleep -Milliseconds 500;
					}
					$mediaPlayer.Close();
				`;

				return this._spawnProcess('powershell', ['-Command', powershellCommand]);
			}
		} catch (error) {
			// Fallback to simple beep if media playback fails
			this._log(`Windows media playback failed, falling back to beep: ${error.message}`);
			return this._spawnProcess('powershell', ['-c', `[Console]::Beep(800, 200)`]);
		}
	}

	/**
	 * 🔧 ENHANCED: macOS audio playback with volume support
	 * @param {string} filePath - Path to the audio file
	 * @param {number} volume - Volume level (0.0 to 1.0)
	 * @return {Promise<void>}
	 */
	async _playAudioMacOS(filePath, volume) {

		try {
			// afplay supports volume with -v flag (0.0 to 1.0)
			return this._spawnProcess('afplay', ['-v', volume.toString(), filePath]);

		} catch (error) {
			this._log(`macOS afplay failed: ${error.message}`);

			// Fallback to system beep
			return this._spawnProcess('osascript', ['-e', 'beep']);
		}
	}

	/**
	 * 🔧 ENHANCED: Linux audio playback with multiple player support
	 * @param {string} filePath - Path to the audio file
	 * @param {number} volume - Volume level (0.0 to 1.0)
	 * @return {Promise<void>}
	 */
	async _playAudioLinux(filePath, volume) {

		const fileExtension = filePath.split('.').pop().toLowerCase();
		const volumePercent = Math.round(volume * 100);

		// Try different players in order of preference
		const players = [
			// mpg123 for MP3 files
			...(fileExtension === 'mp3' ? [
				{ cmd: 'mpg123', args: ['-q', '--gain', volumePercent.toString(), filePath] },
				{ cmd: 'mpg123', args: ['-q', filePath] }
			] : []),

			// aplay for WAV files
			...(fileExtension === 'wav' ? [
				{ cmd: 'aplay', args: ['-q', filePath] }
			] : []),

			// ffplay (from ffmpeg) - supports most formats
			{ cmd: 'ffplay', args: ['-nodisp', '-autoexit', '-volume', volumePercent.toString(), filePath] },
			{ cmd: 'ffplay', args: ['-nodisp', '-autoexit', filePath] },

			// paplay (PulseAudio)
			...(fileExtension === 'wav' ? [
				{ cmd: 'paplay', args: [filePath] }
			] : []),

			// mplayer
			{ cmd: 'mplayer', args: ['-really-quiet', '-volume', volumePercent.toString(), filePath] },
			{ cmd: 'mplayer', args: ['-really-quiet', filePath] }
		];

		for (const player of players) {
			try {
				this._log(`Trying Linux player: ${player.cmd} ${player.args.join(' ')}`);
				await this._spawnProcess(player.cmd, player.args);
				return; // Success, exit
			} catch (error) {
				this._log(`${player.cmd} failed: ${error.message}`);
				continue; // Try next player
			}
		}

		// All players failed, fallback to speaker-test
		this._log('All Linux audio players failed, falling back to speaker-test');
		return this._spawnProcess('speaker-test', ['-t', 'sine', '-f', '800', '-l', '1', '-s', '1']);
	}

	/**
	 * 🆕 NEW: Helper method to spawn processes with proper error handling
	 * @param {string} command - Command to execute
	 * @param {Array} args - Command arguments
	 * @return {Promise<void>}
	 */
	_spawnProcess(command, args) {

		return new Promise((resolve, reject) => {
			this._log(`Spawning: ${command} ${args.join(' ')}`);

			const child = spawn(command, args, {
				stdio: 'ignore',
				detached: true
			});

			const timeout = setTimeout(() => {
				child.kill();
				reject(new Error(`Process timeout: ${command}`));
			}, 5000); // 5 second timeout

			child.on('close', (code) => {
				clearTimeout(timeout);
				if (code === 0) {
					this._log(`Process completed successfully: ${command}`);
					resolve();
				} else {
					reject(new Error(`Process exited with code ${code}: ${command}`));
				}
			});

			child.on('error', (error) => {
				clearTimeout(timeout);
				reject(new Error(`Process error: ${command} - ${error.message}`));
			});

			// Detach the process so it doesn't block
			child.unref();
		});
	}

	/**
	 * Checks if at least one of the sound files in the `_soundFiles` object exists on the file system.
	 * 🔧 ENHANCED: Better validation and error reporting
	 *
	 * @return {Promise<boolean>} A promise that resolves to `true` if any sound file exists, otherwise `false`.
	 */
	async isAvailable() {

		if (!this._soundFiles || Object.keys(this._soundFiles).length === 0) {
			this._log('No sound files configured');
			return false;
		}

		const existingFiles = Object.values(this._soundFiles).filter(file => {
			try {
				const exists = fs.existsSync(file);
				this._log(`Checking file: ${file} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
				return exists;
			} catch (error) {
				this._log(`Error checking file ${file}: ${error.message}`);
				return false;
			}
		});

		const isAvailable = existingFiles.length > 0;
		this._log(`FileAudioStrategy available: ${isAvailable} (${existingFiles.length}/${Object.keys(this._soundFiles).length} files found)`);

		return isAvailable;
	}

	/**
	 * 🆕 NEW: Get detailed information about audio file availability
	 * @return {Object} Information about each configured audio file
	 */
	getFileStatus() {

		const status = {};

		for (const [tickType, filePath] of Object.entries(this._soundFiles)) {
			status[tickType] = {
				path: filePath,
				exists: fs.existsSync(filePath),
				extension: filePath.split('.').pop().toLowerCase()
			};

			if (status[tickType].exists) {
				try {
					const stats = fs.statSync(filePath);
					status[tickType].size = stats.size;
					status[tickType].modified = stats.mtime;
				} catch (error) {
					status[tickType].error = error.message;
				}
			}
		}

		return status;
	}

	/**
	 * 🆕 NEW: Test audio playback for all configured files
	 * @return {Promise<Object>} Test results for each file
	 */
	async testAllFiles() {

		const results = {};

		for (const [tickType, filePath] of Object.entries(this._soundFiles)) {
			this._log(`Testing ${tickType}: ${filePath}`);

			try {
				await this.playTick(tickType, 800, 100);
				results[tickType] = { success: true, message: 'Playback successful' };
			} catch (error) {
				results[tickType] = { success: false, message: error.message };
			}

			// Small delay between tests
			await new Promise(resolve => setTimeout(resolve, 200));
		}

		return results;
	}

	/**
	 * 🆕 NEW: Simple logging helper
	 * @param {string} message - Log message
	 * @param {*} data - Optional data to log
	 */
	_log(message, data = null) {
		if (this._debugMode) {
			if (data) {
				console.log(`[FileAudioStrategy] ${message}`, data);
			} else {
				console.log(`[FileAudioStrategy] ${message}`);
			}
		}
	}

	/**
	 * 🆕 NEW: Cleanup method
	 */
	destroy() {
		this._log('Destroying FileAudioStrategy');
		this._soundFiles = {};
		this._volume = 1.0;
		this._debugMode = false;
	}
}

export default FileAudioStrategy;