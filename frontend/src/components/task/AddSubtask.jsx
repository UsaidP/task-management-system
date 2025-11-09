import React, { useState } from "react"

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
        onKeyPress={handleKeyPress} // FIX 3: Added onKeyPress
        placeholder="Add a new subtask"
        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
      />
      <button
        type="button" // FIX 2: Changed type to "button"
        onClick={handleAddNewSubtask} // FIX 2: Added onClick handler
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Add
      </button>
    </div>
  )
}

export default AddSubtask
