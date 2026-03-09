/**
 * Validation for babel-preset-stage-preset-stage-1
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
