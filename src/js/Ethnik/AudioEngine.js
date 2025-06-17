
import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';


class AudioEngine {

	/**
	 * Constructs an instance of the class and initializes audio system settings.
	 *
	 * This constructor sets default values for audio methods, sound file paths,
	 * volume levels, and latency compensation. It also invokes a method to
	 * initialize the audio system to ensure proper functionality.
	 *
	 * @return {void} No return value.
	 */
	constructor() {

		this._audioMethod = 'system'; // 'system', 'file', 'tone'
		this._soundFiles = {
			downbeat: './assets/sounds/downbeat.wav',
			beat: './assets/sounds/beat.wav',
			subdivision: './assets/sounds/subdivision.wav'
		};
		this._volume = 70;
		this._latencyCompensation = 0; // ms

		this._initAudioSystem();
	}


	/**
	 * Initializes the audio system by detecting the best audio method
	 * and calibrating latency if required based on the method selected.
	 *
	 * @return {Promise<void>} A promise that resolves when the audio system has been successfully initialized.
	 */
	async _initAudioSystem() {

		// Detect the best available audio method
		this._audioMethod = await this._detectBestAudioMethod();
		console.log(`🔊 Método de audio: ${this._audioMethod}`);

		// Calibrate latency if necessary
		if (this._audioMethod === 'system') {
			this._calibrateLatency();
		}
	}


	/**
	 * Determines the best method to generate audio based on the availability of sound files
	 * and system capabilities. It will prioritize the use of audio files if available,
	 * attempt to utilize system capabilities as a secondary option, and fallback to a
	 * tone generator if necessary.
	 *
	 * @return {Promise<string>} A promise that resolves to a string indicating the best audio method:
	 * - 'file': Indicates that audio files are available and can be used.
	 * - 'system': Indicates that the system's native audio methods can be used.
	 * - 'tone': Indicates that a fallback tone generator should be used.
	 */
	async _detectBestAudioMethod() {

		// Check if sound files exist
		const hasAudioFiles = Object.values(this._soundFiles).some(file => {
			try {

				return fs.existsSync(file);

			} catch {

				return false;
			}
		});

		if (hasAudioFiles) {
			return 'file';
		}

		// Verify system capabilities
		try {

			if (process.platform === 'win32') {
				await this._testCommand('powershell', ['-c', '[Console]::Beep(440, 50)']);
				return 'system';
			} else if (process.platform === 'darwin') {
				await this._testCommand('osascript', ['-e', 'beep 1']);
				return 'system';
			} else {
				await this._testCommand('speaker-test', ['--help']);
				return 'system';
			}

		} catch {

			return 'tone'; // Fallback to tone generator
		}
	}


	/**
	 * Executes a command in a child process and resolves or rejects the promise based on the outcome.
	 *
	 * @param {string} command The command to execute.
	 * @param {Array<string>} args An array of string arguments to pass to the command.
	 * @return {Promise<void>} A promise that resolves if the command executes successfully or rejects if it fails.
	 */
	_testCommand(command, args) {

		return new Promise((resolve, reject) => {

			const child = spawn(command, args, { stdio: 'ignore' });

			child.on('close', (code) => {
				if (code === 0) resolve();
				else reject();
			});

			child.on('error', reject);
		});
	}


	/**
	 * Calibrates the system's latency by playing a system beep and measuring the time it takes.
	 * This method estimates the latency and stores it in the `_latencyCompensation` property.
	 *
	 * @return {void} No value is returned as the latency calibration result is stored internally.
	 */
	_calibrateLatency() {

		// Simple latency calibration - can be improved with real audio
		const calibrationStart = performance.now();
		this._playSystemBeep(440, 50);
		this._latencyCompensation = performance.now() - calibrationStart;
		console.log(`🎛️  Latencia estimada: ${this._latencyCompensation.toFixed(2)}ms`);
	}


