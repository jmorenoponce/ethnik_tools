import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';
import Settings from "../../core/Settings.js";

/**
 * Enhanced ToneGeneratorStrategy that works in both Node.js and Browser environments
 *
 * Features:
 * - Real audio tone generation using Web Audio API (browser)
 * - Terminal bell fallback for Node.js
 * - PCM buffer generation for Node.js audio
 * - Visual symbols as last resort fallback
 * - Configurable audio parameters
 *
 * 🔧 FIXED: Now generates real audio tones instead of just visual symbols
 * 🆕 NEW: Dual environment support (Node.js + Browser)
 * 🆕 NEW: Multiple fallback strategies
 */
class ToneGeneratorStrategy extends AudioPlaybackStrategy {

	constructor() {
		super();

		// Environment detection
		this.isNode = (typeof window === 'undefined');
		this.isBrowser = !this.isNode;

		// Audio context for browser
		this.audioContext = null;
		this.masterGain = null;

		// Configuration
		this.volume = 1.0;
		this.debugMode = false;

		// Performance tracking
		this.stats = {
			tonesGenerated: 0,
			fallbacksUsed: 0,
			errors: 0
		};

		this._initializeAudioSystem();
	}

	/**
	 * Initialize the appropriate audio system based on environment
	 */
	async _initializeAudioSystem() {
		if (this.isBrowser) {
			await this._initBrowserAudio();
		} else {
			await this._initNodeAudio();
		}
	}

	/**
	 * Initialize Web Audio API for browser environment
	 */
	async _initBrowserAudio() {
		try {
			// Check if Web Audio API is available
			const AudioContextClass = (typeof AudioContext !== 'undefined') ? AudioContext :
				(typeof webkitAudioContext !== 'undefined') ? webkitAudioContext : null;

			if (!AudioContextClass) {
				this._log('Web Audio API not available in this browser');
				return;
			}

			this.audioContext = new AudioContextClass();

			// Create master gain node
			this.masterGain = this.audioContext.createGain();
			this.masterGain.connect(this.audioContext.destination);
			this.masterGain.gain.value = this.volume;

			// Resume context if suspended
			if (this.audioContext.state === 'suspended') {
				await this.audioContext.resume();
			}

			this._log(`Browser audio initialized - Sample Rate: ${this.audioContext.sampleRate}Hz`);

		} catch (error) {
			this._log(`Browser audio initialization failed: ${error.message}`);
			this.stats.errors++;
		}
	}

	/**
	 * Initialize Node.js audio capabilities
	 */
	async _initNodeAudio() {
		try {
			// Check what's available in Node.js environment
			this.hasTerminalBell = true; // Always available

			// Check for speaker module (optional)
			try {
				this.Speaker = require('speaker');
				this._log('Node.js Speaker module available');
			} catch (e) {
				this._log('Speaker module not available - using terminal bell fallback');
			}

			this._log('Node.js audio initialized');

		} catch (error) {
			this._log(`Node.js audio initialization failed: ${error.message}`);
			this.stats.errors++;
		}
	}

	/**
	 * Play a tick sound with the appropriate method for the environment
	 */
	async playTick(type = 'beat', frequency = 800, duration = 100, volume = null) {
		try {
			const playVolume = volume !== null ? volume : this.volume;

			if (this.isBrowser && this.audioContext) {
				await this._playBrowserTone(frequency, duration, playVolume);
			} else if (this.isNode) {
				await this._playNodeTone(type, frequency, duration, playVolume);
			} else {
				// Ultimate fallback: visual symbols
				this._playVisualTone(type, frequency, duration);
			}

			this.stats.tonesGenerated++;

		} catch (error) {
			this._log(`Error playing tick: ${error.message}`);
			this.stats.errors++;

			// Fallback to visual representation
			this._playVisualTone(type, frequency, duration);
		}
	}

	/**
	 * Generate real audio tone using Web Audio API (Browser)
	 */
	async _playBrowserTone(frequency, duration, volume) {
		if (!this.audioContext) {
			throw new Error('Audio context not available');
		}

		// Resume context if needed
		if (this.audioContext.state === 'suspended') {
			await this.audioContext.resume();
		}

		// Create oscillator and gain nodes
		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		// Configure oscillator
		oscillator.type = 'sine'; // Clean sine wave
		oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

		// Configure envelope (ADSR) to avoid clicks
		const now = this.audioContext.currentTime;
		const attackTime = 0.01;  // 10ms attack
		const releaseTime = 0.05; // 50ms release
		const sustainTime = Math.max(0, (duration / 1000) - attackTime - releaseTime);

		// Set up gain envelope
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
		gainNode.gain.setValueAtTime(volume, now + attackTime + sustainTime);
		gainNode.gain.linearRampToValueAtTime(0, now + attackTime + sustainTime + releaseTime);

		// Connect audio graph
		oscillator.connect(gainNode);
		gainNode.connect(this.masterGain);

		// Start and stop
		oscillator.start(now);
		oscillator.stop(now + attackTime + sustainTime + releaseTime);

		this._log(`Browser tone: ${frequency}Hz for ${duration}ms at volume ${(volume * 100).toFixed(0)}%`);
	}

