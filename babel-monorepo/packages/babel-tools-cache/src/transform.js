/**
 * Transform implementation for babel-tools-cache
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
