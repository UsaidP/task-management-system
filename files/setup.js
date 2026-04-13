/**
 * tests/setup.js
 * Shared test infrastructure: DB lifecycle, factories, request helpers
 */
import mongoose from "mongoose"
import request from "supertest"
import { MongoMemoryServer } from "mongodb-memory-server"

import app from "../backend/src/app.js"
import { User } from "../backend/src/models/user.model.js"
import Project from "../backend/src/models/project.model.js"
import ProjectMember from "../backend/src/models/projectmember.model.js"
import Task from "../backend/src/models/task.model.js"
import Sprint from "../backend/src/models/sprint.model.js"

let mongoServer
let _userCounter = 0

const DEFAULT_TEST_PASSWORD = "TestP@ssw0rd!2026"

// ── DB lifecycle ─────────────────────────────────────────────────────────────

/**
 * Start an in-memory MongoDB instance and connect Mongoose.
 */
export const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  } catch (error) {
    throw new Error(`Failed to connect to test database: ${error.message}`)
  }
}

/**
 * Disconnect Mongoose and stop the in-memory MongoDB server.
 */
export const disconnectTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop()
      mongoServer = null
    }
  }
}

/**
 * Delete all documents from every collection in the test database.
 */
export const clearDB = async () => {
  const collections = mongoose.connection.collections
  if (!collections) return

  const deletePromises = Object.values(collections).map((collection) =>
    collection.deleteMany({})
  )
  await Promise.all(deletePromises)
}

/**
 * Reset the user counter to avoid ID collisions across test suites.
 */
export const resetUserCounter = () => {
  _userCounter = 0
}

// ── User Factory ──────────────────────────────────────────────────────────────

/**
 * Generate user data without persisting to the database.
 */
export const makeUser = (overrides = {}) => {
  _userCounter++
  return {
    fullname: `Test User ${_userCounter}`,
    username: `testuser${_userCounter}`,
    email: `testuser${_userCounter}@example.com`,
    password: DEFAULT_TEST_PASSWORD,
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
 * Create a verified user and return an authenticated Supertest agent.
 */
export const createAuthenticatedAgent = async (overrides = {}) => {
  const { user, password } = await createVerifiedUser(overrides)
  const agent = request.agent(app)

  const loginRes = await agent
    .post("/api/v1/auth/login")
    .send({ identifier: user.email, password })

  if (loginRes.status >= 400) {
    throw new Error(
      `Login failed for user ${user.email}: ${JSON.stringify(loginRes.body)}`
    )
  }

  return { agent, user, password }
}

/**
 * Log in an existing user and return an authenticated Supertest agent.
 */
export const loginAs = async (identifier, password) => {
  const agent = request.agent(app)

  const loginRes = await agent
    .post("/api/v1/auth/login")
    .send({ identifier, password })

  if (loginRes.status >= 400) {
    throw new Error(
      `Login failed for identifier "${identifier}": ${JSON.stringify(loginRes.body)}`
    )
  }

  return agent
}

// ── Project Factory ───────────────────────────────────────────────────────────

let _projectCounter = 0

/**
 * Create a project owned by the given user.
 */
export const createProject = async (createdBy, overrides = {}) => {
  _projectCounter++
  return Project.create({
    name: `Test Project ${_projectCounter}`,
    description: "Test project",
    createdBy: createdBy._id,
    ...overrides,
  })
}

/**
 * Add a member to a project.
 */
export const addMember = async (projectId, userId, role = "member") => {
  return ProjectMember.create({
    project: projectId,
    user: userId,
    role,
    isActive: true,
  })
}

// ── Task Factory ──────────────────────────────────────────────────────────────

let _taskCounter = 0

/**
 * Create a task within a project.
 */
export const createTask = async (projectId, createdBy, overrides = {}) => {
  _taskCounter++
  return Task.create({
    title: `Test Task ${_taskCounter}`,
    project: projectId,
    createdBy: createdBy._id,
    status: "todo",
    priority: "medium",
    ...overrides,
  })
}

// ── Sprint Factory ────────────────────────────────────────────────────────────

let _sprintCounter = 0

/**
 * Create a sprint within a project.
 */
export const createSprint = async (projectId, createdBy, overrides = {}) => {
  _sprintCounter++
  return Sprint.create({
    name: `Test Sprint ${_sprintCounter}`,
    project: projectId,
    createdBy: createdBy._id,
    status: "backlog",
    ...overrides,
  })
}

// ── Cookie helper ─────────────────────────────────────────────────────────────

/**
 * Extract set-cookie headers from a response into a key-value map.
 */
export const extractCookies = (res) => {
  const raw = res?.headers?.["set-cookie"]
  if (!raw || raw.length === 0) return {}

  return raw.reduce((acc, cookie) => {
    const [pair] = cookie.split(";")
    const [name, value] = pair.split("=")
    if (name) {
      acc[name.trim()] = value?.trim() ?? ""
    }
    return acc
  }, {})
}

export { app, request }
