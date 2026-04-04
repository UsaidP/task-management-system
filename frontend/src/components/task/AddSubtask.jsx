import { useState } from "react"

const AddSubtask = ({ onAddSubtask }) => {
  const [title, setTitle] = useState("")

  // Renamed from handleSubmit to be clearer
  const handleAddNewSubtask = () => {
    const trimmedTitle = title.trim()
    if (trimmedTitle) {
      onAddSubtask(trimmedTitle) // Call the prop function
      setTitle("") // Reset input
    }
  }

  // Added onKeyPress handler to capture "Enter"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault() // Stop the parent <form> (in EditTaskModal) from submitting
      handleAddNewSubtask()
    }
  }

  return (
    // FIX 1: Changed <form> to <div>
    <div className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Add a new subtask"
        className="flex-grow p-2 border border-light-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary dark:bg-dark-bg-secondary dark:text-dark-text-primary transition-all duration-fast"
      />
      <button type="button" onClick={handleAddNewSubtask} className="btn-primary px-4 py-2 text-sm">
        Add
      </button>
    </div>
  )
}

export default AddSubtask
