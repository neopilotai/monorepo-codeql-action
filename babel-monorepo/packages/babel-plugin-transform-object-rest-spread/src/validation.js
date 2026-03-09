/**
 * Validation for babel-plugin-transform-object-rest-spread
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
