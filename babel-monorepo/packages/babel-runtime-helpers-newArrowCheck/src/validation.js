/**
 * Validation for babel-runtime-helpers-newArrowCheck
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
