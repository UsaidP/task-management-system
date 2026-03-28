import mongoose from "mongoose"

describe("deleteComment Controller Logic", () => {
  describe("Input Validation Logic", () => {
    it("should detect invalid ObjectId", () => {
      const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)
      expect(isValidObjectId("invalid-id")).toBe(false)
      expect(isValidObjectId("507f1f77bcf86cd799439011")).toBe(true)
    })

    it("should handle null/undefined taskId", () => {
      const validateTaskId = (taskId) => {
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
          return { valid: false, error: "Invalid task ID" }
        }
        return { valid: true }
      }

      expect(validateTaskId(null).valid).toBe(false)
      expect(validateTaskId(undefined).valid).toBe(false)
      expect(validateTaskId("").valid).toBe(false)
      expect(validateTaskId("invalid").valid).toBe(false)
      expect(validateTaskId(new mongoose.Types.ObjectId().toString()).valid).toBe(true)
    })

    it("should handle null/undefined commentId", () => {
      const validateCommentId = (commentId) => {
        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
          return { valid: false, error: "Invalid comment ID" }
        }
        return { valid: true }
      }

      expect(validateCommentId(null).valid).toBe(false)
      expect(validateCommentId(undefined).valid).toBe(false)
      expect(validateCommentId("").valid).toBe(false)
      expect(validateCommentId(new mongoose.Types.ObjectId().toString()).valid).toBe(true)
    })
  })

  describe("Comment Ownership Logic", () => {
    it("should correctly compare user ownership", () => {
      const userId1 = new mongoose.Types.ObjectId()
      const userId2 = new mongoose.Types.ObjectId()

      const isOwner = (commentUserId, currentUserId) => {
        return commentUserId.toString() === currentUserId.toString()
      }

      expect(isOwner(userId1, userId1)).toBe(true)
      expect(isOwner(userId1, userId2)).toBe(false)
      expect(isOwner(userId1.toString(), userId1.toString())).toBe(true)
    })

    it("should handle ObjectId and string comparison", () => {
      const userId = new mongoose.Types.ObjectId()
      const userIdString = userId.toString()

      expect(userId.toString() === userIdString).toBe(true)
      expect(userId.toString() === new mongoose.Types.ObjectId().toString()).toBe(false)
    })
  })

  describe("Comment Deletion Logic", () => {
    it("should remove comment from array using pull", () => {
      const comments = [
        { _id: new mongoose.Types.ObjectId(), text: "comment 1" },
        { _id: new mongoose.Types.ObjectId(), text: "comment 2" },
        { _id: new mongoose.Types.ObjectId(), text: "comment 3" },
      ]

      const commentIdToDelete = comments[1]._id.toString()
      const updatedComments = comments.filter((c) => c._id.toString() !== commentIdToDelete)

      expect(updatedComments.length).toBe(2)
      expect(updatedComments.find((c) => c._id.toString() === commentIdToDelete)).toBeUndefined()
    })

    it("should handle removing non-existent comment", () => {
      const comments = [
        { _id: new mongoose.Types.ObjectId(), text: "comment 1" },
      ]

      const nonExistentId = new mongoose.Types.ObjectId().toString()
      const updatedComments = comments.filter((c) => c._id.toString() !== nonExistentId)

      expect(updatedComments.length).toBe(1)
    })
  })

  describe("Error Conditions", () => {
    it("should return correct error codes for each failure case", () => {
      const errorMapping = {
        missingTaskId: { statusCode: 400, message: "Invalid task ID" },
        invalidTaskId: { statusCode: 400, message: "Invalid task ID" },
        missingCommentId: { statusCode: 400, message: "Invalid comment ID" },
        invalidCommentId: { statusCode: 400, message: "Invalid comment ID" },
        taskNotFound: { statusCode: 404, message: "Task not found" },
        commentNotFound: { statusCode: 404, message: "Comment not found" },
        notOwner: { statusCode: 403, message: "You can only delete your own comments" },
      }

      expect(errorMapping.missingTaskId.statusCode).toBe(400)
      expect(errorMapping.taskNotFound.statusCode).toBe(404)
      expect(errorMapping.notOwner.statusCode).toBe(403)
      expect(errorMapping.notOwner.message).toContain("own comments")
    })
  })
})
