import Skeleton from "../Skeleton"

const TaskCardSkeleton = () => (
  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/6" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-6 w-12 rounded-full" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
)

export default TaskCardSkeleton
