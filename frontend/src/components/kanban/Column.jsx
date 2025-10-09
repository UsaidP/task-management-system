import React from "react"
import { useDrop } from "react-dnd"

const Column = ({ children, status, onDrop }) => {
	const [{ isOver }, drop] = useDrop(() => ({
		accept: "task",
		drop: (item) => onDrop(item, status),
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
		}),
	}))

	return (
		<div
			ref={drop}
			className={`w-80 flex-shrink-0 rounded-xl transition-colors duration-300 ${
				isOver ? "bg-primary/10" : ""
			}`}
		>
			{children}
		</div>
	)
}

export default Column
