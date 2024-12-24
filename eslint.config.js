import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tsEslint from "typescript-eslint";

const isProduction = () => process.env.NODE_ENV === "production";
const roots = ["src", "comejene"];
/**
 * @param {string[]} pathes 
 * @returns {string[]}
 */
const fixFiles = (...pathes) => pathes
  .map(s => roots.map(root => s.replace("$", root))).flat();

const defaultConfig = tsEslint.config({
  files: fixFiles("$/**/*.ts", "$/**/*.svelte.ts"),
  extends: [
    js.configs.recommended,
    ...tsEslint.configs.strictTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
    globals: { ...globals.browser, ...globals.es2021, ...globals.node }
  },
  rules: {
    "no-console": isProduction() ? "error" : "off",

    "eqeqeq": ["error", "always", { null: "ignore" }],
    "no-duplicate-imports": ["error", { includeExports: true }],
    "no-trailing-spaces": "off",
    "no-unused-expressions": "error",
    "no-var": "error",
    "no-empty": "off",
    "no-unused-vars": "off",
    "prefer-const": "warn",
    "camelcase": "off",
    "no-constant-condition": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "warn",
    "@typescript-eslint/no-unnecessary-type-arguments": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-unary-minus": "error",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-duplicate-type-constituents": "off",
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-import-type-side-effects": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_",
      "destructuredArrayIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
    }],
    "@typescript-eslint/no-useless-empty-export": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/non-nullable-type-assertion-style": "warn",
    "@typescript-eslint/prefer-reduce-type-parameter": "off",
    "@typescript-eslint/prefer-enum-initializers": "error",
    "@typescript-eslint/prefer-readonly": "warn",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/prefer-optional-chain": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    // "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    // "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/member-delimiter-style": "off", //
    "@typescript-eslint/method-signature-style": "off",
    "@typescript-eslint/promise-function-async": "off",
    "@typescript-eslint/require-array-sort-compare": "error",

    "@typescript-eslint/unbound-method": "warn",
  }
});

const svelteConfig = tsEslint.config({
  files: fixFiles("$/**/*.svelte"),
  extends: [
    ...svelte.configs["flat/all"],
    ...svelte.configs["flat/prettier"]
  ],
  languageOptions: {
    parser: svelteParser,
    parserOptions: {
      parser: tsParser,
    }
  },
  /** @type {import("eslint").Linter.RulesRecord} */
  rules: {
    "svelte/prefer-destructured-store-props": "off",
    "svelte/no-target-blank": "off",
    "svelte/no-reactive-reassign": "error",
    "svelte/no-inline-styles": "off",
    "svelte/no-unused-class-name": "off",
    "svelte/no-useless-mustaches": "warn",
    "svelte/no-restricted-html-elements": "off",
    "svelte/no-trailing-spaces": ["warn", { skipBlankLines: false, ignoreComments: false }],
    "svelte/block-lang": ["error", { script: "ts", style: null }],
    "svelte/require-optimized-style-attribute": "warn",
    "svelte/sort-attributes": "warn", // off
    // "svelte/experimental-require-slot-types": "warn", // off
    "svelte/experimental-require-strict-events": "off",
    "svelte/valid-compile": "off",
  }
});

/** @typedef {import("@typescript-eslint/utils").TSESLint.FlatConfig.Config} FlatConfig */

// /** @type {FlatConfig} */
// const jsConfig = {
//   files: ["src/**/*.js"],
//   rules: { "@typescript-eslint/explicit-function-return-type": "off" }
// };

// /** @type {FlatConfig} */
// const configConfig = {
//   files: ["**/*.config.*"],
//   rules: { "@typescript-eslint/naming-convention": "off" }
// };

/** @type {FlatConfig[]} */
export default [
  ...defaultConfig,
  ...svelteConfig,
  // jsConfig,
  // configConfig,
  { linterOptions: { reportUnusedDisableDirectives: true } },
  {
    ignores: [
      "node_modules/",
      "assets/",
      "dist/"
    ]
  }
];