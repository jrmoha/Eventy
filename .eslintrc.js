module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": 0,
    semi: ["error", "always"],
    // quotes: ["error", "double"],
    "no-console": 0,
    "no-var": "error",
    "prefer-const": "error",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
};
