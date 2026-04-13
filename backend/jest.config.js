export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 30000,
  maxWorkers: 1,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/utils/imagekit.js",
    "!src/config/**",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
}
