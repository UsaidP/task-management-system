import { createContext, useContext, useState } from "react"

const FilterContext = createContext()

export const FilterProvider = ({ children }) => {
  const [projectFilter, setProjectFilter] = useState(null)
  const [sprintFilter, setSprintFilter] = useState(null)

  const clearFilters = () => {
    setProjectFilter(null)
    setSprintFilter(null)
  }

  return (
    <FilterContext.Provider
      value={{
        projectFilter,
        sprintFilter,
        setProjectFilter,
        setSprintFilter,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export const useFilter = () => useContext(FilterContext)
