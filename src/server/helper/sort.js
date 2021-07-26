
module.exports = {};

/**
 * Sorts the array by string comparison
 * @param { any[] } arr
 * @param {(input: any) => string} map
 * @returns {any[]} The sorted array
 */
function sortByStringField(arr, map, toLowerCase=true) {
  let s1, s2;
  if (!Array.isArray(arr)) return arr;
  return arr.sort((elt1, elt2) => {
    s1 = map(elt1);
    s2 = map(elt2);
    if (toLowerCase) {
      s1 = s1?.toLowerCase();
      s2 = s2?.toLowerCase();
    }
    if (s1 > s2) return 1;
    if (s1 < s2) return -1;
    return 0;
  })
}
module.exports.sortByStringField = sortByStringField;
