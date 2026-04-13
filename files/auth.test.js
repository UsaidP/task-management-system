/**
 * tests/auth.test.js
 * Full coverage of auth flows: register, verify, login, logout,
 * refresh, resend, forgot/reset password — all edge cases.
 */
import crypto from "node:crypto"
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import request from "supertest"
import { User } from "../src/models/user.model.js"
import RefreshToken from "../src/models/refreshToken.model.js"
import BlacklistedToken from "../src/models/blacklistedToken.js"
import {
  app,
  connectTestDB,
  disconnectTestDB,
  clearDB,
  makeUser,
  createVerifiedUser,
  registerAndLogin,
  extractCookies,
} from "./setup.js"

beforeAll(connectTestDB)
afterAll(disconnectTestDB)
beforeEach(clearDB)

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/register", () => {
  it("creates a new unverified user and returns 201", async () => {
    const data = makeUser()
    const res = await request(app).post("/api/v1/auth/register").send(data)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.email).toBe(data.email)
    expect(res.body.data.password).toBeUndefined()
    expect(res.body.data.emailVerificationToken).toBeUndefined()

    const dbUser = await User.findOne({ email: data.email })
    expect(dbUser).toBeTruthy()
    expect(dbUser.isEmailVerified).toBe(false)
  })

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "missing@example.com" })
    expect(res.status).toBe(400)
  })

  it("returns 400 when email is invalid format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(makeUser({ email: "not-an-email" }))
    expect(res.status).toBe(400)
  })

  it("returns 409 when email belongs to a VERIFIED user", async () => {
    const { user } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(makeUser({ email: user.email }))
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/email/i)
  })

  it("returns 409 when username belongs to a VERIFIED user", async () => {
    const { user } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(makeUser({ username: user.username }))
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/username/i)
  })

  it("resends verification email (200) when same email re-registers (unverified)", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)

    // Re-register after cooldown would pass; here we inject past token
    const dbUser = await User.findOne({ email: data.email })
    // Backdating expiry so cooldown is not active
    const pastExpiry = Date.now() - 60 * 60 * 1000 // 1 hour ago
    dbUser.emailVerificationExpiry = new Date(pastExpiry + 25 * 60 * 60 * 1000) // 24h window
    await dbUser.save({ validateBeforeSave: false })

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...data, fullname: "Updated Name" })

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/resent|verification/i)

    const updated = await User.findOne({ email: data.email })
    expect(updated.fullname).toBe("Updated Name")
    expect(updated.isEmailVerified).toBe(false)
  })

  it("returns 409 when username is taken by a DIFFERENT unverified user", async () => {
    const userA = makeUser()
    const userB = makeUser({ username: userA.username }) // same username, diff email
    await request(app).post("/api/v1/auth/register").send(userA)
    const res = await request(app).post("/api/v1/auth/register").send(userB)
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/username/i)
  })

  it("enforces resend cooldown (429) within 60 seconds", async () => {
    const data = makeUser()
    // First registration
    await request(app).post("/api/v1/auth/register").send(data)

    // Immediately re-register — token was just issued, cooldown active
    const res = await request(app).post("/api/v1/auth/register").send(data)
    expect(res.status).toBe(429)
    expect(res.body.message).toMatch(/wait/i)
  })

  it("does not expose password or verification token in response", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(makeUser())
    expect(res.body.data?.password).toBeUndefined()
    expect(res.body.data?.emailVerificationToken).toBeUndefined()
  })

  it("hashes the password in DB (not stored in plaintext)", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)
    const user = await User.findOne({ email: data.email }).select("+password")
    expect(user.password).not.toBe(data.password)
    expect(user.password).toMatch(/^\$2[ab]\$/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/auth/verify/:token", () => {
  it("verifies a valid token and marks user as verified", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)
    const user = await User.findOne({ email: data.email })

    // Generate a fresh token to simulate what was emailed
    const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
    user.emailVerificationToken = hashToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    const res = await request(app).get(`/api/v1/auth/verify/${unHashedToken}`)
    expect(res.status).toBe(200)

    const updated = await User.findOne({ email: data.email })
    expect(updated.isEmailVerified).toBe(true)
    expect(updated.emailVerificationToken).toBeUndefined()
    expect(updated.emailVerificationExpiry).toBeUndefined()
  })

  it("returns 400 for an invalid token", async () => {
    const res = await request(app).get("/api/v1/auth/verify/completelyfaketoken123")
    expect(res.status).toBe(400)
  })

  it("returns 400 for an expired token", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)
    const user = await User.findOne({ email: data.email })

    const { unHashedToken, hashToken } = await user.generateTemporaryToken()
    user.emailVerificationToken = hashToken
    user.emailVerificationExpiry = new Date(Date.now() - 1000) // already expired
    await user.save({ validateBeforeSave: false })

    const res = await request(app).get(`/api/v1/auth/verify/${unHashedToken}`)
    expect(res.status).toBe(400)
  })

  it("returns 200 gracefully if token is used twice (idempotent)", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)
    const user = await User.findOne({ email: data.email })

    const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
    user.emailVerificationToken = hashToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    // First use
    await request(app).get(`/api/v1/auth/verify/${unHashedToken}`)
    // Second use — token is cleared, user is verified
    const res = await request(app).get(`/api/v1/auth/verify/${unHashedToken}`)
    // Should not throw 500 — should respond gracefully
    expect([200, 400]).toContain(res.status)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RESEND VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/verify-email (resend)", () => {
  it("sends a new verification email for unverified user", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)

    // Backdate token so cooldown is not active
    const user = await User.findOne({ email: data.email })
    user.emailVerificationExpiry = new Date(Date.now() + 25 * 60 * 60 * 1000) // 25h from now
    // Simulate token issued 2 minutes ago
    // We manipulate expiry arithmetic: expiry - TTL = issuedAt
    // issuedAt should be > 60s ago, so set expiry = now + (24h - 2min)
    const issuedAt = Date.now() - 2 * 60 * 1000
    user.emailVerificationExpiry = new Date(issuedAt + 24 * 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ email: data.email })
    expect(res.status).toBe(200)
  })

  it("returns 400 for already verified email", async () => {
    const { user } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ email: user.email })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/already verified/i)
  })

  it("returns 404 for unknown email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ email: "nobody@example.com" })
    expect(res.status).toBe(404)
  })

  it("enforces cooldown (429) for too-frequent resends", async () => {
    const data = makeUser()
    await request(app).post("/api/v1/auth/register").send(data)

    // Immediately try to resend — cooldown should block
    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ email: data.email })
    expect(res.status).toBe(429)
    expect(res.body.message).toMatch(/wait/i)
  })

  it("returns 400 when email field is missing", async () => {
    const res = await request(app).post("/api/v1/auth/verify-email").send({})
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/login", () => {
  it("logs in with email and sets httpOnly cookies", async () => {
    const { user, password } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    expect(res.status).toBe(200)
    expect(res.body.data.user).toBeDefined()
    expect(res.body.data.user.password).toBeUndefined()

    const cookies = res.headers["set-cookie"] ?? []
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true)
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true)
    expect(cookies.some((c) => c.includes("HttpOnly"))).toBe(true)
  })

  it("logs in with username", async () => {
    const { user, password } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.username, password })
    expect(res.status).toBe(200)
  })

  it("returns 403 for unverified email", async () => {
    const data = makeUser()
    await User.create({ ...data, isEmailVerified: false })
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: data.email, password: data.password })
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/verify/i)
  })

  it("returns 401 for wrong password", async () => {
    const { user } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password: "WrongPassword!" })
    expect(res.status).toBe(401)
  })

  it("returns 404 for non-existent user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: "nobody@example.com", password: "Password123!" })
    expect(res.status).toBe(404)
  })

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ identifier: "a@b.com" })
    expect(res.status).toBe(400)
  })

  it("stores refresh token in DB on successful login", async () => {
    const { user, password } = await createVerifiedUser()
    await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })
    const token = await RefreshToken.findOne({ user: user._id })
    expect(token).toBeTruthy()
    expect(token.expiresAt).toBeInstanceOf(Date)
  })

  it("does not expose sensitive fields in login response", async () => {
    const { user, password } = await createVerifiedUser()
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })
    expect(res.body.data?.user?.password).toBeUndefined()
    expect(res.body.data?.user?.emailVerificationToken).toBeUndefined()
    expect(res.body.data?.user?.forgotPasswordToken).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/logout", () => {
  it("logs out and clears cookies", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    const res = await agent.post("/api/v1/auth/logout")
    expect(res.status).toBe(200)

    const cookies = res.headers["set-cookie"] ?? []
    // Cookies should be cleared (expired / empty)
    const accessCookie = cookies.find((c) => c.startsWith("accessToken="))
    expect(accessCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0|accessToken=;/)
  })

  it("blacklists the refresh token on logout", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    const loginRes = await agent
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    const cookies = extractCookies(loginRes)
    await agent.post("/api/v1/auth/logout")

    const blacklisted = await BlacklistedToken.findOne({ user: user._id })
    expect(blacklisted).toBeTruthy()
  })

  it("removes the refresh token from DB on logout", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })
    await agent.post("/api/v1/auth/logout")

    const tokens = await RefreshToken.find({ user: user._id })
    expect(tokens.length).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/refresh-token", () => {
  it("issues new tokens when refresh token is valid", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    const res = await agent.post("/api/v1/auth/refresh-token")
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.refreshToken).toBeDefined()
  })

  it("returns 401 when no refresh token cookie is present", async () => {
    const res = await request(app).post("/api/v1/auth/refresh-token")
    expect(res.status).toBe(401)
  })

  it("rotates the refresh token (old token is invalidated)", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    const loginRes = await agent
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    const oldTokens = await RefreshToken.find({ user: user._id })
    const oldTokenValue = oldTokens[0]?.token

    await agent.post("/api/v1/auth/refresh-token")

    const stillExists = await RefreshToken.findOne({ token: oldTokenValue })
    expect(stillExists).toBeNull()
  })

  it("returns 401 for expired refresh token", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    // Manually expire the refresh token in DB
    await RefreshToken.updateMany({ user: user._id }, { expiresAt: new Date(Date.now() - 1000) })

    const res = await agent.post("/api/v1/auth/refresh-token")
    expect(res.status).toBe(401)
  })

  it("prevents refresh token reuse (replay attack)", async () => {
    const { user, password } = await createVerifiedUser()
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password })

    const refreshCookie = loginRes.headers["set-cookie"]
      ?.find((c) => c.startsWith("refreshToken="))

    // Use the token once
    await request(app)
      .post("/api/v1/auth/refresh-token")
      .set("Cookie", refreshCookie)

    // Try to reuse the SAME old refresh token
    const res = await request(app)
      .post("/api/v1/auth/refresh-token")
      .set("Cookie", refreshCookie)

    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/forgot", () => {
  it("returns generic 200 for valid verified email (anti-enumeration)", async () => {
    const { user } = await createVerifiedUser()
    const res = await request(app).post("/api/v1/auth/forgot").send({ email: user.email })
    expect(res.status).toBe(200)
  })

  it("returns generic 200 for unknown email (anti-enumeration)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot")
      .send({ email: "nonexistent@example.com" })
    expect(res.status).toBe(200)
  })

  it("returns generic 200 for unverified email (no token issued)", async () => {
    const data = makeUser()
    await User.create({ ...data, isEmailVerified: false })
    const res = await request(app).post("/api/v1/auth/forgot").send({ email: data.email })
    expect(res.status).toBe(200)

    const user = await User.findOne({ email: data.email })
    expect(user.forgotPasswordToken).toBeUndefined()
  })

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/v1/auth/forgot").send({})
    expect(res.status).toBe(400)
  })

  it("stores hashed reset token in DB for verified user", async () => {
    const { user } = await createVerifiedUser()
    await request(app).post("/api/v1/auth/forgot").send({ email: user.email })
    const updated = await User.findOne({ email: user.email })
    expect(updated.forgotPasswordToken).toBeDefined()
    expect(updated.forgotPasswordExpiry).toBeDefined()
    expect(updated.forgotPasswordExpiry.getTime()).toBeGreaterThan(Date.now())
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/reset/:token", () => {
  const setupResetToken = async () => {
    const { user, password } = await createVerifiedUser()
    const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
    user.forgotPasswordToken = hashToken
    user.forgotPasswordExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })
    return { user, unHashedToken, oldPassword: password }
  }

  it("resets password with a valid token", async () => {
    const { user, unHashedToken } = await setupResetToken()
    const res = await request(app)
      .post(`/api/v1/auth/reset/${unHashedToken}`)
      .send({ password: "NewPassword456!" })
    expect(res.status).toBe(200)

    // Should be able to login with new password
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ identifier: user.email, password: "NewPassword456!" })
    expect(loginRes.status).toBe(200)
  })

  it("invalidates all refresh tokens after reset", async () => {
    const { user, password } = await createVerifiedUser()

    // Login to create a refresh token
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
    user.forgotPasswordToken = hashToken
    user.forgotPasswordExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    await request(app)
      .post(`/api/v1/auth/reset/${unHashedToken}`)
      .send({ password: "NewPassword456!" })

    const tokens = await RefreshToken.find({ user: user._id })
    expect(tokens.length).toBe(0)
  })

  it("returns 400 for invalid token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset/invalidtoken123")
      .send({ password: "NewPassword456!" })
    expect(res.status).toBe(400)
  })

  it("returns 400 for expired token", async () => {
    const { user, unHashedToken } = await setupResetToken()
    user.forgotPasswordExpiry = new Date(Date.now() - 1000)
    await user.save({ validateBeforeSave: false })

    const res = await request(app)
      .post(`/api/v1/auth/reset/${unHashedToken}`)
      .send({ password: "NewPassword456!" })
    expect(res.status).toBe(400)
  })

  it("returns 400 when new password is missing", async () => {
    const { unHashedToken } = await setupResetToken()
    const res = await request(app)
      .post(`/api/v1/auth/reset/${unHashedToken}`)
      .send({})
    expect(res.status).toBe(400)
  })

  it("clears the reset token fields from DB after use", async () => {
    const { user, unHashedToken } = await setupResetToken()
    await request(app)
      .post(`/api/v1/auth/reset/${unHashedToken}`)
      .send({ password: "NewPassword456!" })

    const updated = await User.findOne({ email: user.email })
    expect(updated.forgotPasswordToken).toBeUndefined()
    expect(updated.forgotPasswordExpiry).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE ACCESS
// ─────────────────────────────────────────────────────────────────────────────
describe("Protected route access", () => {
  it("returns 401 when accessing protected route without token", async () => {
    const res = await request(app).get("/api/v1/auth/me")
    expect(res.status).toBe(401)
  })

  it("returns 401 with a tampered access token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", "accessToken=eyJhbGciOiJIUzI1NiJ9.fake.signature")
    expect(res.status).toBe(401)
  })

  it("allows access with valid access token", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = request.agent(app)
    await agent.post("/api/v1/auth/login").send({ identifier: user.email, password })

    const res = await agent.get("/api/v1/auth/me")
    expect(res.status).toBe(200)
    expect(res.body.data._id.toString()).toBe(user._id.toString())
  })
})
