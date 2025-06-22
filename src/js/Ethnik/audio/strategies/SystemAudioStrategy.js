import { spawn } from 'child_process';
import AudioPlaybackStrategy from './AudioPlaybackStrategy.js';
import Settings from "../../core/Settings.js";


/**
 * Represents a strategy for playing system-level audio feedback like beeps.
 * This class uses system commands to produce audio and verifies the availability of such capabilities on the host platform.
 */
class SystemAudioStrategy extends AudioPlaybackStrategy {

	/**
	 * Plays a beep sound based on the given type, frequency, and duration. The implementation uses platform-specific methods
	 * to generate the sound.
	 *
	 * @param {string} type - The type of beep sound to play. This parameter is not used in the current implementation but might be used for future extensions or differentiating sound types.
	 * @param {number} frequency - The frequency of the beep sound in Hertz (Hz). This parameter is utilized for generating different tones.
	 * @param {number} duration - The duration of the beep sound in milliseconds (ms). Higher values produce a longer beep.
	 * @return {Promise<void>} A promise that resolves once the beep process has been successfully triggered.
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
	 * Determines if the system's audio output is available and functional by testing platform-specific commands.
	 *
	 * @return {Promise<boolean>} A promise that resolves to `true` if the platform command is successfully executed, indicating audio output is available; otherwise `false`.
	 */
	async isAvailable() {

		try {
			if (process.platform === 'win32') {
				const testFreq = Settings.audioConstants.frequencies.beat;
				const testDuration = Settings.audioConstants.durations.subdivision;
				await this._testCommand('powershell', ['-c', `[Console]::Beep(${testFreq}, ${testDuration})`]);
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
	 * Executes a command with the given arguments in a child process and resolves or rejects based on the process outcome.
	 *
	 * @param {string} command The command to execute.
	 * @param {string[]} args An array of arguments to pass to the command.
	 * @return {Promise<void>} A promise that resolves if the command completes successfully or rejects if it fails.
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