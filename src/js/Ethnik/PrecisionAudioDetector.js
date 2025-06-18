
class PrecisionAudioDetector {

	constructor() {

		this.audioContext = null;
		this.mediaStream = null;
		this.analyser = null;
		this.microphone = null;
		this.dataArray = null;
		this.isRecording = false;
		this.threshold = 0.1;
		this.sensitivity = 1.0;

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


	async startDetection() {

		try {
			// Solicitar acceso al micrófono
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
					sampleRate: 44100
				}
			});

			// Crear contexto de audio
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

			// Crear analizador
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = 2048;
			this.analyser.smoothingTimeConstant = 0.3;

			// Calcular bins de frecuencia
			const nyquist = this.audioContext.sampleRate / 2;
			this.lowFreqBin = Math.floor(80 / nyquist * this.analyser.frequencyBinCount);
			this.midFreqBin = Math.floor(1000 / nyquist * this.analyser.frequencyBinCount);
			this.highFreqBin = Math.floor(8000 / nyquist * this.analyser.frequencyBinCount);

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


	analyze() {

		if (!this.isRecording) return;

		this.analyser.getByteFrequencyData(this.dataArray);

		// Calcular niveles de frecuencia
		const lowLevel = this.getAverageLevel(0, this.lowFreqBin);
		const midLevel = this.getAverageLevel(this.lowFreqBin, this.midFreqBin);
		const highLevel = this.getAverageLevel(this.midFreqBin, this.highFreqBin);

		// Nivel general (ponderado hacia medios y agudos para palmas)
		const overallLevel = (lowLevel * 0.3 + midLevel * 0.5 + highLevel * 0.2) / 255;
		const adjustedLevel = Math.pow(overallLevel * this.sensitivity, 1.5);

		// Actualizar medidor visual
		this.audioMeter.style.width = `${Math.min(adjustedLevel * 100, 100)}%`;
		this.peakLevel.textContent = adjustedLevel.toFixed(3);

		// Detectar ataques de sonido
		this.detectSoundEvent(adjustedLevel);

		requestAnimationFrame(() => this.analyze());
	}


	getAverageLevel(startBin, endBin) {

		let sum = 0;
		const count = endBin - startBin;

		for (let i = startBin; i < endBin; i++) {
			sum += this.dataArray[i];
		}

		return sum / count;
	}


	detectSoundEvent(level) {

		const currentTime = performance.now();

		if (level > this.threshold && !this.isInAttack) {
			// Inicio de ataque detectado
			this.isInAttack = true;
			this.attackStartTime = currentTime;

			// Evitar detecciones múltiples muy cercanas (debounce de 50ms)
			if (currentTime - this.lastDetectionTime > 50) {
				this.onSoundDetected(currentTime, level);
				this.lastDetectionTime = currentTime;
			}
		}

		if (level < this.threshold * 0.7 && this.isInAttack) {
			// Fin de ataque
			this.isInAttack = false;
		}
	}


	onSoundDetected(timestamp, level) {

		this.detectionCount++;
		this.detectionTimes.push(timestamp);

		// Mantener solo las últimas 10 detecciones para análisis
		if (this.detectionTimes.length > 10) {
			this.detectionTimes.shift();
		}

		// Calcular estadísticas
		this.updateStats();

		// Log de detección
		const intensity = Math.round(level * 100);
		this.addLog(`🔊 Sonido detectado - Intensidad: ${intensity}% - Tiempo: ${timestamp.toFixed(1)}ms`);
	}


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

			// Estimar BPM
			const bpm = Math.round(60000 / avgInterval);
			this.bpmEstimate.textContent = bpm > 0 && bpm < 300 ? bpm : '--';
		}
	}


	updateThresholdLine() {

		this.thresholdLine.style.left = `${this.threshold * 100}%`;
	}


	addLog(message) {

		const logEntry = document.createElement('div');
		logEntry.className = 'detection-entry';
		logEntry.innerHTML = `<span style="color: #4ecdc4;">${new Date().toLocaleTimeString()}</span> ${message}`;

		this.logContainer.insertBefore(logEntry, this.logContainer.firstChild);

		// Limitar el log a 20 entradas
		while (this.logContainer.children.length > 20) {
			this.logContainer.removeChild(this.logContainer.lastChild);
		}
	}


	clearLog() {

		this.logContainer.innerHTML = '<div style="color: #888; font-style: italic;">Log limpiado...</div>';
		this.detectionCount = 0;
		this.detectionTimes = [];
		this.updateStats();
	}
}

// Inicializar cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
	new PrecisionAudioDetector();
});