/**
 * tests/task.test.js
 * Task CRUD, filtering, status transitions, assignment, comments.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import request from "supertest"
import {
  app,
  connectTestDB,
  disconnectTestDB,
  clearDB,
  createVerifiedUser,
  createAdminUser,
  createProject,
  addMember,
  createTask,
  createSprint,
} from "./setup.js"

beforeAll(connectTestDB)
afterAll(disconnectTestDB)
beforeEach(clearDB)

const loginAgent = async (email, password) => {
  const agent = request.agent(app)
  await agent.post("/api/v1/auth/login").send({ identifier: email, password })
  return agent
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK CRUD
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/tasks — create", () => {
  it("allows any project member to create a task", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.post("/api/v1/tasks").send({
      title: "Test Task",
      projectId: project._id.toString(),
      priority: "high",
    })
    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe("Test Task")
  })

  it("returns 400 when title is missing", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/tasks").send({ projectId: project._id.toString() })
    expect(res.status).toBe(400)
  })

  it("returns 403 for non-member trying to create a task", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: stranger, password: strangerPw } = await createVerifiedUser()
    const project = await createProject(owner)

    const agent = await loginAgent(stranger.email, strangerPw)
    const res = await agent.post("/api/v1/tasks").send({
      title: "Hack",
      projectId: project._id.toString(),
    })
    expect(res.status).toBe(403)
  })

  it("validates status enum", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/tasks").send({
      title: "Bad Status",
      projectId: project._id.toString(),
      status: "flying",
    })
    expect(res.status).toBe(400)
  })

  it("validates priority enum", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/tasks").send({
      title: "Bad Priority",
      projectId: project._id.toString(),
      priority: "superhigh",
    })
    expect(res.status).toBe(400)
  })

  it("does not allow assigning task to non-project-member", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: outsider } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/tasks").send({
      title: "Assign Outsider",
      projectId: project._id.toString(),
      assignedTo: [outsider._id.toString()],
    })
    expect([400, 403]).toContain(res.status)
  })
})

describe("GET /api/v1/tasks — list with filters", () => {
  it("returns tasks scoped to a project", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const p1 = await createProject(owner, { name: "p1" })
    const p2 = await createProject(owner, { name: "p2" })
    await addMember(p1._id, owner._id, "owner")
    await createTask(p1._id, owner)
    await createTask(p2._id, owner)

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.get(`/api/v1/tasks?projectId=${p1._id}`)
    expect(res.status).toBe(200)
    res.body.data.forEach((t) => expect(t.project.toString()).toBe(p1._id.toString()))
  })

  it("filters tasks by status", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    await createTask(project._id, owner, { status: "todo" })
    await createTask(project._id, owner, { status: "completed" })

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.get(`/api/v1/tasks?projectId=${project._id}&status=todo`)
    expect(res.status).toBe(200)
    res.body.data.forEach((t) => expect(t.status).toBe("todo"))
  })

  it("filters tasks by assignee", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: assignee } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    await addMember(project._id, assignee._id, "member")
    await createTask(project._id, owner, { assignedTo: [assignee._id] })
    await createTask(project._id, owner)

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.get(
      `/api/v1/tasks?projectId=${project._id}&assignedTo=${assignee._id}`,
    )
    expect(res.status).toBe(200)
    // All returned tasks should include the assignee
    res.body.data.forEach((t) => {
      const ids = t.assignedTo.map((a) => (a._id || a).toString())
      expect(ids).toContain(assignee._id.toString())
    })
  })

  it("returns 403 for non-member querying project tasks", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: stranger, password: strangerPw } = await createVerifiedUser()
    const project = await createProject(owner)

    const agent = await loginAgent(stranger.email, strangerPw)
    const res = await agent.get(`/api/v1/tasks?projectId=${project._id}`)
    expect(res.status).toBe(403)
  })
})

describe("PUT /api/v1/tasks/:id — update", () => {
  it("allows member to update a task", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")
    const task = await createTask(project._id, owner)

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent
      .put(`/api/v1/tasks/${task._id}`)
      .send({ title: "Updated Title" })
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe("Updated Title")
  })

  it("moves task through valid status transitions", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    const task = await createTask(project._id, owner, { status: "todo" })

    const agent = await loginAgent(owner.email, ownerPw)
    const statuses = ["in-progress", "under-review", "completed"]
    for (const status of statuses) {
      const res = await agent.put(`/api/v1/tasks/${task._id}`).send({ status })
      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe(status)
    }
  })
})

describe("DELETE /api/v1/tasks/:id — delete", () => {
  it("denies regular member from deleting a task", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")
    const task = await createTask(project._id, owner)

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.delete(`/api/v1/tasks/${task._id}`)
    expect(res.status).toBe(403)
  })

  it("allows owner to delete a task", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    const task = await createTask(project._id, owner)

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.delete(`/api/v1/tasks/${task._id}`)
    expect(res.status).toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SPRINT TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe("Sprint lifecycle", () => {
  it("creates a sprint in backlog status by default", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/sprints").send({
      name: "Sprint 1",
      projectId: project._id.toString(),
    })
    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe("backlog")
  })

  it("cannot have two active sprints in the same project", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    await createSprint(project._id, owner, { status: "active" })

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/sprints").send({
      name: "Sprint 2",
      projectId: project._id.toString(),
      status: "active",
    })
    expect(res.status).toBe(409)
  })

  it("completing a sprint moves unfinished tasks to backlog", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    const sprint = await createSprint(project._id, owner, { status: "active" })
    await createTask(project._id, owner, { sprint: sprint._id, status: "todo" })
    await createTask(project._id, owner, { sprint: sprint._id, status: "completed" })

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post(`/api/v1/sprints/${sprint._id}/complete`)
    expect(res.status).toBe(200)

    // The todo task should now have no sprint reference (returned to backlog)
    const { default: Task } = await import("../src/models/task.model.js")
    const incompleteTasks = await Task.find({
      project: project._id,
      status: { $ne: "completed" },
    })
    incompleteTasks.forEach((t) => expect(t.sprint).toBeUndefined())
  })

  it("returns 400 when sprint name is missing", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/sprints").send({ projectId: project._id.toString() })
    expect(res.status).toBe(400)
  })

  it("denies member from deleting a sprint", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")
    const sprint = await createSprint(project._id, owner)

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.delete(`/api/v1/sprints/${sprint._id}`)
    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUBTASK TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe("Subtask CRUD", () => {
  it("creates a subtask attached to a task", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    const task = await createTask(project._id, owner)

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/subtasks").send({
      title: "Do the thing",
      taskId: task._id.toString(),
    })
    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe("Do the thing")
  })

  it("marks subtask as completed", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    const task = await createTask(project._id, owner)

    const { default: SubTask } = await import("../src/models/subtask.model.js")
    const subtask = await SubTask.create({
      title: "Sub",
      task: task._id,
      createdBy: owner._id,
      isCompleted: false,
    })

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.put(`/api/v1/subtasks/${subtask._id}`).send({ isCompleted: true })
    expect(res.status).toBe(200)
    expect(res.body.data.isCompleted).toBe(true)
  })

  it("returns 403 when non-member tries to create subtask", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: stranger, password: strangerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    const task = await createTask(project._id, owner)

    const agent = await loginAgent(stranger.email, strangerPw)
    const res = await agent.post("/api/v1/subtasks").send({
      title: "Intruder subtask",
      taskId: task._id.toString(),
    })
    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
describe("Admin Dashboard", () => {
  it("returns global stats for admin", async () => {
    const { user: admin, password: adminPw } = await createAdminUser()
    await createVerifiedUser()
    await createVerifiedUser()

    const agent = await loginAgent(admin.email, adminPw)
    const res = await agent.get("/api/v1/dashboard/admin/stats")
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("totalUsers")
    expect(res.body.data).toHaveProperty("totalProjects")
    expect(typeof res.body.data.totalUsers).toBe("number")
  })

  it("returns 403 for member accessing admin stats", async () => {
    const { user: member, password: memberPw } = await createVerifiedUser({ role: "member" })
    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.get("/api/v1/dashboard/admin/stats")
    expect(res.status).toBe(403)
  })

  it("allows admin to list all users", async () => {
    const { user: admin, password: adminPw } = await createAdminUser()
    await createVerifiedUser()
    await createVerifiedUser()

    const agent = await loginAgent(admin.email, adminPw)
    const res = await agent.get("/api/v1/dashboard/users")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(3)
  })

  it("returns 403 for member accessing user list", async () => {
    const { user: member, password: memberPw } = await createVerifiedUser()
    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.get("/api/v1/dashboard/users")
    expect(res.status).toBe(403)
  })

  it("admin can update any user's role", async () => {
    const { user: admin, password: adminPw } = await createAdminUser()
    const { user: member } = await createVerifiedUser()

    const agent = await loginAgent(admin.email, adminPw)
    const res = await agent
      .patch(`/api/v1/auth/users/${member._id}/role`)
      .send({ role: "admin" })
    expect(res.status).toBe(200)
    expect(res.body.data.role).toBe("admin")
  })

  it("rejects invalid role values in role update", async () => {
    const { user: admin, password: adminPw } = await createAdminUser()
    const { user: member } = await createVerifiedUser()

    const agent = await loginAgent(admin.email, adminPw)
    const res = await agent
      .patch(`/api/v1/auth/users/${member._id}/role`)
      .send({ role: "superadmin" })
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────
describe("User profile", () => {
  it("GET /api/v1/auth/me returns own profile", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent.get("/api/v1/auth/me")
    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe(user.email)
    expect(res.body.data.password).toBeUndefined()
  })

  it("PATCH profile updates allowed fields", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent
      .patch("/api/v1/auth/profile")
      .send({ fullname: "New Name", bio: "Hello world" })
    expect(res.status).toBe(200)
    expect(res.body.data.fullname).toBe("New Name")
    expect(res.body.data.bio).toBe("Hello world")
  })

  it("cannot update another user's profile", async () => {
    const { user: u1, password: p1 } = await createVerifiedUser()
    const { user: u2 } = await createVerifiedUser()

    const agent = await loginAgent(u1.email, p1)
    // Attempting to target another user's ID
    const res = await agent
      .patch(`/api/v1/auth/profile/${u2._id}`)
      .send({ fullname: "Stolen" })
    // Either 403 or 404 — should not succeed
    expect([403, 404]).toContain(res.status)
  })

  it("DELETE account removes user from DB", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent.delete("/api/v1/auth/account")
    expect(res.status).toBe(200)

    const { User } = await import("../src/models/user.model.js")
    const deleted = await User.findById(user._id)
    expect(deleted).toBeNull()
  })

  it("DELETE account cleans up refresh tokens", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    await agent.delete("/api/v1/auth/account")

    const { default: RefreshToken } = await import("../src/models/refreshToken.model.js")
    const tokens = await RefreshToken.find({ user: user._id })
    expect(tokens.length).toBe(0)
  })

  it("GET active sessions returns current session list", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent.get("/api/v1/auth/sessions")
    expect(res.status).toBe(200)
    expect(res.body.data.count).toBeGreaterThanOrEqual(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────────────────────
describe("Project Notes", () => {
  it("member can create a note", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.post("/api/v1/notes").send({
      content: "Important note",
      projectId: project._id.toString(),
    })
    expect(res.status).toBe(201)
  })

  it("non-member cannot create a note", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: stranger, password: strangerPw } = await createVerifiedUser()
    const project = await createProject(owner)

    const agent = await loginAgent(stranger.email, strangerPw)
    const res = await agent.post("/api/v1/notes").send({
      content: "Intruder note",
      projectId: project._id.toString(),
    })
    expect(res.status).toBe(403)
  })

  it("owner can delete a note", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const { default: ProjectNote } = await import("../src/models/projectnote.model.js")
    const note = await ProjectNote.create({
      content: "Note to delete",
      project: project._id,
      createdBy: owner._id,
    })

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.delete(`/api/v1/notes/${note._id}`)
    expect(res.status).toBe(200)
  })

  it("returns 400 when note content is empty", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/notes").send({
      content: "",
      projectId: project._id.toString(),
    })
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HEALTHCHECK
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/healthcheck", () => {
  it("returns 200 with service status", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("does not require authentication", async () => {
    const res = await request(app).get("/api/v1/healthcheck")
    expect(res.status).not.toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CONCURRENT / RACE CONDITIONS
// ─────────────────────────────────────────────────────────────────────────────
describe("Concurrent registration race condition", () => {
  it("handles simultaneous registrations of the same email gracefully", async () => {
    const data = {
      email: "race@example.com",
      password: "Password123!",
      username: "raceuser",
      fullname: "Race User",
    }

    // Fire 5 concurrent registrations
    const results = await Promise.allSettled([
      request(app).post("/api/v1/auth/register").send(data),
      request(app).post("/api/v1/auth/register").send(data),
      request(app).post("/api/v1/auth/register").send(data),
      request(app).post("/api/v1/auth/register").send(data),
      request(app).post("/api/v1/auth/register").send(data),
    ])

    const { User } = await import("../src/models/user.model.js")
    const userCount = await User.countDocuments({ email: data.email })

    // Only ONE user should exist in the DB regardless of race
    expect(userCount).toBe(1)

    const statuses = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value.status)

    // At most one 201, the rest should be 409 or 429
    const successCount = statuses.filter((s) => s === 201).length
    expect(successCount).toBeLessThanOrEqual(1)
  })
})
