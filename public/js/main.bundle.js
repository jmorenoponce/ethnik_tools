/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/Ethnik/ConsoleManager.js":
/*!*****************************************!*\
  !*** ./src/js/Ethnik/ConsoleManager.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass ConsoleManager {\r\n\tconstructor(core) {\r\n\t\tthis._core = core;\r\n\t\tthis._commandHistory = [];\r\n\t\tthis._historyIndex = -1;\r\n\t\tthis._initConsoleInterface();\r\n\t}\r\n\r\n\t_initConsoleInterface() {\r\n\t\t// Configurar entrada raw para mejor control\r\n\t\tif (process.stdin.isTTY) {\r\n\t\t\tprocess.stdin.setRawMode(true);\r\n\t\t}\r\n\t\tprocess.stdin.setEncoding('utf8');\r\n\t\tprocess.stdin.resume();\r\n\r\n\t\tthis._showCommands();\r\n\t\tthis._showPrompt();\r\n\r\n\t\tlet inputBuffer = '';\r\n\r\n\t\tprocess.stdin.on('data', (key) => {\r\n\t\t\t// Manejar caracteres especiales\r\n\t\t\tif (key === '\\u0003') { // Ctrl+C\r\n\t\t\t\tthis._handleExit();\r\n\t\t\t\treturn;\r\n\t\t\t}\r\n\r\n\t\t\tif (key === '\\r' || key === '\\n') { // Enter\r\n\t\t\t\tif (inputBuffer.trim()) {\r\n\t\t\t\t\tthis._processCommand(inputBuffer.trim());\r\n\t\t\t\t\tthis._commandHistory.push(inputBuffer.trim());\r\n\t\t\t\t\tthis._historyIndex = this._commandHistory.length;\r\n\t\t\t\t}\r\n\t\t\t\tinputBuffer = '';\r\n\t\t\t\tthis._showPrompt();\r\n\t\t\t\treturn;\r\n\t\t\t}\r\n\r\n\t\t\tif (key === '\\u007f' || key === '\\b') { // Backspace\r\n\t\t\t\tif (inputBuffer.length > 0) {\r\n\t\t\t\t\tinputBuffer = inputBuffer.slice(0, -1);\r\n\t\t\t\t\tprocess.stdout.write('\\b \\b');\r\n\t\t\t\t}\r\n\t\t\t\treturn;\r\n\t\t\t}\r\n\r\n\t\t\t// Agregar carácter normal\r\n\t\t\tif (key >= ' ' && key <= '~') {\r\n\t\t\t\tinputBuffer += key;\r\n\t\t\t\tprocess.stdout.write(key);\r\n\t\t\t}\r\n\t\t});\r\n\r\n\t\t// Manejo limpio de salida\r\n\t\tprocess.on('SIGINT', () => this._handleExit());\r\n\t\tprocess.on('SIGTERM', () => this._handleExit());\r\n\t}\r\n\r\n\t_showCommands() {\r\n\t\tconsole.log(\"📝 Comandos disponibles:\");\r\n\t\tconsole.log(\"   play, start          - Iniciar metrónomo\");\r\n\t\tconsole.log(\"   stop                 - Detener metrónomo\");\r\n\t\tconsole.log(\"   bpm [valor]          - Cambiar tempo (20-218)\");\r\n\t\tconsole.log(\"   tempo [valor]        - Alias para bpm\");\r\n\t\tconsole.log(\"   div [valor]          - Cambiar división (1-16)\");\r\n\t\tconsole.log(\"   division [valor]     - Alias para div\");\r\n\t\tconsole.log(\"   vol [valor]          - Cambiar volumen (0-100)\");\r\n\t\tconsole.log(\"   volume [valor]       - Alias para vol\");\r\n\t\tconsole.log(\"   status               - Mostrar estado actual\");\r\n\t\tconsole.log(\"   help, ?              - Mostrar ayuda\");\r\n\t\tconsole.log(\"   clear                - Limpiar pantalla\");\r\n\t\tconsole.log(\"   exit, quit           - Salir del programa\");\r\n\t\tconsole.log();\r\n\t}\r\n\r\n\t_showPrompt() {\r\n\t\tconst status = this._core._is_playing ? '▶️' : '⏹️';\r\n\t\tprocess.stdout.write(`${status} ethnik> `);\r\n\t}\r\n\r\n\t_processCommand(input) {\r\n\t\tconst parts = input.toLowerCase().split(' ');\r\n\t\tconst command = parts[0];\r\n\t\tconst args = parts.slice(1);\r\n\r\n\t\tconsole.log(); // Nueva línea después del comando\r\n\r\n\t\tswitch(command) {\r\n\t\t\tcase 'play':\r\n\t\t\tcase 'start':\r\n\t\t\t\tthis._core.play();\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'stop':\r\n\t\t\t\tthis._core.stop();\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'bpm':\r\n\t\t\tcase 'tempo':\r\n\t\t\t\tif (args.length > 0) {\r\n\t\t\t\t\tthis._core.setTempo(args[0]);\r\n\t\t\t\t} else {\r\n\t\t\t\t\tconsole.log(`💡 Uso: ${command} [valor]`);\r\n\t\t\t\t\tconsole.log(`   Ejemplo: ${command} 120`);\r\n\t\t\t\t}\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'div':\r\n\t\t\tcase 'division':\r\n\t\t\t\tif (args.length > 0) {\r\n\t\t\t\t\tthis._core.setDivision(args[0]);\r\n\t\t\t\t} else {\r\n\t\t\t\t\tconsole.log(`💡 Uso: ${command} [valor]`);\r\n\t\t\t\t\tconsole.log(`   Ejemplo: ${command} 4`);\r\n\t\t\t\t}\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'vol':\r\n\t\t\tcase 'volume':\r\n\t\t\t\tif (args.length > 0) {\r\n\t\t\t\t\tthis._core.setVolume(args[0]);\r\n\t\t\t\t} else {\r\n\t\t\t\t\tconsole.log(`💡 Uso: ${command} [valor]`);\r\n\t\t\t\t\tconsole.log(`   Ejemplo: ${command} 80`);\r\n\t\t\t\t}\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'status':\r\n\t\t\t\tthis._core.getStatus();\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'help':\r\n\t\t\tcase '?':\r\n\t\t\t\tthis._showCommands();\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'clear':\r\n\t\t\t\tconsole.clear();\r\n\t\t\t\tthis._core._initialize();\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tcase 'exit':\r\n\t\t\tcase 'quit':\r\n\t\t\t\tthis._handleExit();\r\n\t\t\t\tbreak;\r\n\r\n\t\t\tdefault:\r\n\t\t\t\tconsole.log(`❌ Comando desconocido: '${command}'`);\r\n\t\t\t\tconsole.log(\"💡 Escribe 'help' para ver los comandos disponibles\");\r\n\t\t}\r\n\r\n\t\tconsole.log();\r\n\t}\r\n\r\n\t_handleExit() {\r\n\t\tconsole.log('\\n\\n👋 Cerrando Ethnik Tools...');\r\n\t\tif (this._core._is_playing) {\r\n\t\t\tthis._core.stop();\r\n\t\t}\r\n\t\tprocess.exit(0);\r\n\t}\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConsoleManager);\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/ConsoleManager.js?");

/***/ }),

