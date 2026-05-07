import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { ArrowRightIcon } from "lucide-react"

const CompleteSprintDialog = ({ isOpen, onClose, onComplete, sprint }) => {
  const [moveOption, setMoveOption] = useState("backlog")
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      await onComplete(moveOption)
    } catch (err) {
      console.error("Failed to complete sprint:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!sprint) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-utility-overlay" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-light-bg-secondary dark:bg-dark-bg-tertiary p-6 shadow-xl transition-all border border-light-border dark:border-dark-border">
                <Dialog.Title className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                  Complete Sprint: {sprint.name}
                </Dialog.Title>

                <div className="mb-6">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    What would you like to do with the incomplete tasks in this sprint?
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-light-border dark:border-dark-border cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
                      <input
                        type="radio"
                        name="moveOption"
                        value="backlog"
                        checked={moveOption === "backlog"}
                        onChange={(e) => setMoveOption(e.target.value)}
                        className="w-4 h-4 text-accent-primary focus:ring-accent-primary/20"
                      />
                      <div>
                        <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                          Move to Backlog
                        </div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          Tasks will be moved back to the project backlog with "To Do" status
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-light-border dark:border-dark-border cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
                      <input
                        type="radio"
                        name="moveOption"
                        value="next"
                        checked={moveOption === "next"}
                        onChange={(e) => setMoveOption(e.target.value)}
                        className="w-4 h-4 text-accent-primary focus:ring-accent-primary/20"
                      />
                      <div>
                        <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                          Move to Next Sprint
                        </div>
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          Tasks will be moved to the next backlog sprint (if one exists)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-accent-success text-white font-medium hover:bg-accent-success/90 disabled:opacity-50 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-success/20"
                  >
                    {loading ? "Completing..." : "Complete Sprint"}
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default CompleteSprintDialog
