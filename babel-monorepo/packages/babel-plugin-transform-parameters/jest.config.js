module.exports = {
  "testEnvironment": "node",
  "testMatch": [
    "**/__tests__/**/*.js"
  ],
  "transform": {
    "^.+\\.jsx?$": "babel-jest"
  },
  "moduleNameMapper": {
    "^@babel/(.*)$": "<rootDir>/../babel-$1/src"
  }
}