/***/ "./src/js/Ethnik/Core.js":
/*!*******************************!*\
  !*** ./src/js/Ethnik/Core.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Core: () => (/* binding */ Core)\n/* harmony export */ });\n/* harmony import */ var _Settings_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Settings.js */ \"./src/js/Ethnik/Settings.js\");\n/* harmony import */ var _ConsoleManager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ConsoleManager.js */ \"./src/js/Ethnik/ConsoleManager.js\");\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module 'child_process'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\n// Core.js - Sistema principal del metrónomo\r\n\r\n\r\n\r\n\r\n\r\nclass Core {\r\n\tconstructor() {\r\n\t\tthis._settings = new _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\r\n\t\tthis._console = new _ConsoleManager_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this);\r\n\r\n\t\tthis._is_playing = false;\r\n\t\tthis._bpm = _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmInitial;\r\n\t\tthis._division = _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.division;\r\n\t\tthis._volume = _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.volume;\r\n\r\n\t\t// Sistema de timing de alta precisión\r\n\t\tthis._nextTickTime = 0;\r\n\t\tthis._lookahead = 25.0; // ms - ventana de anticipación\r\n\t\tthis._scheduleAheadTime = 0.1; // s - tiempo de programación adelantada\r\n\t\tthis._timerWorker = null;\r\n\t\tthis._intervalID = null;\r\n\r\n\t\t// Control de drift temporal\r\n\t\tthis._startTime = 0;\r\n\t\tthis._tickCount = 0;\r\n\t\tthis._expectedNextTick = 0;\r\n\r\n\t\tthis._initialize();\r\n\t}\r\n\r\n\t_initialize() {\r\n\t\tconsole.clear();\r\n\t\tconsole.log(\"🎵 Ethnik Tools - Metrónomo de Alta Precisión\");\r\n\t\tconsole.log(\"=\".repeat(50));\r\n\t\tconsole.log(`Tempo inicial: ${this._bpm} BPM (${this._settings.getTempoName(this._bpm)})`);\r\n\t\tconsole.log(`División: ${this._getDivisionName(this._division)}`);\r\n\t\tconsole.log(`Volumen: ${this._volume}%`);\r\n\t\tconsole.log(\"=\".repeat(50));\r\n\t\tconsole.log();\r\n\t}\r\n\r\n\tplay() {\r\n\t\tif (this._is_playing) {\r\n\t\t\tconsole.log(\"⚠️  El metrónomo ya está en funcionamiento\");\r\n\t\t\treturn false;\r\n\t\t}\r\n\r\n\t\tthis._is_playing = true;\r\n\t\tthis._tickCount = 0;\r\n\t\tthis._startTime = Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).now();\r\n\t\tthis._nextTickTime = this._startTime;\r\n\r\n\t\tconsole.log(`▶️  Iniciando metrónomo: ${this._bpm} BPM - ${this._getDivisionName(this._division)}`);\r\n\t\tconsole.log(\"Presiona 'stop' para detener\\n\");\r\n\r\n\t\tthis._startScheduler();\r\n\t\treturn true;\r\n\t}\r\n\r\n\tstop() {\r\n\t\tif (!this._is_playing) {\r\n\t\t\tconsole.log(\"⚠️  El metrónomo no está funcionando\");\r\n\t\t\treturn false;\r\n\t\t}\r\n\r\n\t\tthis._is_playing = false;\r\n\r\n\t\tif (this._intervalID) {\r\n\t\t\tclearInterval(this._intervalID);\r\n\t\t\tthis._intervalID = null;\r\n\t\t}\r\n\r\n\t\tconst totalTime = (Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).now() - this._startTime) / 1000;\r\n\t\tconst expectedTicks = Math.floor(totalTime * (this._bpm / 60) * this._division);\r\n\t\tconst accuracy = ((this._tickCount / expectedTicks) * 100).toFixed(2);\r\n\r\n\t\tconsole.log(`\\n⏹️  Metrónomo detenido`);\r\n\t\tconsole.log(`📊 Estadísticas: ${this._tickCount} tics en ${totalTime.toFixed(2)}s`);\r\n\t\tconsole.log(`🎯 Precisión: ${accuracy}%\\n`);\r\n\t\treturn true;\r\n\t}\r\n\r\n\tsetTempo(newTempo) {\r\n\t\tconst tempo = parseInt(newTempo);\r\n\r\n\t\tif (isNaN(tempo) || tempo < _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmMin || tempo > _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmMax) {\r\n\t\t\tconsole.log(`❌ BPM inválido. Rango válido: ${_Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmMin}-${_Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmMax}`);\r\n\t\t\treturn false;\r\n\t\t}\r\n\r\n\t\tconst wasPlaying = this._is_playing;\r\n\t\tif (wasPlaying) this.stop();\r\n\r\n\t\tthis._bpm = tempo;\r\n\t\tconsole.log(`🎼 Tempo cambiado: ${this._bpm} BPM (${this._settings.getTempoName(this._bpm)})`);\r\n\r\n\t\tif (wasPlaying) {\r\n\t\t\tsetTimeout(() => this.play(), 100); // Pequeña pausa para evitar clicks\r\n\t\t}\r\n\t\treturn true;\r\n\t}\r\n\r\n\tsetDivision(division) {\r\n\t\tconst div = parseInt(division);\r\n\r\n\t\tif (isNaN(div) || div < 1 || div > 16) {\r\n\t\t\tconsole.log(\"❌ División inválida. Rango válido: 1-16\");\r\n\t\t\treturn false;\r\n\t\t}\r\n\r\n\t\tconst wasPlaying = this._is_playing;\r\n\t\tif (wasPlaying) this.stop();\r\n\r\n\t\tthis._division = div;\r\n\t\tconsole.log(`📏 División cambiada: ${this._getDivisionName(this._division)}`);\r\n\r\n\t\tif (wasPlaying) {\r\n\t\t\tsetTimeout(() => this.play(), 100);\r\n\t\t}\r\n\t\treturn true;\r\n\t}\r\n\r\n\tsetVolume(volume) {\r\n\t\tconst vol = parseInt(volume);\r\n\r\n\t\tif (isNaN(vol) || vol < 0 || vol > 100) {\r\n\t\t\tconsole.log(\"❌ Volumen inválido. Rango válido: 0-100\");\r\n\t\t\treturn false;\r\n\t\t}\r\n\r\n\t\tthis._volume = vol;\r\n\t\tconsole.log(`🔊 Volumen cambiado: ${this._volume}%`);\r\n\t\treturn true;\r\n\t}\r\n\r\n\tgetStatus() {\r\n\t\tconsole.log(\"\\n📋 Estado actual:\");\r\n\t\tconsole.log(`   Estado: ${this._is_playing ? '▶️ Reproduciendo' : '⏹️ Detenido'}`);\r\n\t\tconsole.log(`   Tempo: ${this._bpm} BPM (${this._settings.getTempoName(this._bpm)})`);\r\n\t\tconsole.log(`   División: ${this._getDivisionName(this._division)}`);\r\n\t\tconsole.log(`   Volumen: ${this._volume}%`);\r\n\t\tif (this._is_playing) {\r\n\t\t\tconst runTime = ((Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).now() - this._startTime) / 1000).toFixed(1);\r\n\t\t\tconsole.log(`   Tiempo ejecutándose: ${runTime}s`);\r\n\t\t\tconsole.log(`   Tics reproducidos: ${this._tickCount}`);\r\n\t\t}\r\n\t\tconsole.log();\r\n\t}\r\n\r\n\t// Sistema de programación de alta precisión\r\n\t_startScheduler() {\r\n\t\t// Scheduler principal - verifica cada 25ms\r\n\t\tthis._intervalID = setInterval(() => {\r\n\t\t\tthis._scheduler();\r\n\t\t}, this._lookahead);\r\n\t}\r\n\r\n\t_scheduler() {\r\n\t\tconst currentTime = Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).now();\r\n\r\n\t\t// Programar todos los tics que caen dentro de la ventana de anticipación\r\n\t\twhile (this._nextTickTime < currentTime + this._lookahead) {\r\n\t\t\tthis._scheduleTick(this._nextTickTime);\r\n\t\t\tthis._nextTickTime += this._calculateInterval();\r\n\t\t}\r\n\t}\r\n\r\n\t_scheduleTick(time) {\r\n\t\tconst delay = Math.max(0, time - Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).now());\r\n\r\n\t\tsetTimeout(() => {\r\n\t\t\tif (this._is_playing) {\r\n\t\t\t\tthis._playTick();\r\n\t\t\t}\r\n\t\t}, delay);\r\n\t}\r\n\r\n\t_playTick() {\r\n\t\tthis._tickCount++;\r\n\r\n\t\t// Reproducir sonido usando sistema del OS para máxima precisión\r\n\t\tthis._playSystemSound();\r\n\r\n\t\t// Feedback visual en consola\r\n\t\tthis._renderTick();\r\n\r\n\t\t// Detección de drift temporal\r\n\t\tthis._checkTiming();\r\n\t}\r\n\r\n\t_playSystemSound() {\r\n\t\t// Usar el comando del sistema para reproducir audio de forma precisa\r\n\t\t// En Linux/Mac: aplay, afplay\r\n\t\t// En Windows: powershell\r\n\t\ttry {\r\n\t\t\tif (process.platform === 'win32') {\r\n\t\t\t\t// Windows - usar beep del sistema\r\n\t\t\t\tObject(function webpackMissingModule() { var e = new Error(\"Cannot find module 'child_process'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())('powershell', ['-c', '[Console]::Beep(800, 100)'], {\r\n\t\t\t\t\tstdio: 'ignore',\r\n\t\t\t\t\tdetached: true\r\n\t\t\t\t});\r\n\t\t\t} else if (process.platform === 'darwin') {\r\n\t\t\t\t// macOS - usar afplay con archivo de sonido o beep\r\n\t\t\t\tObject(function webpackMissingModule() { var e = new Error(\"Cannot find module 'child_process'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())('osascript', ['-e', 'beep'], {\r\n\t\t\t\t\tstdio: 'ignore',\r\n\t\t\t\t\tdetached: true\r\n\t\t\t\t});\r\n\t\t\t} else {\r\n\t\t\t\t// Linux - usar beep o speaker-test\r\n\t\t\t\tObject(function webpackMissingModule() { var e = new Error(\"Cannot find module 'child_process'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())('speaker-test', ['-t', 'sine', '-f', '800', '-l', '1', '-s', '1'], {\r\n\t\t\t\t\tstdio: 'ignore',\r\n\t\t\t\t\tdetached: true\r\n\t\t\t\t});\r\n\t\t\t}\r\n\t\t} catch (error) {\r\n\t\t\t// Fallback a caracteres de terminal como feedback\r\n\t\t\tprocess.stdout.write('♪');\r\n\t\t}\r\n\t}\r\n\r\n\t_renderTick() {\r\n\t\tconst beatInMeasure = (this._tickCount - 1) % (4 * this._division) + 1;\r\n\t\tconst isDownbeat = beatInMeasure === 1;\r\n\r\n\t\tif (isDownbeat) {\r\n\t\t\tprocess.stdout.write('\\n🔴 '); // Downbeat\r\n\t\t} else if (beatInMeasure % this._division === 1) {\r\n\t\t\tprocess.stdout.write('🔵 '); // Beat principal\r\n\t\t} else {\r\n\t\t\tprocess.stdout.write('⚪ '); // Subdivisión\r\n\t\t}\r\n\r\n\t\t// Mostrar contador cada 16 tics\r\n\t\tif (this._tickCount % 16 === 0) {\r\n\t\t\tprocess.stdout.write(` [${this._tickCount}]`);\r\n\t\t}\r\n\t}\r\n\r\n\t_checkTiming() {\r\n\t\tconst expectedTime = this._startTime + (this._tickCount * this._calculateInterval());\r\n\t\tconst actualTime = Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'perf_hooks'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).now();\r\n\t\tconst drift = actualTime - expectedTime;\r\n\r\n\t\t// Si hay más de 5ms de drift, advertir\r\n\t\tif (Math.abs(drift) > 5) {\r\n\t\t\tprocess.stdout.write(` ⚠️(${drift.toFixed(1)}ms) `);\r\n\t\t}\r\n\t}\r\n\r\n\t_calculateInterval() {\r\n\t\t// Intervalo base en milisegundos\r\n\t\tconst baseInterval = (60000 / this._bpm);\r\n\t\t// Aplicar división (1 = negras, 2 = corcheas, 4 = semicorcheas, etc.)\r\n\t\treturn baseInterval / this._division;\r\n\t}\r\n\r\n\t_getDivisionName(division) {\r\n\t\tconst names = {\r\n\t\t\t1: \"Negras (1/4)\",\r\n\t\t\t2: \"Corcheas (1/8)\",\r\n\t\t\t3: \"Tresillos de corchea\",\r\n\t\t\t4: \"Semicorcheas (1/16)\",\r\n\t\t\t6: \"Seisillo\",\r\n\t\t\t8: \"Fusas (1/32)\"\r\n\t\t};\r\n\t\treturn names[division] || `División ${division}`;\r\n\t}\r\n}\r\n\r\n\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/Core.js?");

