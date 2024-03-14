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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\n\nclass ConsoleManager {\n\n\n\tconstructor() {\n\n\t}\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConsoleManager);\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/ConsoleManager.js?");

/***/ }),

/***/ "./src/js/Ethnik/Core.js":
/*!*******************************!*\
  !*** ./src/js/Ethnik/Core.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _Settings_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Settings.js */ \"./src/js/Ethnik/Settings.js\");\n/* harmony import */ var _DomManager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DomManager.js */ \"./src/js/Ethnik/DomManager.js\");\n/* harmony import */ var _ConsoleManager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ConsoleManager.js */ \"./src/js/Ethnik/ConsoleManager.js\");\n\n\n\n\n\nclass Core {\n\n\n\tconstructor() {\n\n\t\tthis._settings = new _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n\t\tthis._console = new _ConsoleManager_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n\t\tthis._dom = new _DomManager_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n\n\t\tthis._is_valid_settings = false;\n\t\tthis._is_playing = false;\n\n\t\tthis._intervalFnc = null;\n\n\t\tthis._bpm = 0;\n\t\tthis._division = 0;\n\t\tthis._volume = 0;\n\n\t\tthis._initialize();\n\t}\n\n\n\tplay() {\n\n\t\tif (!this._is_valid_settings) {\n\t\t\treturn false;\n\t\t}\n\n\t\tthis._is_playing = true;\n\t\tthis._intervalFnc = this._setTimeLapse(this._bpm);\n\t}\n\n\n\tstop() {\n\n\t\tthis._is_playing = false;\n\t\tclearInterval(this._intervalFnc);\n\t}\n\n\n\tsetTempo(newTempo) {\n\n\t\tif (newTempo < _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmMin || newTempo > _Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmMax) {\n\t\t\treturn false;\n\t\t}\n\n\t\tthis._bpm = newTempo;\nconsole.log('The Bpm is: ', this._settings.getTempoName(this._bpm) + ' [' + this._bpm + 'bpm]');\n\t}\n\n\n\tsetDivision(division) {\n\n\t\tif (division < 0 || division > 16) {\n\t\t\treturn false;\n\t\t}\n\n\t\tthis._division = division;\n\nconsole.log('The pulse subdivision is: ', this._division);\n\n\t}\n\n\n\ttempoList() {\n\t\tconsole.log('hola');\n\t\treturn this._settings.getTempoList();\n\t}\n\n\n\tsavePreset() {\n\n\n\t}\n\n\n\tloadPreset() {\n\n\n\t}\n\n\n\treload() {\n\n\n\t}\n\n\n\tdefaultPreset() {\n\n\n\t}\n\n\n\texit() {\n\n\n\t}\n\n\n\t_initialize() {\n\nconsole.log('Welcome to Ethnik Tools');\n\n\t\tthis.setTempo(_Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.bpmInitial);\n\t\tthis.setDivision(_Settings_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].defaultParams.division);\n\t\tthis._is_valid_settings = true;\n\t}\n\n\n\t_setTimeLapse(bpm) {\n\n\t\tconst _this = this;\n\t\tconst _bpmToMs = (60000 / bpm) * this._division;\n\n\t\treturn setInterval(function () { _this._playSound(); }, _bpmToMs);\n\t}\n\n\n\t_setEvents() {\n\n\n\t}\n\n\n\t_on_play_click() {\n\n\n\t}\n\n\n\t_on_stop_click() {\n\n\n\t}\n\n\n\t_on_bpm_selector_click() {\n\n\n\t}\n\n\n\t_render() {\n\n\t\tthis._dom.render(this._bpm, this._settings.getTempoName(this._bpm));\n\t}\n\n\n\t_playSound() {\n\n\t\tconsole.log('.');\n\t}\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Core);\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/Core.js?");

/***/ }),

/***/ "./src/js/Ethnik/DomManager.js":
/*!*************************************!*\
  !*** ./src/js/Ethnik/DomManager.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\n\nclass DomManager {\n\n\n\tconstructor() {\n\n\t\tthis._$elements = {\n\n\t\t\tparentCnt: \t\t\tnull,\n\t\t\tplayBtn: \t\t\tnull,\n\t\t\tstopBtn: \t\t\tnull,\n\t\t\tbpmSelector: \t\tnull,\n\t\t\tvolumeSelector: \tnull\n\t\t}\n\n\t\tthis._init();\n\t}\n\n\n\t_init() {\n\n\t\tthis._getElements();\n\t}\n\n\n\t_getElements() {\n\n\n\t}\n\n\n\trender() {\n\n\t}\n\n\n\trefresh() {\n\n\t}\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DomManager);\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/DomManager.js?");

/***/ }),

/***/ "./src/js/Ethnik/Settings.js":
/*!***********************************!*\
  !*** ./src/js/Ethnik/Settings.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\nclass Settings {\n\n\t/**\n\t * Predefined preset parameters\n\t * @type {{volume: number, bpmMax: number, bpmInitial: number, bpmMin: number, soundFile: string}}\n\t */\n\tstatic defaultParams = {\n\n\t\tbpmMin: \t\t20,\n\t\tbpmMax: \t\t218,\n\t\tbpmInitial: \t100,\n\t\tdivision:\t\t1,\n\t\tvolume: \t\t70,\n\t\tsoundFile: \t\t'./defaultAssets/sounds/rhythmHelper_classic_sound.ogg'\n\t}\n\n\n\t/**\n\t * Declares the min and max limits for each traditional tempo names\n\t * @type {{larghissimo: number[], lento: number[], moderato: number[], andante: number[], prestissimo: number[], allegretto: number[], allegro: number[], largo: number[], vivace: number[], adagio: number[], presto: number[]}}\n\t * @private\n\t */\n\tstatic tempoNames = {\n\n\t\tlarghissimo: \t[20, 39],\n\t\tlargo:\t\t\t[40, 59],\n\t\tlento:\t\t\t[60, 67],\n\t\tadagio:\t\t\t[68, 79],\n\t\tandante:\t\t[80, 99],\n\t\tmoderato:\t\t[100, 111],\n\t\tallegretto:\t\t[112, 127],\n\t\tallegro:\t\t[128, 159],\n\t\tvivace:\t\t\t[160, 169],\n\t\tpresto:\t\t\t[170, 199],\n\t\tprestissimo:\t[200, 218]\n\t}\n\n\n\tgetTempoList() {\n\n\t\treturn Settings.tempoNames;\n\t}\n\n\n\tgetTempoName(bpm) {\n\n\t\tfor (const _k in Settings.tempoNames) {\n\n\t\t\tif (bpm >= Settings.tempoNames[_k][0] && bpm <= Settings.tempoNames[_k][1]) {\n\n\t\t\t\treturn _k;\n\t\t\t}\n\t\t}\n\t}\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Settings);\n\n//# sourceURL=webpack://ethnik/./src/js/Ethnik/Settings.js?");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Ethnik_Core_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Ethnik/Core.js */ \"./src/js/Ethnik/Core.js\");\n\n\n\nlet app = new _Ethnik_Core_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n\n\n//# sourceURL=webpack://ethnik/./src/js/main.js?");

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