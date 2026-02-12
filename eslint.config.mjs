import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", ".netlify/**", "reports/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["error", { args: "none" }],
    },
  },
];
