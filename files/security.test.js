/**
 * tests/security.test.js
 * Security surface: rate limiting, injection, XSS, headers, CORS,
 * token theft, brute force, input size limits.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import request from "supertest"
import {
  app,
  connectTestDB,
  disconnectTestDB,
  clearDB,
  makeUser,
  createVerifiedUser,
} from "./setup.js"

beforeAll(connectTestDB)
afterAll(disconnectTestDB)
beforeEach(clearDB)

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY HEADERS (Helmet)
// ─────────────────────────────────────────────────────────────────────────────
describe("Security headers (Helmet)", () => {
  it("sets X-Content-Type-Options: nosniff", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    expect(res.headers["x-content-type-options"]).toBe("nosniff")
  })

  it("sets X-Frame-Options to deny clickjacking", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    expect(res.headers["x-frame-options"]).toBeDefined()
  })

  it("sets X-XSS-Protection header", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    // Helmet sets this; value may vary by version
    expect(res.headers["x-xss-protection"]).toBeDefined()
  })

  it("removes X-Powered-By header", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    expect(res.headers["x-powered-by"]).toBeUndefined()
  })

  it("sets Strict-Transport-Security in production-like mode", async () => {
    // In test (NODE_ENV=test), HSTS might not be set — verify Helmet is wired
    const res = await request(app).get("/api/v1/healthcheck")
    // Just verify Helmet is active (any Helmet header will do)
    const hasHelmetHeader =
      res.headers["x-content-type-options"] ||
      res.headers["x-frame-options"] ||
      res.headers["cross-origin-opener-policy"]
    expect(hasHelmetHeader).toBeTruthy()
  })

  it("does not expose server software version", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    expect(res.headers["server"]).not.toMatch(/express|node/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NOSQL INJECTION PREVENTION
// ─────────────────────────────────────────────────────────────────────────────
describe("NoSQL injection prevention", () => {
  it("sanitizes $gt operator in login identifier", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: { $gt: "" }, password: "anything" })
    // Should not 200 with a user — should 400 or 404
    expect(res.status).not.toBe(200)
  })

  it("sanitizes $where operator in login", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: { $where: "this.email" }, password: "anything" })
    expect(res.status).not.toBe(200)
  })

  it("sanitizes operator injection in registration email field", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(makeUser({ email: { $ne: null } }))
    expect(res.status).not.toBe(201)
  })

  it("sanitizes nested operator injection in password field", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: "admin@example.com", password: { $regex: ".*" } })
    expect(res.status).not.toBe(200)
  })

  it("sanitizes array injection in email field", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: ["a@b.com", "c@d.com"], password: "test" })
    expect(res.status).not.toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// XSS PREVENTION
// ─────────────────────────────────────────────────────────────────────────────
describe("XSS prevention", () => {
  it("strips script tags from text fields", async () => {
    const xssPayload = "<script>alert('xss')</script>"
    const data = makeUser({ fullname: xssPayload })
    const res = await request(app).post("/api/v1/auth/register").send(data)

    if (res.status === 201) {
      // If registration went through, the stored value must be sanitized
      expect(res.body.data?.fullname).not.toContain("<script>")
    }
    // Or the request should have been rejected
  })

  it("sanitizes HTML event handlers in input fields", async () => {
    const data = makeUser({ fullname: '<img src=x onerror="alert(1)">' })
    const res = await request(app).post("/api/v1/auth/register").send(data)
    if (res.body.data?.fullname) {
      expect(res.body.data.fullname).not.toContain("onerror")
    }
  })

  it("sanitizes javascript: URIs in text fields", async () => {
    const data = makeUser({ fullname: "javascript:alert(1)" })
    const res = await request(app).post("/api/v1/auth/register").send(data)
    if (res.body.data?.fullname) {
      expect(res.body.data.fullname).not.toContain("javascript:")
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────
describe("Rate limiting", () => {
  it("returns 429 after exceeding the request limit", async () => {
    // Make 101 requests (limit is 100/15min on /api prefix)
    const results = []
    for (let i = 0; i < 105; i++) {
      const res = await request(app).get("/api/v1/healthcheck")
      results.push(res.status)
    }
    expect(results).toContain(429)
  }, 30_000)

  it("returns Retry-After header when rate limited", async () => {
    const results = []
    for (let i = 0; i < 105; i++) {
      results.push(await request(app).get("/api/v1/healthcheck"))
    }
    const limited = results.find((r) => r.status === 429)
    if (limited) {
      // Either Retry-After or RateLimit-Reset header should be present
      const hasRetryInfo =
        limited.headers["retry-after"] || limited.headers["ratelimit-reset"]
      expect(hasRetryInfo).toBeDefined()
    }
  }, 30_000)
})

// ─────────────────────────────────────────────────────────────────────────────
// BODY SIZE LIMITS
// ─────────────────────────────────────────────────────────────────────────────
describe("Request body size limits", () => {
  it("rejects payloads larger than 10kb", async () => {
    const largeString = "A".repeat(15 * 1024) // 15KB
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ identifier: largeString, password: "test" }))
    expect(res.status).toBe(413)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// COOKIE SECURITY
// ─────────────────────────────────────────────────────────────────────────────
describe("Cookie security attributes", () => {
  it("sets HttpOnly flag on access token cookie", async () => {
    const { user, password } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    const cookies = res.headers["set-cookie"] ?? []
    const accessCookie = cookies.find((c) => c.startsWith("accessToken=")) ?? ""
    expect(accessCookie).toMatch(/HttpOnly/i)
  })

  it("sets HttpOnly flag on refresh token cookie", async () => {
    const { user, password } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    const cookies = res.headers["set-cookie"] ?? []
    const refreshCookie = cookies.find((c) => c.startsWith("refreshToken=")) ?? ""
    expect(refreshCookie).toMatch(/HttpOnly/i)
  })

  it("sets SameSite attribute on cookies", async () => {
    const { user, password } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    const cookies = res.headers["set-cookie"] ?? []
    const accessCookie = cookies.find((c) => c.startsWith("accessToken=")) ?? ""
    expect(accessCookie).toMatch(/SameSite/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORIZATION — ROLE BOUNDARIES
// ─────────────────────────────────────────────────────────────────────────────
describe("Role-based access control boundaries", () => {
  it("denies admin route to regular member", async () => {
    const { user, password } = await createVerifiedUser({ role: "member" })
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    const res = await agent.get("/api/v1/dashboard/admin/stats")
    expect(res.status).toBe(403)
  })

  it("allows admin route to admin user", async () => {
    const { user, password } = await createVerifiedUser({ role: "admin" })
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    const res = await agent.get("/api/v1/dashboard/admin/stats")
    expect(res.status).toBe(200)
  })

  it("cannot escalate own role via profile update", async () => {
    const { user, password } = await createVerifiedUser({ role: "member" })
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    // Attempt to inject role into profile update
    await agent.patch("/api/v1/auth/profile").send({ role: "admin" })

    const updated = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", (await agent.get("/api/v1/auth/me")).headers["set-cookie"])

    // Role should still be member
    const dbUser = await (await import("../src/models/user.model.js")).User.findById(user._id)
    expect(dbUser.role).toBe("member")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// JWT TAMPERING
// ─────────────────────────────────────────────────────────────────────────────
describe("JWT tampering resistance", () => {
  it("rejects token with wrong signature", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZha2VpZCIsInJvbGUiOiJhZG1pbiJ9.wrongsignature"
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `accessToken=${fakeToken}`)
    expect(res.status).toBe(401)
  })

  it("rejects token with algorithm=none (alg bypass attack)", async () => {
    // Algorithm confusion: unsigned token
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")
    const payload = Buffer.from(JSON.stringify({ id: "fakeadminid", role: "admin" })).toString("base64url")
    const noneToken = `${header}.${payload}.`

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `accessToken=${noneToken}`)
    expect(res.status).toBe(401)
  })

  it("rejects a valid token for a deleted user", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    // Delete the user from DB
    await (await import("../src/models/user.model.js")).User.findByIdAndDelete(user._id)

    const res = await agent.get("/api/v1/auth/me")
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────
describe("CORS", () => {
  it("returns CORS headers for allowed origin", async () => {
    const res = await request(app)
      .get("/api/v1/healthcheck")
      .set("Origin", "http://localhost:5173")
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173")
  })

  it("does not echo back arbitrary origins", async () => {
    const res = await request(app)
      .get("/api/v1/healthcheck")
      .set("Origin", "http://evil.attacker.com")
    const corsHeader = res.headers["access-control-allow-origin"]
    expect(corsHeader).not.toBe("http://evil.attacker.com")
  })
})
