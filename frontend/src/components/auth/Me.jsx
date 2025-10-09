import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../service/apiService.js"

const Me = () => {
	const [userProfile, setUserProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [selectedFile, setSelectedFile] = useState(null)
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef(null)

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				setLoading(true)
				const response = await apiService.getUserProfile()
				setUserProfile(response.data || null)
			} catch (err) {
				console.error("Error fetching user profile:", err)
				setError(err.data?.message || "Could not retrieve user profile. Please try again.")
			} finally {
				setLoading(false)
			}
		}

		fetchUserProfile()
	}, [])

	const handleFileChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setSelectedFile(file)
		}
	}

	const handleUpload = async () => {
		if (!selectedFile) {
			toast.error("Please select a file first.")
			return
		}

		setIsUploading(true)
		const toastId = toast.loading("Uploading avatar...")
		const formData = new FormData()
		formData.append("avatar", selectedFile)

		try {
			const response = await apiService.updateAvatar(formData)

			if (response.success) {
				setUserProfile(response.data)
				toast.success("Avatar updated successfully!", { id: toastId })
				setSelectedFile(null)
			}
		} catch (err) {
			const errorMessage = err.data?.message || "Failed to upload avatar."
			toast.error(errorMessage, { id: toastId })
		} finally {
			setIsUploading(false)
		}
	}

	if (loading) {
		return <div className="p-5 text-center text-lg">Loading profile...</div>
	}

	if (error) {
		return (
			<div className="p-5 text-center text-red-500 bg-red-100 border border-red-400 rounded-md">
				{error}
			</div>
		)
	}

	if (!userProfile) {
		return <div className="p-5 text-center">No user profile found. Please log in again.</div>
	}

	const {
		fullname = "N/A",
		username = "N/A",
		email = "N/A",
		role = "User",
		isEmailVerified,
	} = userProfile
	const isVerified = isEmailVerified ? "Yes" : "No"

	return (
		<div className="w-full max-w-2xl mx-auto mt-8">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
				<div className="p-8">
					<div className="text-center mb-8">
						<img
							className="w-24 h-24 rounded-full mx-auto border-4 border-gray-200 dark:border-gray-700 shadow-lg"
							src={userProfile.avatar?.url || `https://i.pravatar.cc/150?u=${username}`}
							alt={`${fullname}'s avatar`}
						/>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{fullname}</h1>
						<p className="text-md text-gray-500 dark:text-gray-400">@{username}</p>
					</div>

					<div className="space-y-2 mb-6">
						<input
							type="file"
							accept="image/*"
							ref={fileInputRef}
							onChange={handleFileChange}
							className="hidden"
						/>
						<button onClick={() => fileInputRef.current.click()} className="w-full btn-secondary">
							Change Avatar
						</button>
						{selectedFile && (
							<div className="text-center text-sm text-gray-500 mt-2">
								Selected: {selectedFile.name}
							</div>
						)}
						{selectedFile && (
							<button
								onClick={handleUpload}
								disabled={isUploading}
								className="w-full btn-primary mt-2"
							>
								{isUploading ? "Uploading..." : "Upload New Image"}
							</button>
						)}
					</div>

					<div className="space-y-4">
						<ProfileDetail label="Email" value={email} />
						<ProfileDetail label="Role" value={role} />
						<ProfileDetail label="Email Verified" value={isVerified} />
					</div>
				</div>
			</div>
		</div>
	)
}

const ProfileDetail = ({ label, value }) => (
	<div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
		<span className="text-md font-medium text-gray-600 dark:text-gray-400">{label}</span>
		<span className="text-md text-gray-900 dark:text-white font-semibold">{value}</span>
	</div>
)

export default Me
