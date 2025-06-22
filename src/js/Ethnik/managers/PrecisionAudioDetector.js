import Settings from "../core/Settings.js";

/**
 * The PrecisionAudioDetector class provides mechanisms for audio signal analysis and sound event detection
 * using input from the user's microphone. It supports frequency analysis, visualization of audio levels,
 * and detection of specific sound events such as peaks or attacks.
 */
class PrecisionAudioDetector {

	/**
	 * Constructor for initializing the audio processing and event detection instance.
	 * Initializes various properties related to audio context, media stream, frequency analysis, and event detection.
	 * Also sets up required elements and event listeners necessary for operation.
	 *
	 * @return {void} Does not return a value.
	 */
	constructor() {

		this.audioContext = null;
		this.mediaStream = null;
		this.analyser = null;
		this.microphone = null;
		this.dataArray = null;
		this.isRecording = false;

		// ✅ REFACTORED: Usar valores centralizados de Settings
		this.threshold = Settings.audioDetectionConstants.defaultThreshold;
		this.sensitivity = Settings.audioDetectionConstants.defaultSensitivity;

		// Detección de eventos
		this.lastDetectionTime = 0;
		this.detectionCount = 0;
		this.detectionTimes = [];
		this.isInAttack = false;
		this.attackStartTime = 0;

		// Análisis de frecuencia
		this.lowFreqBin = 0;
		this.midFreqBin = 0;
		this.highFreqBin = 0;

		this.initializeElements();
		this.setupEventListeners();
	}


	/**
	 * Initializes all the necessary DOM elements by assigning them to their respective properties.
	 *
	 * @return {void} This method does not return a value.
	 */
	initializeElements() {

		this.startBtn = document.getElementById('startBtn');
		this.stopBtn = document.getElementById('stopBtn');
		this.clearLogBtn = document.getElementById('clearLog');
		this.thresholdSlider = document.getElementById('thresholdSlider');
		this.sensitivitySlider = document.getElementById('sensitivitySlider');
		this.thresholdValue = document.getElementById('thresholdValue');
		this.sensitivityValue = document.getElementById('sensitivityValue');
		this.audioMeter = document.getElementById('audioMeter');
		this.thresholdLine = document.getElementById('thresholdLine');
		this.peakLevel = document.getElementById('peakLevel');
		this.detectionCountEl = document.getElementById('detectionCount');
		this.avgInterval = document.getElementById('avgInterval');
		this.bpmEstimate = document.getElementById('bpmEstimate');
		this.logContainer = document.getElementById('logContainer');
	}


	/**
	 * Sets up event listeners for various interactive elements.
	 * Binds actions to button clicks and slider input changes for controlling and configuring features.
	 *
	 * @return {void} This method does not return a value.
	 */
	setupEventListeners() {

		this.startBtn.addEventListener('click', () => this.startDetection());
		this.stopBtn.addEventListener('click', () => this.stopDetection());
		this.clearLogBtn.addEventListener('click', () => this.clearLog());

		this.thresholdSlider.addEventListener('input', (e) => {
			this.threshold = parseFloat(e.target.value);
			this.thresholdValue.textContent = this.threshold.toFixed(2);
			this.updateThresholdLine();
		});

		this.sensitivitySlider.addEventListener('input', (e) => {
			this.sensitivity = parseFloat(e.target.value);
			this.sensitivityValue.textContent = this.sensitivity.toFixed(1);
		});
	}


