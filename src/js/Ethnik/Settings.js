
class Settings {

	/**
	 * Predefined preset parameters
	 * @type {{volume: number, bpmMax: number, bpmInitial: number, bpmMin: number, soundFile: string}}
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
	 * Declares the min and max limits for each traditional tempo names
	 * @type {{larghissimo: number[], lento: number[], moderato: number[], andante: number[], prestissimo: number[], allegretto: number[], allegro: number[], largo: number[], vivace: number[], adagio: number[], presto: number[]}}
	 * @private
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


	getTempoList() {

		return Settings.tempoNames;
	}


	getTempoName(bpm) {

		for (const _k in Settings.tempoNames) {

			if (bpm >= Settings.tempoNames[_k][0] && bpm <= Settings.tempoNames[_k][1]) {

				return _k;
			}
		}
	}
}

export default Settings;