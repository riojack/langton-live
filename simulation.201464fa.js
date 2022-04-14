/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/***/ ((module) => {

eval("const EAST = 'EAST',\n  WEST = 'WEST',\n  NORTH = 'NORTH',\n  SOUTH = 'SOUTH';\n\nconst PRELUDE = `var grid = arguments[0];\nvar antDirection = arguments[1];\nvar dx = arguments[2];\nvar dy = arguments[3];\nvar antx = arguments[4];\nvar anty = arguments[5];\nvar TURN_LEFT = arguments[6][antDirection];\nvar TURN_RIGHT = arguments[7][antDirection];\nvar FORWARD = { next: antDirection, dy: dy, dx: dx};\nvar STAND_STILL = { next: antDirection, dy: 0, dx: 0};\nvar TURN_AROUND = arguments[6][TURN_LEFT.next];\nvar cell = grid[anty][antx];\nvar NEXT_LETTER = String.fromCharCode(cell.charCodeAt(0) + 1);\n\nfunction cellIsOneOf(cell, letters) {\n  return letters.indexOf(cell) >= 0;\n}\n\nfunction flipToLetter(letter) { grid[anty][antx] = letter; }\n\n`;\n\nconst STARTING_BODY = `if (cell === 'A') {\n  flipToLetter('B');\n  return TURN_LEFT;\n}\nelse {\n  flipToLetter('A');\n  return TURN_RIGHT;\n}`;\n\nmodule.exports = {\n  EAST, WEST, NORTH, SOUTH,\n  PRELUDE, STARTING_BODY\n}\n\n\n//# sourceURL=webpack://langtons-ant/./src/constants.js?");

/***/ }),

/***/ "./src/logic.js":
/*!**********************!*\
  !*** ./src/logic.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const { EAST, WEST, SOUTH, NORTH } = __webpack_require__(/*! ./constants */ \"./src/constants.js\");\n\nconst TURN_RIGHT = {\n  [EAST]: { next: SOUTH, dy: 1, dx: 0 },\n  [SOUTH]: { next: WEST, dy: 0, dx: -1 },\n  [WEST]: { next: NORTH, dy: -1, dx: 0 },\n  [NORTH]: { next: EAST, dy: 0, dx: 1 },\n};\n\nconst TURN_LEFT = {\n  [EAST]: { next: NORTH, dy: -1, dx: 0 },\n  [SOUTH]: { next: EAST, dy: 0, dx: 1 },\n  [WEST]: { next: SOUTH, dy: 1, dx: 0 },\n  [NORTH]: { next: WEST, dy: 0, dx: -1 },\n};\n\nfunction beLikeAnAnt(grid, antDirection, dx, dy, antx, anty, funct) {\n  const nextPos = funct(grid, antDirection, dx, dy, antx, anty, TURN_LEFT, TURN_RIGHT);\n\n  return {\n    grid: grid,\n    antDirection: nextPos.next,\n    dx: nextPos.dx,\n    dy: nextPos.dy,\n    antx: antx + nextPos.dx,\n    anty: anty + nextPos.dy\n  };\n}\n\nmodule.exports = {\n  beLikeAnAnt: beLikeAnAnt\n}\n\n\n//# sourceURL=webpack://langtons-ant/./src/logic.js?");

/***/ }),

/***/ "./src/rasterizer.js":
/*!***************************!*\
  !*** ./src/rasterizer.js ***!
  \***************************/
/***/ ((module) => {

eval("const CANVAS_WIDTH = 1000;\nconst CANVAS_HEIGHT = 800;\nconst PIXEL_SCALE = 2;\n\nCOLOR_CHAR_MAP = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((map, char) => {\n  return {\n    ...map,\n    [char]: [\n      Math.floor(255 * Math.random()),\n      Math.floor(255 * Math.random()),\n      Math.floor(255 * Math.random()),\n      255\n    ]\n  }\n}, {});\n\nfunction rasterizeOne(cellColor, x, y, ctx) {\n  const idata = ctx.createImageData(PIXEL_SCALE, PIXEL_SCALE);\n\n  let color = [255, 55, 65, 255];\n\n  if (COLOR_CHAR_MAP[cellColor]) {\n    color = COLOR_CHAR_MAP[cellColor];\n  }\n\n  const byte_count = 4 * PIXEL_SCALE * PIXEL_SCALE;\n  let byte = 0;\n\n  while (byte < byte_count) {\n    idata.data[byte + 0] = color[0];\n    idata.data[byte + 1] = color[1];\n    idata.data[byte + 2] = color[2];\n    idata.data[byte + 3] = color[3];\n    byte += 4;\n  }\n\n  ctx.putImageData(idata, (x * PIXEL_SCALE), (y * PIXEL_SCALE));\n}\n\nmodule.exports = {\n  rasterize: () => {\n  },\n  rasterizeOne: rasterizeOne,\n  CANVAS_WIDTH: CANVAS_WIDTH,\n  CANVAS_HEIGHT: CANVAS_HEIGHT,\n  PIXEL_SCALE: PIXEL_SCALE,\n};\n\n\n//# sourceURL=webpack://langtons-ant/./src/rasterizer.js?");

/***/ }),

