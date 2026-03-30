export default {
	collectCoverageFrom: ["src/**/*.js"],
	coverageDirectory: "coverage",
	moduleFileExtensions: ["js", "mjs"],
	testEnvironment: "node",
	testMatch: ["**/tests/**/*.test.js"],
	transform: {},
	verbose: true,
}
