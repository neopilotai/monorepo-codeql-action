/**
 * Validation for babel-plugin-transform-arrow-functions
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
