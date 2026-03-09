/**
 * Validation for babel-plugin-transform-modules-commonjs
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
