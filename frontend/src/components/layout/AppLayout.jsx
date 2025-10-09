import React from "react"
import { Toaster } from "react-hot-toast"
import { Outlet } from "react-router-dom"
import Layout from "../Layout"

const AppLayout = () => {
	return (
		<Layout>
			<Toaster position="top-center" reverseOrder={false} />
			<Outlet />
		</Layout>
	)
}

export default AppLayout
