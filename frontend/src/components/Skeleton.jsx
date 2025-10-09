import React from "react"

const Skeleton = ({ className }) => (
	<div className={`bg-surface-light animate-pulse rounded-md ${className}`} />
)

export default Skeleton
