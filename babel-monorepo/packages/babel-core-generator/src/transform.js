/**
 * Transform implementation for babel-core-generator
 */

export function transform(code, options = {}) {
  return {
    code,
    map: null,
    ast: null
  };
}

export function transformFromAst(ast, code, options = {}) {
  return transform(code, options);
}
