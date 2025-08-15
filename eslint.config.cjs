module.exports = [
  {
    // Apply to TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.eslint.json" // changed to dedicated eslint tsconfig
      }
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react")
    },
    settings: { react: { version: "detect" } },
    rules: { "no-console": "off" },
    ignores: ["node_modules/**", "dist/**"]
  },
  {
    // Basic JS rules (optional)
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: { "no-console": "off" },
    ignores: ["node_modules/**", "dist/**"]
  }
];