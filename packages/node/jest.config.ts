module.exports = {
  verbose: true,
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  transform: {
    '^.+\\.(ts|tsx)$': '@swc/jest',
  },
  testMatch: [
    '**/test/**/*.test.(ts)'
  ],
  testEnvironment: 'node',
};