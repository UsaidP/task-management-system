/**
 * tests/setup.js
 * Shared test infrastructure: DB lifecycle, factories, request helpers
 */
import mongoose from "mongoose"
import request from "supertest"
import { MongoMemoryServer } from "mongodb-memory-server"
import app from "../src/app.js"
import { User } from "../src/models/user.model.js"
import RefreshToken from "../src/models/refreshToken.model.js"
import BlacklistedToken from "../src/models/blacklistedToken.js"
import Project from "../src/models/project.model.js"
import ProjectMember from "../src/models/projectmember.model.js"
import Task from "../src/models/task.model.js"
import Sprint from "../src/models/sprint.model.js"
import SubTask from "../src/models/subtask.model.js"
import ProjectNote from "../src/models/projectnote.model.js"

let mongoServer

// ── DB lifecycle ─────────────────────────────────────────────────────────────

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
}

export const disconnectTestDB = async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
}

export const clearDB = async () => {
  const collections = mongoose.connection.collections
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
}

// ── User Factory ──────────────────────────────────────────────────────────────

let _userCounter = 0

export const makeUser = (overrides = {}) => {
  _userCounter++
  return {
    fullname: `Test User ${_userCounter}`,
    username: `testuser${_userCounter}`,
    email: `testuser${_userCounter}@example.com`,
    password: "Password123!",
    ...overrides,
  }
}

/**
 * Create a verified user directly in DB (bypasses email verification).
 */
export const createVerifiedUser = async (overrides = {}) => {
  const data = makeUser(overrides)
  const user = await User.create({ ...data, isEmailVerified: true })
  return { user, password: data.password }
}

/**
 * Create an admin user directly in DB.
 */
export const createAdminUser = async (overrides = {}) => {
  return createVerifiedUser({ role: "admin", ...overrides })
}

/**
 * Register + login via HTTP, return agent with cookies set.
 */
export const loginAs = async (credentials) => {
  const agent = request.agent(app)
  await agent.post("/api/v1/auth/login").send(credentials)
  return agent
}

/**
 * Full register → verify → login cycle via API.
 * Returns { agent, user, cookies }
 */
export const registerAndLogin = async (overrides = {}) => {
  const data = makeUser(overrides)

  // Create verified user directly (avoids email dependency in tests)
  const user = await User.create({ ...data, isEmailVerified: true })

  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ identifier: data.email, password: data.password })

  const cookies = res.headers["set-cookie"]
  const agent = request.agent(app)

  // Attach cookies manually to agent
  const cookieHeader = cookies?.join("; ") ?? ""

  return { agent, user, cookies, cookieHeader, password: data.password }
}

// ── Project Factory ───────────────────────────────────────────────────────────

export const createProject = async (createdBy, overrides = {}) => {
  return Project.create({
    name: `Project ${Date.now()}`,
    description: "Test project",
    createdBy: createdBy._id,
    ...overrides,
  })
}

export const addMember = async (projectId, userId, role = "member") => {
  return ProjectMember.create({ project: projectId, user: userId, role, isActive: true })
}

// ── Task Factory ──────────────────────────────────────────────────────────────

export const createTask = async (projectId, createdBy, overrides = {}) => {
  return Task.create({
    title: `Task ${Date.now()}`,
    project: projectId,
    createdBy: createdBy._id,
    status: "todo",
    priority: "medium",
    ...overrides,
  })
}

// ── Sprint Factory ────────────────────────────────────────────────────────────

export const createSprint = async (projectId, createdBy, overrides = {}) => {
  return Sprint.create({
    name: `Sprint ${Date.now()}`,
    project: projectId,
    createdBy: createdBy._id,
    status: "backlog",
    ...overrides,
  })
}

// ── Cookie helper ─────────────────────────────────────────────────────────────

export const extractCookies = (res) => {
  const raw = res.headers["set-cookie"] ?? []
  return raw.reduce((acc, cookie) => {
    const [pair] = cookie.split(";")
    const [name, value] = pair.split("=")
    acc[name.trim()] = value?.trim()
    return acc
  }, {})
}

export { app, request }
