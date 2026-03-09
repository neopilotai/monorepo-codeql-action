/**
 * Validation for babel-preset-env-preset-plugin-cc
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
