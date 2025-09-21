import js from "@eslint/js";

export default [
  {
    ignores: ["www/lib/**", "test/**"],
  },
  js.configs.recommended,
  {
    files: ["www/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        cordova: "readonly",
        device: "readonly",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "no-console": "off",
    },
  },
];
