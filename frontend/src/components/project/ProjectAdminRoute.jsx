import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Navigate, useParams } from "react-router-dom"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"

const ProjectAdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const { id: projectId } = useParams()
  const [hasAccess, setHasAccess] = useState(null)

  useEffect(() => {
    if (!user || !projectId) {
      setHasAccess(false)
      return
    }

    const checkPermission = async () => {
      try {
        const response = await apiService.getProjectAdminStats(projectId)
        if (response.success) {
          setHasAccess(true)
        } else {
          setHasAccess(false)
        }
      } catch {
        setHasAccess(false)
      }
    }

    checkPermission()
  }, [user, projectId])

  if (loading || hasAccess === null) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasAccess) {
    toast.error("You don't have permission to access this page")
    return <Navigate to={`/project/${projectId}`} replace />
  }

  return children
}

export default ProjectAdminRoute