	/**
	 * Plays a tick sound with the given type, frequency, and duration, compensating for latency if applicable.
	 *
	 * @param {string} type - The type of tick sound to play. Default is 'beat'.
	 * @param {number} frequency - The frequency of the tick sound in Hz. Default is 800.
	 * @param {number} duration - The duration of the tick sound in milliseconds. Default is 100.
	 * @return {Promise<void>} A promise that resolves when the tick has been played.
	 */
	async playTick(type = 'beat', frequency = 800, duration = 100) {

		const compensatedDelay = Math.max(0, -this._latencyCompensation);

		if (compensatedDelay > 0) {
			setTimeout(() => this._executePlay(type, frequency, duration), compensatedDelay);
		} else {
			this._executePlay(type, frequency, duration);
		}
	}


	/**
	 * Executes the play operation based on the specified audio type and method.
	 *
	 * @param {string} type - The type of audio to play (e.g., 'beep', 'tone', etc.).
	 * @param {number} frequency - The frequency of the audio signal in hertz, applicable for methods that generate tones.
	 * @param {number} duration - The duration of the audio signal in milliseconds.
	 * @return {void} No return value.
	 */
	_executePlay(type, frequency, duration) {

		switch (this._audioMethod) {

			case 'file':
				this._playAudioFile(type);
				break;

			case 'system':
				this._playSystemBeep(frequency, duration);
				break;

			case 'tone':
				this._playGeneratedTone(frequency, duration);
				break;
		}
	}


	/**
	 * Plays an audio file based on the provided type and system platform.
	 *
	 * @param {string} type - The type of sound file to play, which determines the file to be used. Defaults to a beat file if the type is not found.
	 * @return {void} This method does not return a value.
	 */
	_playAudioFile(type) {

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

			console.error(`Error reproduciendo archivo: ${error.message}`);
		}
	}


	/**
	 * Plays a system beep sound with a specified frequency and duration for Windows,
	 * or uses platform-specific commands for macOS and other operating systems.
	 *
	 * @param {number} frequency - The frequency of the beep sound in hertz (only applicable to Windows and other systems that support custom frequencies).
	 * @param {number} duration - The duration of the beep sound in milliseconds (only applicable to Windows).
	 * @return {void} This method does not return a value.
	 */
	_playSystemBeep(frequency, duration) {

		try {
			if (process.platform === 'win32') {
				spawn('powershell', ['-c', `[Console]::Beep(${frequency}, ${duration})`], {
					stdio: 'ignore',
					detached: true
				});
			} else if (process.platform === 'darwin') {
				spawn('osascript', ['-e', 'beep'], {
					stdio: 'ignore',
					detached: true
				});
			} else {
				spawn('speaker-test', ['-t', 'sine', '-f', frequency.toString(), '-l', '1', '-s', '1'], {
					stdio: 'ignore',
					detached: true
				});
			}
		} catch (error) {
			console.error(`Error con beep del sistema: ${error.message}`);
		}
	}


	/**
	 * Plays a tone generated using ANSI characters and visual feedback based on the specified parameters.
	 *
	 * @param {number} frequency The frequency of the tone in Hertz, which determines the intensity.
	 * @param {number} duration The duration of the tone in milliseconds.
	 * @return {void} Does not return any value.
	 */
	_playGeneratedTone(frequency, duration) {

		// Generate tone using ANSI characters and visual feedback
		const intensity = Math.floor((frequency / 1000) * 10);
		const char = '♪♫♬'[Math.min(intensity, 2)];
		process.stdout.write(char);
	}


	/**
	 * Sets the volume level to a specified value. The value is clamped between 0 and 100.
	 *
	 * @param {number} volume - The desired volume level. Values below 0 are set to 0, and values above 100 are set to 100.
	 * @return {void}
	 */
	setVolume(volume) {

		this._volume = Math.max(0, Math.min(100, volume));
	}


	/**
	 * Retrieves information about the current audio settings and status.
	 *
	 * @return {Object} An object containing the following properties:
	 * - method: The audio method being used.
	 * - latency: The latency compensation value.
	 * - volume: The current volume level.
	 * - hasAudioFiles: A boolean indicating whether valid audio files are available.
	 */
	getAudioInfo() {

		return {
			method: this._audioMethod,
			latency: this._latencyCompensation,
			volume: this._volume,
			hasAudioFiles: Object.values(this._soundFiles).some(f => fs.existsSync(f))
		};
	}
}

export {AudioEngine}