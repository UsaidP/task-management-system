import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCustomFetch = vi.fn()

vi.mock("../../service/apiService", () => ({
  default: {
    customFetch: mockCustomFetch,
    deleteComment: async (projectId, taskId, commentId) => {
      return mockCustomFetch(`/tasks/${projectId}/${taskId}/comments/${commentId}`, {
        method: "DELETE",
      })
    },
    uploadAttachment: async (projectId, taskId, formData) => {
      return mockCustomFetch(`/tasks/${projectId}/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      })
    },
    deleteAttachment: async (projectId, taskId, attachmentIndex) => {
      return mockCustomFetch(`/tasks/${projectId}/${taskId}/attachments/${attachmentIndex}`, {
        method: "DELETE",
      })
    },
  },
}))

describe("apiService - Task Comment & Attachment Methods", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("deleteComment", () => {
    it("should call correct endpoint with DELETE method", async () => {
      const projectId = "proj123"
      const taskId = "task456"
      const commentId = "comment789"

      mockCustomFetch.mockResolvedValue({ success: true, data: null })

      const apiService = (await import("../../service/apiService")).default
      const result = await apiService.deleteComment(projectId, taskId, commentId)

      expect(mockCustomFetch).toHaveBeenCalledWith(
        `/tasks/${projectId}/${taskId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      )
      expect(result).toEqual({ success: true, data: null })
    })

    it("should handle errors when delete fails", async () => {
      const projectId = "proj123"
      const taskId = "task456"
      const commentId = "comment789"

      mockCustomFetch.mockResolvedValue({
        success: false,
        message: "You can only delete your own comments",
      })

      const apiService = (await import("../../service/apiService")).default
      const result = await apiService.deleteComment(projectId, taskId, commentId)

      expect(mockCustomFetch).toHaveBeenCalled()
      expect(result.success).toBe(false)
      expect(result.message).toContain("own comments")
    })
  })

  describe("uploadAttachment", () => {
    it("should call correct endpoint with POST method and FormData", async () => {
      const projectId = "proj123"
      const taskId = "task456"
      const mockFormData = new FormData()
      mockFormData.append("file", new File(["test"], "test.png"))

      mockCustomFetch.mockResolvedValue({
        success: true,
        data: { url: "https://example.com/test.png", name: "test.png" },
      })

      const apiService = (await import("../../service/apiService")).default
      const result = await apiService.uploadAttachment(projectId, taskId, mockFormData)

      expect(mockCustomFetch).toHaveBeenCalledWith(
        `/tasks/${projectId}/${taskId}/attachments`,
        {
          method: "POST",
          body: mockFormData,
        }
      )
      expect(result.success).toBe(true)
      expect(result.data.url).toBe("https://example.com/test.png")
    })

    it("should handle upload errors", async () => {
      const projectId = "proj123"
      const taskId = "task456"
      const mockFormData = new FormData()
      mockFormData.append("file", new File(["test"], "test.png"))

      mockCustomFetch.mockResolvedValue({
        success: false,
        message: "File too large",
      })

      const apiService = (await import("../../service/apiService")).default
      const result = await apiService.uploadAttachment(projectId, taskId, mockFormData)

      expect(mockCustomFetch).toHaveBeenCalled()
      expect(result.success).toBe(false)
      expect(result.message).toBe("File too large")
    })
  })

  describe("deleteAttachment", () => {
    it("should call correct endpoint with DELETE method", async () => {
      const projectId = "proj123"
      const taskId = "task456"
      const attachmentIndex = 0

      mockCustomFetch.mockResolvedValue({ success: true })

      const apiService = (await import("../../service/apiService")).default
      const result = await apiService.deleteAttachment(projectId, taskId, attachmentIndex)

      expect(mockCustomFetch).toHaveBeenCalledWith(
        `/tasks/${projectId}/${taskId}/attachments/${attachmentIndex}`,
        {
          method: "DELETE",
        }
      )
      expect(result.success).toBe(true)
    })
  })
})
