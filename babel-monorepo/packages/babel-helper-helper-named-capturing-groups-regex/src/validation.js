/**
 * Validation for babel-helper-helper-named-capturing-groups-regex
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