	/**
	 * Initiates the detection process by accessing the microphone, setting up the audio context, and configuring audio analysis tools.
	 * Begins the process of capturing and analyzing audio data.
	 *
	 * @return {Promise<void>} Resolves when the detection process starts successfully, or handles any error during initialization.
	 */
	async startDetection() {

		try {
			// ✅ REFACTORED: Usar configuración de audio centralizada
			const audioConfig = Settings.audioDetectionConstants.audioCapture;

			// Solicitar acceso al micrófono con configuración centralizada
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: audioConfig.echoCancellation,
					noiseSuppression: audioConfig.noiseSuppression,
					autoGainControl: audioConfig.autoGainControl,
					sampleRate: audioConfig.sampleRate
				}
			});

			// Crear contexto de audio
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

			// ✅ REFACTORED: Usar configuración FFT centralizada
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = Settings.audioDetectionConstants.fft.size;
			this.analyser.smoothingTimeConstant = Settings.audioDetectionConstants.fft.smoothingTimeConstant;

			// ✅ REFACTORED: Calcular bins de frecuencia usando valores centralizados
			const nyquist = this.audioContext.sampleRate / 2;
			const freqs = Settings.audioDetectionConstants.analysisFrequencies;

			this.lowFreqBin = Math.floor(freqs.lowCutoff / nyquist * this.analyser.frequencyBinCount);
			this.midFreqBin = Math.floor(freqs.midCutoff / nyquist * this.analyser.frequencyBinCount);
			this.highFreqBin = Math.floor(freqs.highCutoff / nyquist * this.analyser.frequencyBinCount);

			// Conectar micrófono
			this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
			this.microphone.connect(this.analyser);

			// Preparar array de datos
			this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

			this.isRecording = true;
			this.startBtn.disabled = true;
			this.stopBtn.disabled = false;

			this.addLog('🎤 Detección iniciada');
			this.analyze();

		} catch (error) {
			console.error('Error accessing microphone:', error);
			this.addLog(`❌ Error: ${error.message}`);
		}
	}


	/**
	 * Stops the ongoing detection process, including media stream and audio context operations.
	 * Resets relevant UI controls and updates the audio meter to reflect the stopped state.
	 * Logs the stop action.
	 *
	 * @return {void} No return value.
	 */
	stopDetection() {

		this.isRecording = false;

		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach(track => track.stop());
		}

		if (this.audioContext) {
			this.audioContext.close();
		}

		this.startBtn.disabled = false;
		this.stopBtn.disabled = true;
		this.audioMeter.style.width = '0%';

		this.addLog('⏹️ Detección detenida');
	}


	/**
	 * Analyzes the current audio data from the specified audio source, computes frequency levels,
	 * updates the visual audio meter, and detects sound events based on the analysis.
	 *
	 * @return {void} Does not return any value. This method performs operations like updating visual audio feedback and detecting sound events in a loop.
	 */
	analyze() {

		if (!this.isRecording) return;

		this.analyser.getByteFrequencyData(this.dataArray);

		// Calcular niveles de frecuencia
		const lowLevel = this.getAverageLevel(0, this.lowFreqBin);
		const midLevel = this.getAverageLevel(this.lowFreqBin, this.midFreqBin);
		const highLevel = this.getAverageLevel(this.midFreqBin, this.highFreqBin);

		// ✅ REFACTORED: Usar pesos centralizados para análisis de nivel
		const weights = Settings.audioDetectionConstants.levelWeights;
		const overallLevel = (lowLevel * weights.low + midLevel * weights.mid + highLevel * weights.high) / weights.normalize;

		// ✅ REFACTORED: Usar exponente centralizado para ajuste de sensibilidad
		const adjustedLevel = Math.pow(overallLevel * this.sensitivity, Settings.audioDetectionConstants.sensitivityExponent);

		// Actualizar medidor visual
		this.audioMeter.style.width = `${Math.min(adjustedLevel * 100, 100)}%`;
		this.peakLevel.textContent = adjustedLevel.toFixed(3);

		// Detectar ataques de sonido
		this.detectSoundEvent(adjustedLevel);

		requestAnimationFrame(() => this.analyze());
	}


	/**
	 * Calculates the average level of values within a specified range of indices.
	 *
	 * @param {number} startBin - The starting index of the range (inclusive).
	 * @param {number} endBin - The ending index of the range (exclusive).
	 * @return {number} The average level of the values in the specified range.
	 */
	getAverageLevel(startBin, endBin) {

		let sum = 0;
		const count = endBin - startBin;

		for (let i = startBin; i < endBin; i++) {
			sum += this.dataArray[i];
		}

		return sum / count;
	}


	/**
	 * Detects a sound event based on the input level and a predefined threshold.
	 * Executes a callback when a valid sound event is detected.
	 *
	 * @param {number} level The audio level to be analyzed for detecting a sound event.
	 * @return {void} Does not return a value.
	 */
	detectSoundEvent(level) {

		const currentTime = performance.now();

		if (level > this.threshold && !this.isInAttack) {
			this.isInAttack = true;
			this.attackStartTime = currentTime;

			// Evitar detecciones múltiples muy cercanas usando debounce centralizado
			if (currentTime - this.lastDetectionTime > Settings.performanceConstants.debounceTime) {
				this.onSoundDetected(currentTime, level);
				this.lastDetectionTime = currentTime;
			}
		}

		// ✅ REFACTORED: Usar ratio centralizado para detectar fin de ataque
		const releaseThreshold = this.threshold * Settings.audioDetectionConstants.attackReleaseRatio;
		if (level < releaseThreshold && this.isInAttack) {
			this.isInAttack = false;
		}
	}



	/**
	 * Handles the detection of a sound event, processes the detection data,
	 * updates statistics, and logs the detection.
	 *
	 * @param {number} timestamp - The time at which the sound was detected, in milliseconds.
	 * @param {number} level - The intensity level of the detected sound, represented as a value between 0 and 1.
	 * @return {void}
	 */
	onSoundDetected(timestamp, level) {

		this.detectionCount++;
		this.detectionTimes.push(timestamp);

		// ✅ REFACTORED: Usar límite centralizado para historial de detecciones
		const maxHistory = Settings.audioDetectionConstants.maxDetectionHistory;
		if (this.detectionTimes.length > maxHistory) {
			this.detectionTimes.shift();
		}

		// Calcular estadísticas
		this.updateStats();

		// Log de detección
		const intensity = Math.round(level * 100);
		this.addLog(`🔊 Sonido detectado - Intensidad: ${intensity}% - Tiempo: ${timestamp.toFixed(1)}ms`);
	}


	/**
	 * Updates the statistics displayed in the user interface, including detection count,
	 * average interval between detections, and an estimate of beats per minute (BPM) when applicable.
	 *
	 * @return {void} This method does not return a value. It updates the relevant UI elements based on the calculated statistics.
	 */
	updateStats() {

		this.detectionCountEl.textContent = this.detectionCount;

		if (this.detectionTimes.length > 1) {
			// Calcular intervalo promedio
			const intervals = [];
			for (let i = 1; i < this.detectionTimes.length; i++) {
				intervals.push(this.detectionTimes[i] - this.detectionTimes[i - 1]);
			}

			const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
			this.avgInterval.textContent = `${Math.round(avgInterval)}ms`;

			// ✅ REFACTORED: Usar rango de validación centralizado para BPM
			const bpm = Math.round(60000 / avgInterval);
			const bpmRange = Settings.audioDetectionConstants.bpmValidRange;

			this.bpmEstimate.textContent = (bpm >= bpmRange.min && bpm <= bpmRange.max) ? bpm : '--';
		}
	}


	/**
	 * Updates the position of the threshold line according to the current threshold value.
	 *
	 * The method adjusts the left style property of the threshold line element
	 * to align with the calculated percentage based on the threshold value.
	 *
	 * @return {void} Does not return a value.
	 */
	updateThresholdLine() {

		this.thresholdLine.style.left = `${this.threshold * 100}%`;
	}


	/**
	 * Adds a new log entry to the log container. The log entry includes a timestamp and the provided message.
	 * Limits the log to the 20 most recent entries.
	 *
	 * @param {string} message - The message to be logged.
	 * @return {void}
	 */
	addLog(message) {

		const logEntry = document.createElement('div');
		logEntry.className = 'detection-entry';
		logEntry.innerHTML = `<span style="color: #4ecdc4;">${new Date().toLocaleTimeString()}</span> ${message}`;

		this.logContainer.insertBefore(logEntry, this.logContainer.firstChild);

		// ✅ REFACTORED: Usar límite centralizado para entradas de log
		const maxEntries = Settings.audioDetectionConstants.maxLogEntries;
		while (this.logContainer.children.length > maxEntries) {
			this.logContainer.removeChild(this.logContainer.lastChild);
		}
	}


	/**
	 * Clears the log by resetting its content and related statistics.
	 * Resets detection count and detection times. Updates statistics after clearing the log.
	 *
	 * @return {void} This method does not return any value.
	 */
	clearLog() {

		this.logContainer.innerHTML = '<div style="color: #888; font-style: italic;">Log limpiado...</div>';
		this.detectionCount = 0;
		this.detectionTimes = [];
		this.updateStats();
	}
}


document.addEventListener('DOMContentLoaded', () => {
	new PrecisionAudioDetector();
});