import Skeleton from "../Skeleton"

const ProjectCardSkeleton = () => {
  return (
    <div className="p-6 bg-slate-100 rounded-lg shadow-md">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mt-2" />
    </div>
  )
}

export default ProjectCardSkeleton
