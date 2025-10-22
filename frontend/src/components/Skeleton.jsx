const Skeleton = ({ className }) => (
  <div className={`bg-slate-100 animate-pulse rounded-md ${className}`} />
)

// Create this new component for your header's skeleton state
export const HeaderSkeleton = () => (
  <div className="flex items-center justify-between animate-pulse">
    {/* Left side of the header */}
    <div>
      {/* Mimics the "Good morning, User!" h1 tag */}
      <div className="h-10 bg-slate-100 rounded-lg w-64 mb-3"></div>

      {/* Mimics the "Here's what's happening..." p tag */}
      <div className="h-6 bg-slate-100 rounded-lg w-80"></div>
    </div>

    {/* Right side of the header (date) */}
    {/* "hidden md:block" makes it responsive, hiding on small screens */}
    <div className="hidden md:block h-6 bg-slate-100 rounded-lg w-48"></div>
  </div>
)
export default Skeleton
