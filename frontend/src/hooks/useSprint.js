import { useCallback, useEffect, useState } from "react"
import apiService from "../../service/apiService.js"

const useSprint = (projectId) => {
  const [sprints, setSprints] = useState([])
  const [currentSprint, setCurrentSprint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSprints = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getSprintsByProject(projectId)
      if (response.success) {
        setSprints(response.data || [])
        const activeSprint = response.data?.find((s) => s.status === "active")
        setCurrentSprint(activeSprint || null)
      }
    } catch (err) {
      setError(err)
      console.error("Failed to fetch sprints:", err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const createSprint = async (sprintData) => {
    const response = await apiService.createSprint({
      ...sprintData,
      projectId,
    })
    if (response.success) {
      setSprints((prev) => [...prev, response.data])
      return response.data
    }
    throw new Error(response.message)
  }

  const startSprint = async (sprintId) => {
    const response = await apiService.startSprint(sprintId, projectId)
    if (response.success) {
      setSprints((prev) =>
        prev.map((s) => {
          if (s.status === "active") {
            return { ...s, status: "completed" }
          }
          if (s._id === sprintId) {
            return { ...s, status: "active" }
          }
          return s
        })
      )
      setCurrentSprint(response.data)
      return response.data
    }
    throw new Error(response.message)
  }

  const completeSprint = async (sprintId, moveTasksTo) => {
    const response = await apiService.completeSprint(sprintId, moveTasksTo)
    if (response.success) {
      setSprints((prev) =>
        prev.map((s) => (s._id === sprintId ? { ...s, status: "completed" } : s))
      )
      setCurrentSprint(null)
      return response.data
    }
    throw new Error(response.message)
  }

  const deleteSprint = async (sprintId) => {
    const response = await apiService.deleteSprint(sprintId)
    if (response.success) {
      setSprints((prev) => prev.filter((s) => s._id !== sprintId))
      if (currentSprint?._id === sprintId) {
        setCurrentSprint(null)
      }
      return response.data
    }
    throw new Error(response.message)
  }

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  return {
    sprints,
    currentSprint,
    loading,
    error,
    fetchSprints,
    createSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    setCurrentSprint,
    setSprints,
  }
}

export default useSprint