	/**
	 * Generate audio tone for Node.js environment
	 */
	async _playNodeTone(type, frequency, duration, volume) {
		// Try different Node.js audio methods in order of preference

		// Method 1: Terminal bell (simple but works everywhere)
		if (await this._tryTerminalBell(frequency, duration)) {
			return;
		}

		// Method 2: Generate PCM buffer and play with speaker module
		if (this.Speaker && await this._tryPCMGeneration(frequency, duration, volume)) {
			return;
		}

		// Method 3: System command fallback
		if (await this._trySystemCommand(frequency, duration)) {
			return;
		}

		// If all else fails, use visual fallback
		this._playVisualTone(type, frequency, duration);
		this.stats.fallbacksUsed++;
	}

	/**
	 * Terminal bell method (Node.js)
	 */
	async _tryTerminalBell(frequency, duration) {
		try {
			// Multiple beeps for higher frequencies, longer duration for lower frequencies
			const beepCount = Math.max(1, Math.min(5, Math.floor(frequency / 400)));
			const beepInterval = duration / beepCount;

			for (let i = 0; i < beepCount; i++) {
				process.stderr.write('\x07'); // Terminal bell
				if (i < beepCount - 1) {
					await this._delay(beepInterval);
				}
			}

			this._log(`Terminal bell: ${beepCount} beep(s) for ${frequency}Hz`);
			return true;

		} catch (error) {
			this._log(`Terminal bell failed: ${error.message}`);
			return false;
		}
	}

	/**
	 * PCM buffer generation method (Node.js with speaker module)
	 */
	async _tryPCMGeneration(frequency, duration, volume) {
		try {
			if (!this.Speaker) return false;

			const sampleRate = 44100;
			const samples = Math.floor(sampleRate * (duration / 1000));
			const buffer = Buffer.alloc(samples * 2); // 16-bit samples

			// Generate sine wave PCM data
			for (let i = 0; i < samples; i++) {
				const time = i / sampleRate;

				// Apply envelope to avoid clicks
				let envelope = 1;
				const fadeTime = 0.01; // 10ms fade
				const fadeSamples = Math.floor(sampleRate * fadeTime);

				if (i < fadeSamples) {
					envelope = i / fadeSamples; // Fade in
				} else if (i > samples - fadeSamples) {
					envelope = (samples - i) / fadeSamples; // Fade out
				}

				const sample = Math.sin(2 * Math.PI * frequency * time) * volume * envelope;
				const intSample = Math.floor(sample * 32767); // Convert to 16-bit

				buffer.writeInt16LE(intSample, i * 2);
			}

			// Play the buffer
			const speaker = new this.Speaker({
				channels: 1,
				bitDepth: 16,
				sampleRate: sampleRate
			});

			return new Promise((resolve) => {
				speaker.write(buffer);
				speaker.end();
				speaker.on('finish', () => {
					this._log(`PCM tone: ${frequency}Hz for ${duration}ms`);
					resolve(true);
				});
			});

		} catch (error) {
			this._log(`PCM generation failed: ${error.message}`);
			return false;
		}
	}

	/**
	 * System command fallback (Node.js)
	 */
	async _trySystemCommand(frequency, duration) {
		try {
			const { spawn } = require('child_process');
			const platform = process.platform;

			let command, args;

			if (platform === 'win32') {
				command = 'powershell';
				args = ['-c', `[Console]::Beep(${frequency}, ${duration})`];
			} else if (platform === 'darwin') {
				command = 'osascript';
				args = ['-e', 'beep'];
			} else {
				// Linux - try to use speaker-test with frequency
				command = 'speaker-test';
				args = ['-t', 'sine', '-f', frequency.toString(), '-l', '1', '-s', '1'];
			}

			return new Promise((resolve) => {
				const child = spawn(command, args, { stdio: 'ignore' });

				const timeout = setTimeout(() => {
					child.kill();
					resolve(false);
				}, duration + 1000);

				child.on('close', (code) => {
					clearTimeout(timeout);
					this._log(`System command tone: ${frequency}Hz (exit code: ${code})`);
					resolve(code === 0);
				});

				child.on('error', () => {
					clearTimeout(timeout);
					resolve(false);
				});
			});

		} catch (error) {
			this._log(`System command failed: ${error.message}`);
			return false;
		}
	}

