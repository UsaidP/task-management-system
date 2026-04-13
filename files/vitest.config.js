// vitest.config.js  (place in backend/)
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Run test files sequentially to avoid shared DB state issues
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
    globals: true,
    environment: "node",
    setupFiles: [],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Suppress console output during tests
    silent: false,
    // Test file patterns
    include: ["tests/**/*.test.js"],
    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.js"],
      exclude: [
        "src/utils/imagekit.js", // external service
        "src/config/**",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Required devDependencies to add to backend/package.json:
// ─────────────────────────────────────────────────────────────────────────────
//
// npm install --save-dev \
//   vitest \
//   supertest \
//   mongodb-memory-server \
//   @vitest/coverage-v8
//
// Add to backend/package.json "scripts":
//   "test":          "vitest run",
//   "test:watch":    "vitest",
//   "test:coverage": "vitest run --coverage",
//   "test:ui":       "vitest --ui"
//
// Add to backend/package.json for MongoMemoryServer binary download:
//   "mongodbMemoryServer": {
//     "version": "7.0.14"
//   }
//
// ─────────────────────────────────────────────────────────────────────────────
// Environment for tests — create backend/.env.test:
// ─────────────────────────────────────────────────────────────────────────────
//
// NODE_ENV=test
// PORT=4001
// ACCESS_TOKEN_SECRET=test_access_secret_256bit_minimum_length
// REFRESH_TOKEN_SECRET=test_refresh_secret_256bit_minimum_length
// ACCESS_TOKEN_EXPIRY=15m
// REFRESH_TOKEN_EXPIRY=7d
// TEMPORARY_TOKEN_EXPIRY=24h
// BLACKLISTED_TOKEN_EXPIRY=7d
// EMAIL_VERIFICATION_EXPIRY=24h
// HASH_PEPPER=test_pepper_value
// CORS_ORIGIN=http://localhost:5173
// BASE_URL=http://localhost:4001
// MAIL_HOST=localhost
// MAIL_PORT=1025
// MAIL_USER=test
// MAIL_PASS=test
// EMAIL_FROM=test@example.com
// IMAGEKIT_PUBLIC_KEY=test
// IMAGEKIT_PRIVATE_KEY=test
// IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/test
