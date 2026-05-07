export default {
	collectCoverageFrom: [
		"src/**/*.js",
		"!src/utils/imagekit.js",
		"!src/config/**",
		"!**/node_modules/**",
	],
	coverageThreshold: {
		global: {
			branches: 60,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
	maxWorkers: 1,
	setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
	testEnvironment: "node",
	testMatch: ["**/tests/**/*.test.js"],
	testTimeout: 60000,
	transform: {},
}
