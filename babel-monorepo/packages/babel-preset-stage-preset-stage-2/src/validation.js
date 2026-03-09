/**
 * Validation for babel-preset-stage-preset-stage-2
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
