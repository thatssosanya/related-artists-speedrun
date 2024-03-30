module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    "prettier",
    "next",
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "prettier", "unused-imports"],
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["src/typings/types/generated.ts", "*.test.js", ".eslintrc.js", "next.config.js", "jest.config.js"],
  rules: {
    curly: ["error", "all"],
    "prettier/prettier": "error",
    "no-case-declarations": "off",
    "newline-before-return": "error",
    "no-console": "error",
    "no-alert": "error",
    "no-debugger": "error",
    "max-len": ["off", { code: 150 }],
    "prefer-destructuring": ["error", { object: true, array: false }],
    "unused-imports/no-unused-imports": "error",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [".*"],
            message: "Use absolute paths for imports",
          },
        ],
      },
    ],
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/self-closing-comp": "warn",
    "react/no-unknown-property": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-pascal-case": ["error", { allowAllCaps: true, allowNamespace: true, ignore: ["_*"] }],
    "react/jsx-boolean-value": ["error"],
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: "property",
        format: ["snake_case", "camelCase", "PascalCase", "UPPER_CASE"],
      },
      {
        selector: "enumMember",
        format: ["UPPER_CASE"],
      },
    ],
    "@typescript-eslint/no-use-before-define": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/member-delimiter-style": [
      "off",
      {
        multiline: {
          delimiter: "none",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
  },
}
