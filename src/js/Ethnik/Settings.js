


/**
 * A class representing the configuration settings for a rhythm helper application.
 * Includes default parameters and predefined tempo names along with helper methods.
 */
class Settings {

	
	/**
	 * An object representing the default parameters for the rhythm helper application.
	 * These parameters include settings such as tempo, beat division, volume, and sound file.
	 *
	 * Properties:
	 * - bpmMin: The minimum beats per minute (bpm) value allowed.
	 * - bpmMax: The maximum beats per minute (bpm) value allowed.
	 * - bpmInitial: The initial beats per minute (bpm) value when the application starts.
	 * - division: The beat division multiplier (e.g., quarter note, eighth note, etc.).
	 * - volume: The default volume level, represented as a percentage (0 to 100).
	 * - soundFile: The file path to the default sound file used for rhythm playback.
	 */
	static defaultParams = {

		bpmMin: 		20,
		bpmMax: 		218,
		bpmInitial: 	100,
		division:		1,
		volume: 		70,
		soundFile: 		'./defaultAssets/sounds/rhythmHelper_classic_sound.ogg'
	}


	/**
	 * An object representing various musical tempo names and their corresponding
	 * beats per minute (BPM) ranges.
	 *
	 * Each key in the object is a tempo name, and its value is an array of two numbers:
	 * the minimum and maximum BPM for that tempo.
	 *
	 * Properties:
	 * - `larghissimo`: Very, very slow tempo with BPM ranging from 20 to 39.
	 * - `largo`: Slow and dignified tempo with BPM ranging from 40 to 59.
	 * - `lento`: Slow tempo with BPM ranging from 60 to 67.
	 * - `adagio`: Leisurely tempo with BPM ranging from 68 to 79.
	 * - `andante`: Walking pace tempo with BPM ranging from 80 to 99.
	 * - `moderato`: Moderate tempo with BPM ranging from 100 to 111.
	 * - `allegretto`: Moderately fast tempo with BPM ranging from 112 to 127.
	 * - `allegro`: Fast, quickly, and bright tempo with BPM ranging from 128 to 159.
	 * - `vivace`: Lively and fast tempo with BPM ranging from 160 to 169.
	 * - `presto`: Very fast tempo with BPM ranging from 170 to 199.
	 * - `prestissimo`: Extremely fast tempo with BPM ranging from 200 to 218.
	 */
	static tempoNames = {

		larghissimo: 	[20, 39],
		largo:			[40, 59],
		lento:			[60, 67],
		adagio:			[68, 79],
		andante:		[80, 99],
		moderato:		[100, 111],
		allegretto:		[112, 127],
		allegro:		[128, 159],
		vivace:			[160, 169],
		presto:			[170, 199],
		prestissimo:	[200, 218]
	}


	/**
	 * Retrieves the list of tempo names from the settings.
	 *
	 * @return {Array} The array containing the tempo names.
	 */
	static getTempoList() {

		return Settings.tempoNames;
	}


	/**
	 * Determines the tempo name corresponding to the given beats per minute (bpm) value.
	 *
	 * @param {number} bpm - The beats per minute value to determine the tempo name for.
	 * @return {string} The tempo name that corresponds to the provided bpm, or undefined if no match is found.
	 */
	static getTempoName(bpm) {

		for (const _k in Settings.tempoNames) {

			if (bpm >= Settings.tempoNames[_k][0] && bpm <= Settings.tempoNames[_k][1]) {

				return _k;
			}
		}
	}
}

export default Settings;