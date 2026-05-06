module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended"],
  ignorePatterns: ["/out/**/*"],
  overrides: [
    {
      files: ["*.ts"],
      extends: [
        "plugin:@typescript-eslint/recommended",
      ],
      rules: {
      },
    },
    {
      files: ["*.js"],
      env: { node: true },
    },
  ],
};
