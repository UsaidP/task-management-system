import { createContext, useContext, useMemo, useState } from "react"

const FilterContext = createContext()

export const FilterProvider = ({ children }) => {
  const [projectFilter, setProjectFilter] = useState(null)
  const [sprintFilter, setSprintFilter] = useState(null)

  // ✅ Memoize the value object so identity is stable
  // Only changes when any of these values actually change
  const value = useMemo(
    () => ({
      projectFilter,
      sprintFilter,
      setProjectFilter,
      setSprintFilter,
      clearFilters: () => {
        setProjectFilter(null)
        setSprintFilter(null)
      },
    }),
    [projectFilter, sprintFilter]
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export const useFilter = () => useContext(FilterContext)
