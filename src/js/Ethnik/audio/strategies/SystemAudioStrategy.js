import { spawn } from 'child_process';
import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';

/**
 * System beep audio playback strategy
 */
class SystemAudioStrategy extends AudioPlaybackStrategy {

	/**
	 * Play a system beep sound with specified frequency and duration.
	 *
	 * @param {string} type - Not used in system strategy but kept for interface consistency.
	 * @param {number} frequency - The frequency of the beep sound in hertz.
	 * @param {number} duration - The duration of the beep sound in milliseconds.
	 * @return {Promise<void>} A promise that resolves when the beep is initiated.
	 */
	async playTick(type, frequency, duration) {

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
			console.error(`Error with system beep: ${error.message}`);
		}
	}


	/**
	 * Test if system audio commands are available.
	 *
	 * @return {Promise<boolean>} A promise that resolves to true if system audio is available.
	 */
	async isAvailable() {

		try {

			if (process.platform === 'win32') {
				await this._testCommand('powershell', ['-c', '[Console]::Beep(440, 50)']);
				return true;
			} else if (process.platform === 'darwin') {
				await this._testCommand('osascript', ['-e', 'beep 1']);
				return true;
			} else {
				await this._testCommand('speaker-test', ['--help']);
				return true;
			}

		} catch {
			return false;
		}
	}


	/**
	 * Test a command to see if it's available.
	 *
	 * @param {string} command - The command to test.
	 * @param {Array<string>} args - Arguments for the command.
	 * @return {Promise<void>} A promise that resolves if command succeeds.
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
}

export default SystemAudioStrategy;