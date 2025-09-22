// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 1. Global ignores
  {
    ignores: ["dist", "build", ".vite", "node_modules", "public"],
  },

  // 2. Main configuration for all JS/JSX files
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
        process: "readonly", // For process.env.VITE_...
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
          moduleDirectory: ["node_modules", "src"],
        },
      },
    },
    rules: {
      // Base recommended rules
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      "import/no-unresolved": "off", // Handled by Vite aliases

      // --- React & JSX Rules (Trello Project Specific) ---
      "react/prop-types": "off", // This is a JavaScript project, not TypeScript
      "react/react-in-jsx-scope": "off", // Not needed with modern React/Vite
      "react/jsx-key": ["error", { checkFragmentShorthand: true }], // Critical for rendering boards, lists, and cards
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react/self-closing-comp": ["warn", { component: true, html: true }],
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never", propElementValues: "always" },
      ],

      // --- React Hooks ---
      "react-hooks/rules-of-hooks": "error", // Essential for correct hook usage
      "react-hooks/exhaustive-deps": "warn", // Crucial for useEffect data fetching logic

      // --- React Refresh (Vite HMR) ---
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // --- Import & Module Rules ---
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",

      // --- General JavaScript Best Practices ---
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "dot-notation": "warn",
      eqeqeq: ["error", "always"],

      // --- Code Style & Formatting ---
      semi: ["error", "never"],
      quotes: ["error", "single", { avoidEscape: true }],
      "comma-dangle": ["warn", "always-multiline"],
      "object-curly-spacing": ["warn", "always"],
      "array-bracket-spacing": ["warn", "never"],
      "no-multiple-empty-lines": ["warn", { max: 1, eof: true }],

      // --- Code Complexity (Tuned for complex UI like drag-and-drop) ---
      complexity: ["warn", 15],
      "max-lines-per-function": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      "max-depth": ["warn", 4],

      // --- Accessibility (Important for a highly interactive UI) ---
      "jsx-a11y/click-events-have-key-events": "warn", // Reminds to add keyboard support for draggable cards
      "jsx-a11y/no-static-element-interactions": "warn", // Common with custom UI elements
    },
  },

  // 3. Overrides for specific file types/directories

  // Stricter rules for API services
  {
    files: ["src/api/**/*.js", "src/services/**/*.js"],
    rules: {
      "no-console": "error", // No debugging logs should be left in API calls
      "max-lines-per-function": ["error", { max: 50 }],
    },
  },

  // Stricter rules for custom hooks
  {
    files: ["src/hooks/**/*.js", "src/hooks/use*.js"],
    rules: {
      "react-hooks/exhaustive-deps": "error", // Dependencies must be correct in shared hooks
    },
  },

  // Relaxed rules for configuration files
  {
    files: ["*.config.js", "vite.config.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "import/order": "off",
      "no-console": "off",
    },
  },
];
