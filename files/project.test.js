/**
 * tests/project.test.js
 * Project CRUD, member management, and full two-level RBAC matrix.
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
} from "./setup.js"

beforeAll(connectTestDB)
afterAll(disconnectTestDB)
beforeEach(clearDB)

// ── Helpers ───────────────────────────────────────────────────────────────────

const loginAgent = async (email, password) => {
  const agent = request.agent(app)
  await agent.post("/api/v1/auth/login").send({ identifier: email, password })
  return agent
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CRUD
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/projects — create", () => {
  it("creates a project and auto-assigns creator as owner", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)

    const res = await agent
      .post("/api/v1/projects")
      .send({ name: "My Project", description: "desc" })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe("My Project")
    expect(res.body.data.createdBy.toString()).toBe(user._id.toString())
  })

  it("returns 400 when name is missing", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent.post("/api/v1/projects").send({ description: "no name" })
    expect(res.status).toBe(400)
  })

  it("returns 409 for duplicate project name by same user", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    await agent.post("/api/v1/projects").send({ name: "Duplicate" })
    const res = await agent.post("/api/v1/projects").send({ name: "Duplicate" })
    expect(res.status).toBe(409)
  })

  it("allows two users to have projects with the same name", async () => {
    const { user: u1, password: p1 } = await createVerifiedUser()
    const { user: u2, password: p2 } = await createVerifiedUser()
    const a1 = await loginAgent(u1.email, p1)
    const a2 = await loginAgent(u2.email, p2)

    await a1.post("/api/v1/projects").send({ name: "SharedName" })
    const res = await a2.post("/api/v1/projects").send({ name: "SharedName" })
    expect(res.status).toBe(201)
  })

  it("returns 401 for unauthenticated request", async () => {
    const res = await request(app).post("/api/v1/projects").send({ name: "X" })
    expect(res.status).toBe(401)
  })
})

describe("GET /api/v1/projects — list", () => {
  it("returns only projects the user is a member of", async () => {
    const { user: u1, password: p1 } = await createVerifiedUser()
    const { user: u2, password: p2 } = await createVerifiedUser()
    await createProject(u1)
    await createProject(u2)

    const agent = await loginAgent(u1.email, p1)
    const res = await agent.get("/api/v1/projects")
    expect(res.status).toBe(200)
    res.body.data.forEach((p) => {
      expect(p.createdBy.toString()).toBe(u1._id.toString())
    })
  })

  it("returns empty array when user has no projects", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent.get("/api/v1/projects")
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })
})

describe("GET /api/v1/projects/:id — single", () => {
  it("returns project for a member", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.get(`/api/v1/projects/${project._id}`)
    expect(res.status).toBe(200)
  })

  it("returns 403 for a non-member trying to access a project", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: stranger, password: strangerPw } = await createVerifiedUser()
    const project = await createProject(owner)

    const agent = await loginAgent(stranger.email, strangerPw)
    const res = await agent.get(`/api/v1/projects/${project._id}`)
    expect(res.status).toBe(403)
  })

  it("returns 404 for non-existent project ID", async () => {
    const { user, password } = await createVerifiedUser()
    const agent = await loginAgent(user.email, password)
    const res = await agent.get("/api/v1/projects/000000000000000000000000")
    expect(res.status).toBe(404)
  })
})

describe("PUT /api/v1/projects/:id — update", () => {
  it("allows owner to update project", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent
      .put(`/api/v1/projects/${project._id}`)
      .send({ name: "Updated Name" })
    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe("Updated Name")
  })

  it("allows project_admin to update project", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: padmin, password: padminPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, padmin._id, "project_admin")

    const agent = await loginAgent(padmin.email, padminPw)
    const res = await agent
      .put(`/api/v1/projects/${project._id}`)
      .send({ name: "Admin Updated" })
    expect(res.status).toBe(200)
  })

  it("denies member from updating project", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent
      .put(`/api/v1/projects/${project._id}`)
      .send({ name: "Member Attempt" })
    expect(res.status).toBe(403)
  })
})

describe("DELETE /api/v1/projects/:id — delete", () => {
  it("allows owner to delete their project", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.delete(`/api/v1/projects/${project._id}`)
    expect(res.status).toBe(200)
  })

  it("denies project_admin from deleting project", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: padmin, password: padminPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, padmin._id, "project_admin")

    const agent = await loginAgent(padmin.email, padminPw)
    const res = await agent.delete(`/api/v1/projects/${project._id}`)
    expect(res.status).toBe(403)
  })

  it("denies member from deleting project", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.delete(`/api/v1/projects/${project._id}`)
    expect(res.status).toBe(403)
  })

  it("allows global admin to delete any project", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: admin, password: adminPw } = await createAdminUser()
    const project = await createProject(owner)

    const agent = await loginAgent(admin.email, adminPw)
    const res = await agent.delete(`/api/v1/projects/${project._id}`)
    expect(res.status).toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/members — add member", () => {
  it("allows owner to add a member", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: newMember } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/members").send({
      projectId: project._id.toString(),
      userId: newMember._id.toString(),
      role: "member",
    })
    expect(res.status).toBe(201)
  })

  it("denies regular member from adding members", async () => {
    const { user: owner } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const { user: newUser } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, member._id, "member")

    const agent = await loginAgent(member.email, memberPw)
    const res = await agent.post("/api/v1/members").send({
      projectId: project._id.toString(),
      userId: newUser._id.toString(),
      role: "member",
    })
    expect(res.status).toBe(403)
  })

  it("returns 400 when adding a user who is already a member", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: existingMember } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    await addMember(project._id, existingMember._id, "member")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/members").send({
      projectId: project._id.toString(),
      userId: existingMember._id.toString(),
      role: "member",
    })
    expect(res.status).toBe(409)
  })

  it("cannot add a non-existent user as member", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.post("/api/v1/members").send({
      projectId: project._id.toString(),
      userId: "000000000000000000000000",
      role: "member",
    })
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/v1/members/:id — remove member", () => {
  it("allows owner to remove a member", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: member } = await createVerifiedUser()
    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    const memberRecord = await addMember(project._id, member._id, "member")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.delete(`/api/v1/members/${memberRecord._id}`)
    expect(res.status).toBe(200)
  })

  it("prevents owner from removing themselves (must transfer first)", async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const project = await createProject(owner)
    const ownerRecord = await addMember(project._id, owner._id, "owner")

    const agent = await loginAgent(owner.email, ownerPw)
    const res = await agent.delete(`/api/v1/members/${ownerRecord._id}`)
    // Should not allow owner to leave without transferring ownership
    expect(res.status).not.toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RBAC PERMISSION MATRIX
// ─────────────────────────────────────────────────────────────────────────────
describe("RBAC permission matrix", () => {
  const setupProjectWithRoles = async () => {
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: padmin, password: padminPw } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()
    const { user: admin, password: adminPw } = await createAdminUser()

    const project = await createProject(owner)
    await addMember(project._id, owner._id, "owner")
    await addMember(project._id, padmin._id, "project_admin")
    await addMember(project._id, member._id, "member")

    return {
      project,
      owner: { user: owner, password: ownerPw },
      padmin: { user: padmin, password: padminPw },
      member: { user: member, password: memberPw },
      admin: { user: admin, password: adminPw },
    }
  }

  it("MATRIX: edit project — owner✅ padmin✅ member❌", async () => {
    const { project, owner, padmin, member } = await setupProjectWithRoles()
    const ownerAgent = await loginAgent(owner.user.email, owner.password)
    const padminAgent = await loginAgent(padmin.user.email, padmin.password)
    const memberAgent = await loginAgent(member.user.email, member.password)

    expect((await ownerAgent.put(`/api/v1/projects/${project._id}`).send({ name: "A" })).status).toBe(200)
    expect((await padminAgent.put(`/api/v1/projects/${project._id}`).send({ name: "B" })).status).toBe(200)
    expect((await memberAgent.put(`/api/v1/projects/${project._id}`).send({ name: "C" })).status).toBe(403)
  })

  it("MATRIX: delete project — owner✅ padmin❌ member❌", async () => {
    // Need separate projects since delete is destructive
    const { user: owner, password: ownerPw } = await createVerifiedUser()
    const { user: padmin, password: padminPw } = await createVerifiedUser()
    const { user: member, password: memberPw } = await createVerifiedUser()

    const p1 = await createProject(owner, { name: "p1" })
    await addMember(p1._id, owner._id, "owner")
    await addMember(p1._id, padmin._id, "project_admin")

    const p2 = await createProject(owner, { name: "p2" })
    await addMember(p2._id, member._id, "member")

    const padminAgent = await loginAgent(padmin.email, padminPw)
    const memberAgent = await loginAgent(member.email, memberPw)
    const ownerAgent = await loginAgent(owner.email, ownerPw)

    expect((await padminAgent.delete(`/api/v1/projects/${p1._id}`)).status).toBe(403)
    expect((await memberAgent.delete(`/api/v1/projects/${p2._id}`)).status).toBe(403)
    expect((await ownerAgent.delete(`/api/v1/projects/${p1._id}`)).status).toBe(200)
  })
})
