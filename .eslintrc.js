module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "mocha": true,
  },
  "extends": "airbnb-base",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  "rules": {
    "allowAfterThis": true,
    "consistent-return": 0,
    "import/no-unresolved": 0,
    "import/no-extraneous-dependencies": 0,
    "max-len": ["error", {
      "code": 120,
      "ignoreComments": true,
      "ignoreStrings": true
    }],
    "no-console": 0,
    "no-param-reassign": 0,
    "no-shadow": 0,
    "no-unused-vars": 0,
    "prefer-destructuring": 0,
    "linebreak-style": 0,
    "class-methods-use-this": 0,
  }
};
