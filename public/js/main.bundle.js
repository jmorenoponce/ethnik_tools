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

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _rhythmHelper_Core_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rhythmHelper/Core.js */ \"./src/js/rhythmHelper/Core.js\");\n\n\n\nlet myRhythmHelper = new _rhythmHelper_Core_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n\nmyRhythmHelper.init();\n\n//# sourceURL=webpack://mybestmetronome/./src/js/main.js?");

/***/ }),

/***/ "./src/js/rhythmHelper/Config.js":
/*!***************************************!*\
  !*** ./src/js/rhythmHelper/Config.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\nclass Config {\n\n\n\tstatic params = {\n\n\t\tmaxBpm: 218,\n\t\tminBpm: 20,\n\t\tinitialBpm: 100,\n\t}\n\n\tconstructor() {\n\n\n\t}\n\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Config);\n\n//# sourceURL=webpack://mybestmetronome/./src/js/rhythmHelper/Config.js?");

/***/ }),

/***/ "./src/js/rhythmHelper/Core.js":
/*!*************************************!*\
  !*** ./src/js/rhythmHelper/Core.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _Config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Config.js */ \"./src/js/rhythmHelper/Config.js\");\n/* harmony import */ var _DomManager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DomManager.js */ \"./src/js/rhythmHelper/DomManager.js\");\n\n\n\n\nclass Core {\n\n\tstatic _pulseNames = {\n\t\t//\n\t}\n\n\n\tconstructor() {\n\n\t\tthis._config = new _Config_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n\t\tthis._dom = new _DomManager_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n\n\t\t// this.actualBpm = this._config.params.initialBpm;\n\n\t\tthis.init();\n\t}\n\n\tinit() {\n\n\n\t\tthis.bpm = 0;\n\n\t\tconsole.log('The Core is initialized');\n\n\t\tconsole.log(this._config)\n\t\tconsole.log(this._dom);\n\t}\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Core);\n\n//# sourceURL=webpack://mybestmetronome/./src/js/rhythmHelper/Core.js?");

/***/ }),

/***/ "./src/js/rhythmHelper/DomManager.js":
/*!*******************************************!*\
  !*** ./src/js/rhythmHelper/DomManager.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n\nclass DomManager {\n\n\n\tconstructor() {\n\n\t\tthis.init();\n\t}\n\n\n\t_init() {\n\n\t\tconsole.log('The Dom is initialized')\n\t}\n\n\n\tinit() {\n\n\t\tthis._init();\n\t}\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DomManager);\n\n//# sourceURL=webpack://mybestmetronome/./src/js/rhythmHelper/DomManager.js?");

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