"use strict";

/**
 * Unlike if(item), this function only checks for undefined. Falsy values
 * like `null`, `''`, `0`, `NaN` and `false` will still return true.
 *
 * @param {any} item item to check
 * @returns {Boolean} true or false
 */
function isNotDefined(item) {
  if (typeof item === "undefined") {
    return true;
  }
  return false;
}

module.exports = {
  isNotDefined,
};
