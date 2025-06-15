
import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';


class AudioEngine {

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


	async _initAudioSystem() {

		// Detect the best available audio method
		this._audioMethod = await this._detectBestAudioMethod();
		console.log(`🔊 Método de audio: ${this._audioMethod}`);

		// Calibrate latency if necessary
		if (this._audioMethod === 'system') {
			this._calibrateLatency();
		}
	}


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


	_calibrateLatency() {

		// Simple latency calibration - can be improved with real audio
		const calibrationStart = performance.now();
		this._playSystemBeep(440, 50);
		this._latencyCompensation = performance.now() - calibrationStart;
		console.log(`🎛️  Latencia estimada: ${this._latencyCompensation.toFixed(2)}ms`);
	}


	async playTick(type = 'beat', frequency = 800, duration = 100) {

		const compensatedDelay = Math.max(0, -this._latencyCompensation);

		if (compensatedDelay > 0) {
			setTimeout(() => this._executePlay(type, frequency, duration), compensatedDelay);
		} else {
			this._executePlay(type, frequency, duration);
		}
	}


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


	_playGeneratedTone(frequency, duration) {

		// Generate tone using ANSI characters and visual feedback
		const intensity = Math.floor((frequency / 1000) * 10);
		const char = '♪♫♬'[Math.min(intensity, 2)];
		process.stdout.write(char);
	}


	setVolume(volume) {

		this._volume = Math.max(0, Math.min(100, volume));
	}


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