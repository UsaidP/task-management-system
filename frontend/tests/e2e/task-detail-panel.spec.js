import { test, expect } from "@playwright/test"

test.describe("Task Detail Panel (Phase 5)", () => {
  const testTask = {
    _id: "test-task-1",
    title: "Test Task for Panel",
    description: "Testing panel functionality",
    status: "todo",
    priority: "high",
    projectId: "test-project",
  }

  test.beforeEach(async ({ page }) => {
    await page.goto("/board?project=test-project")

    const taskCard = page.locator('[data-task-id="test-task-1"]').first()
    if (await taskCard.isVisible()) {
      await taskCard.click()
    }
  })

  test("TDP-01: Opens side panel from right when task clicked", async ({ page }) => {
    await page.goto("/board?project=test-project")

    await page.locator('[data-task-id="test-task-1"]').first().click()

    const panel = page.locator('[data-testid="task-detail-panel"]')
    await expect(panel).toBeVisible()

    const panelPosition = await panel.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return rect.right
    })
    const viewportWidth = page.viewportSize()?.width || 1920
    expect(panelPosition).toBeGreaterThan(viewportWidth * 0.7)
  })

  test("TDP-02: Inline editing saves on blur", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    const titleInput = page.locator('[data-testid="task-title-input"]')
    await expect(titleInput).toBeVisible()

    await titleInput.fill("Updated Title")
    await titleInput.blur()

    const response = await page.waitForResponse(
      (resp) => resp.url().includes("/tasks/") && resp.request().method() === "PUT"
    )
    expect(response.ok()).toBeTruthy()
  })

  test("TDP-03: Can add, complete, delete subtasks", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    await page.click('button:has-text("Subtasks")')

    const subtaskInput = page.locator('[data-testid="subtask-input"]')
    await subtaskInput.fill("New subtask")
    await subtaskInput.press("Enter")

    const subtaskItem = page.locator('[data-testid="subtask-item"]').first()
    await expect(subtaskItem).toContainText("New subtask")

    const checkbox = subtaskItem.locator('input[type="checkbox"]')
    await checkbox.check()

    const deleteBtn = subtaskItem.locator('button:has([data-testid="trash-icon"])')
    await deleteBtn.click()

    await expect(subtaskItem).not.toBeVisible()
  })

  test("TDP-04: Can add comment", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    await page.click('button:has-text("Comments")')

    const commentInput = page.locator('[data-testid="comment-input"]')
    await commentInput.fill("Test comment")

    const submitBtn = page.locator('button:has-text("Send")')
    await submitBtn.click()

    const commentItem = page.locator('[data-testid="comment-item"]').first()
    await expect(commentItem).toContainText("Test comment")
  })

  test("TDP-05: Can delete own comment", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    await page.click('button:has-text("Comments")')

    const commentItem = page.locator('[data-testid="comment-item"]').first()
    await expect(commentItem).toBeVisible()

    await commentItem.hover()

    const deleteBtn = commentItem.locator('button:has([data-testid="trash-icon"])')
    await expect(deleteBtn).toBeVisible()

    await deleteBtn.click()

    await expect(commentItem).not.toBeVisible()
  })

  test("TDP-06: Can upload attachment", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    await page.click('button:has-text("Attachments")')

    const uploadBtn = page.locator('button:has-text("Add Attachment")')
    await expect(uploadBtn).toBeVisible()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: "test-file.txt",
      mimeType: "text/plain",
      content: "test content",
    })

    const attachmentItem = page.locator('[data-testid="attachment-item"]').first()
    await expect(attachmentItem).toBeVisible()
  })

  test("TDP-07: Can add/remove assignees", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    const assigneeSection = page.locator('[data-testid="assignee-section"]')
    await assigneeSection.click()

    const userOption = page.locator('[data-testid="assignee-option"]').first()
    await userOption.click()

    const assigneeChip = page.locator('[data-testid="assignee-chip"]').first()
    await expect(assigneeChip).toBeVisible()

    await assigneeChip.hover()
    const removeBtn = assigneeChip.locator('button:has([data-testid="x-icon"])')
    await removeBtn.click()

    await expect(assigneeChip).not.toBeVisible()
  })

  test("TDP-08: Panel closes on X click", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    const panel = page.locator('[data-testid="task-detail-panel"]')
    await expect(panel).toBeVisible()

    const closeBtn = page.locator('[data-testid="panel-close-btn"]')
    await closeBtn.click()

    await expect(panel).not.toBeVisible()
  })

  test("TDP-08: Panel closes on backdrop click", async ({ page }) => {
    await page.goto("/board?project=test-project")
    await page.locator('[data-task-id="test-task-1"]').first().click()

    const panel = page.locator('[data-testid="task-detail-panel"]')
    await expect(panel).toBeVisible()

    const backdrop = page.locator('[data-testid="panel-backdrop"]')
    await backdrop.click({ position: { x: 10, y: 10 } })

    await expect(panel).not.toBeVisible()
  })
})