/***/ "./src/simulation.js":
/*!***************************!*\
  !*** ./src/simulation.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const { PRELUDE, STARTING_BODY, SOUTH } = __webpack_require__(/*! ./constants */ \"./src/constants.js\");\nconst { rasterizeOne, CANVAS_HEIGHT, CANVAS_WIDTH } = __webpack_require__(/*! ./rasterizer */ \"./src/rasterizer.js\");\nconst { beLikeAnAnt } = __webpack_require__(/*! ./logic */ \"./src/logic.js\");\n\nlet batchSize = 165;\nlet simTimer;\nfunction doSimulation(ctx, funct) {\n  let grid = (Array(CANVAS_HEIGHT).fill()).map(() => Array(CANVAS_WIDTH).fill('A')),\n    dx = 0,\n    dy = 0,\n    antx = (CANVAS_WIDTH / 4.0),\n    anty = (CANVAS_HEIGHT / 4.0),\n    direction = SOUTH;\n\n  rasterizeOne(grid[antx][anty], antx, anty, ctx);\n  clearInterval(simTimer);\n\n  simTimer = setInterval(() => {\n    let j = 0;\n    while (j < batchSize) {\n      const nextStage = beLikeAnAnt(grid, direction, dx, dy, antx, anty, funct);\n\n      grid = nextStage.grid;\n      dx = nextStage.dx;\n      dy = nextStage.dy;\n      antx = nextStage.antx;\n      anty = nextStage.anty;\n      direction = nextStage.antDirection;\n\n      if (antx < 0 || antx >= CANVAS_WIDTH || anty < 0 || anty >= CANVAS_HEIGHT) {\n        clearInterval(simTimer);\n        return;\n      }\n\n      rasterizeOne(grid[anty][antx], antx, anty, ctx);\n      j++;\n    }\n  }, 1);\n}\n\n(function () {\n  const canvas = document.getElementById('langtons-world');\n  canvas.height = CANVAS_HEIGHT;\n  canvas.width = CANVAS_WIDTH;\n\n  const ctx = canvas.getContext('2d');\n  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);\n  ctx.mozImageSmoothingEnabled = false;\n  ctx.webkitImageSmoothingEnabled = false;\n  ctx.msImageSmoothingEnabled = false;\n  ctx.imageSmoothingEnabled = false;\n\n  const codeField = document.getElementById('langtons-brain');\n  codeField.value = STARTING_BODY;\n\n  const goButton = document.getElementById('turn-on-langtons-brain');\n  goButton.onclick = () => {\n    const codeBody = document.getElementById('langtons-brain').value;\n    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);\n\n    try {\n      const funct = new Function(PRELUDE + codeBody);\n      doSimulation(ctx, funct);\n    } catch (e) {\n      alert('Oops!\\n\\n' +\n        'There was an error in the code.\\n\\n' +\n        'Did you type all the symbols, letters, and numbers correctly?');\n    }\n  };\n\n  goButton.ontouchstart = goButton.onclick;\n\n  const stopBtn = document.getElementById('turn-off-langtons-brain');\n  stopBtn.onclick = () => {\n    clearInterval(simTimer);\n  };\n\n  const currentSpeed = document.getElementById('current-speed');\n  currentSpeed.textContent = 'Speed: ' + batchSize;\n\n  const speedSlider = document.getElementById('speed-slider');\n  speedSlider.value = batchSize;\n  speedSlider.oninput = (e) => {\n    batchSize = +(e.target.value);\n    currentSpeed.textContent = 'Speed: ' + batchSize;\n  };\n})();\n\n\n//# sourceURL=webpack://langtons-ant/./src/simulation.js?");

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/simulation.js");
/******/ 	
/******/ })()
;