	/**
	 * Visual tone representation (universal fallback)
	 */
	_playVisualTone(type, frequency, duration) {
		// Use the existing visual representation logic
		const config = Settings.visualAudioConstants.toneGeneration;
		const maxFrequency = Settings.audioConstants.frequencies.downbeat;

		const intensity = Math.floor((frequency / maxFrequency) * config.intensityLevels);
		const symbols = config.musicSymbols.chars;
		const clampedIntensity = Math.min(intensity, config.maxSymbolIndex);
		const char = symbols[clampedIntensity];

		const outputConfig = Settings.visualAudioConstants.output;
		let output = char;

		if (outputConfig.addSpacing) {
			output += ' ';
		}

		process.stdout.write(output);
		this._log(`Visual tone: ${char} for ${frequency}Hz`);
	}

	/**
	 * Set volume level
	 */
	setVolume(volume) {
		this.volume = Math.max(0, Math.min(1, volume));

		if (this.masterGain) {
			// Smooth volume transition
			const now = this.audioContext.currentTime;
			this.masterGain.gain.setTargetAtTime(this.volume, now, 0.01);
		}

		this._log(`Volume set to ${(this.volume * 100).toFixed(0)}%`);
	}

	/**
	 * Check if tone generation is available
	 */
	async isAvailable() {
		if (this.isBrowser) {
			return (typeof AudioContext !== 'undefined') || (typeof webkitAudioContext !== 'undefined');
		} else {
			// In Node.js, we always have at least terminal bell
			return true;
		}
	}

	/**
	 * Get capabilities and statistics
	 */
	getCapabilities() {
		const caps = {
			environment: this.isNode ? 'Node.js' : 'Browser',
			audioContext: !!this.audioContext,
			terminalBell: this.hasTerminalBell,
			speakerModule: !!this.Speaker,
			stats: this.stats
		};

		if (this.audioContext) {
			caps.sampleRate = this.audioContext.sampleRate;
			caps.state = this.audioContext.state;
		}

		return caps;
	}

	/**
	 * Test all available audio methods
	 */
	async testAudio() {
		this._log('Testing all available audio methods...');

		const testFrequency = 800;
		const testDuration = 200;
		const results = {};

		if (this.isBrowser && this.audioContext) {
			try {
				await this._playBrowserTone(testFrequency, testDuration, 0.5);
				results.browserAudio = 'SUCCESS';
			} catch (error) {
				results.browserAudio = `FAILED: ${error.message}`;
			}
		}

		if (this.isNode) {
			// Test terminal bell
			try {
				await this._tryTerminalBell(testFrequency, testDuration);
				results.terminalBell = 'SUCCESS';
			} catch (error) {
				results.terminalBell = `FAILED: ${error.message}`;
			}

			// Test PCM generation
			if (this.Speaker) {
				try {
					await this._tryPCMGeneration(testFrequency, testDuration, 0.5);
					results.pcmGeneration = 'SUCCESS';
				} catch (error) {
					results.pcmGeneration = `FAILED: ${error.message}`;
				}
			}

			// Test system commands
			try {
				const success = await this._trySystemCommand(testFrequency, testDuration);
				results.systemCommand = success ? 'SUCCESS' : 'FAILED';
			} catch (error) {
				results.systemCommand = `FAILED: ${error.message}`;
			}
		}

		this._log('Audio test results:', results);
		return results;
	}

	/**
	 * Enable debug mode
	 */
	setDebugMode(enabled) {
		this.debugMode = enabled;
		this._log(enabled ? 'Debug mode enabled' : 'Debug mode disabled');
	}

	/**
	 * Utility: delay function
	 */
	_delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Utility: logging
	 */
	_log(message, data = null) {
		if (this.debugMode) {
			if (data) {
				console.log(`[ToneGeneratorStrategy] ${message}`, data);
			} else {
				console.log(`[ToneGeneratorStrategy] ${message}`);
			}
		}
	}

	/**
	 * Cleanup resources
	 */
	async destroy() {
		this._log('Destroying ToneGeneratorStrategy...');

		if (this.audioContext && this.audioContext.state !== 'closed') {
			try {
				await this.audioContext.close();
			} catch (error) {
				this._log(`Error closing audio context: ${error.message}`);
			}
		}

		this.audioContext = null;
		this.masterGain = null;
		this.Speaker = null;

		this._log('ToneGeneratorStrategy destroyed');
	}
}

export default ToneGeneratorStrategy;