/***/ }),

/***/ "./src/js/Ethnik/Settings.js":
/*!***********************************!*\
  !*** ./src/js/Ethnik/Settings.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\r\n\r\n\r\nclass Settings {\r\n\r\n\t\r\n\t/**\r\n\t * Predefined preset parameters\r\n\t * @type {{volume: number, bpmMax: number, bpmInitial: number, bpmMin: number, soundFile: string}}\r\n\t */\r\n\tstatic defaultParams = {\r\n\r\n\t\tbpmMin: \t\t20,\r\n\t\tbpmMax: \t\t218,\r\n\t\tbpmInitial: \t100,\r\n\t\tdivision:\t\t1,\r\n\t\tvolume: \t\t70,\r\n\t\tsoundFile: \t\t'./defaultAssets/sounds/rhythmHelper_classic_sound.ogg'\r\n\t}\r\n\r\n\r\n\t/**\r\n\t * Declares the min and max limits for each traditional tempo names\r\n\t * @type {{larghissimo: number[], lento: number[], moderato: number[], andante: number[], prestissimo: number[], allegretto: number[], allegro: number[], largo: number[], vivace: number[], adagio: number[], presto: number[]}}\r\n\t * @private\r\n\t */\r\n\tstatic tempoNames = {\r\n\r\n\t\tlarghissimo: \t[20, 39],\r\n\t\tlargo:\t\t[40, 59],\r\n\t\tlento:\t\t[60, 67],\r\n\t\tadagio:\t\t[68, 79],\r\n\t\tandante:\t\t[80, 99],\r\n\t\tmoderato:\t\t[100, 111],\r\n\t\tallegretto:\t\t[112, 127],\r\n\t\tallegro:\t\t[128, 159],\r\n\t\tvivace:\t\t[160, 169],\r\n\t\tpresto:\t\t[170, 199],\r\n\t\tprestissimo:\t[200, 218]\r\n\t}\r\n\r\n\r\n\t/**\r\n\t * \r\n\t * @returns \r\n\t */\r\n\tstatic getTempoList() {\r\n\r\n\t\treturn Settings.tempoNames;\r\n\t}\r\n\r\n\r\n\tstatic getTempoName(bpm) {\r\n\r\n\t\tfor (const _k in Settings.tempoNames) {\r\n\r\n\t\t\tif (bpm >= Settings.tempoNames[_k][0] && bpm <= Settings.tempoNames[_k][1]) {\r\n\r\n\t\t\t\treturn _k;\r\n\t\t\t}\r\n\t\t}\r\n\t}\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Settings);\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/Settings.js?");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Ethnik_Core_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Ethnik/Core.js */ \"./src/js/Ethnik/Core.js\");\n\r\n\r\n\r\n\r\n// process.stdin.setEncoding('utf8');\r\n// process.stdin.setRawMode(true);\r\n\r\n\r\nconst app = new _Ethnik_Core_js__WEBPACK_IMPORTED_MODULE_0__.Core();\n\n//# sourceURL=webpack://ethnik/./src/js/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/main.js");
/******/ 	
/******/ })()
;