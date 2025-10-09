import { motion } from "framer-motion"
import { useState } from "react"
import { FiArrowRight, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

const PasswordStrengthIndicator = ({ password }) => {
	const getStrength = (password) => {
		let strength = 0
		if (password.length >= 8) strength++
		if (/[A-Z]/.test(password)) strength++
		if (/[a-z]/.test(password)) strength++
		if (/[0-9]/.test(password)) strength++
		if (/[^A-Za-z0-9]/.test(password)) strength++
		return strength
	}

	const strength = getStrength(password)
	const getColor = () => {
		if (strength <= 2) return "bg-error"
		if (strength <= 3) return "bg-warning"
		return "bg-success"
	}

	const getLabel = () => {
		if (strength <= 2) return "Weak"
		if (strength <= 3) return "Medium"
		return "Strong"
	}

	if (!password) return null

	return (
		<div className="mt-2">
			<div className="flex items-center space-x-2 mb-1">
				<div className="flex-1 bg-surface-light rounded-full h-2">
					<div
						className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
						style={{ width: `${(strength / 5) * 100}%` }}
					/>
				</div>
				<span
					className={`text-xs font-medium ${
						strength <= 2 ? "text-error" : strength <= 3 ? "text-warning" : "text-success"
					}`}
				>
					{getLabel()}
				</span>
			</div>
		</div>
	)
}

export const Signup = () => {
	const [formData, setFormData] = useState({
		username: "",
		fullname: "",
		email: "",
		password: "",
		role: "",
		avatar: "",
	})

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const navigate = useNavigate()
	const { signup } = useAuth()

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError("")

		try {
			const { username, fullname, email, password } = formData
			const response = await signup(username, fullname, password, email, "member")
			if (response.success) {
				navigate("/confirm", { state: { email: formData.email } })
			}
		} catch (err) {
			const errorMessage = err.data?.message || "Signup failed. Please try again."
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center p-24 justify-center ">
			<div className="w-full max-w-xl  p-8 space-y-6 bg-surface card">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-8"
				>
					<Link to="/" className="inline-block">
						<h1 className="text-3xl font-bold text-purple-50 gradient-text mb-2">TaskFlow</h1>
					</Link>
					<p className="text-text-secondary">
						Create your account and start managing tasks like a pro.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="fullname"
									className="block text-sm font-medium text-text-primary mb-2"
								>
									Full Name
								</label>
								<div className="relative">
									<FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
									<input
										type="text"
										name="fullname"
										id="fullname"
										placeholder="Full Name"
										onChange={handleChange}
										value={formData.fullname}
										required
										className="input-field pl-12"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-text-primary mb-2"
								>
									Username
								</label>
								<div className="relative">
									<FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
									<input
										type="text"
										name="username"
										id="username"
										placeholder="username"
										onChange={handleChange}
										value={formData.username}
										required
										className="input-field pl-12"
									/>
								</div>
							</div>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
								Email Address
							</label>
							<div className="relative">
								<FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
								<input
									type="email"
									name="email"
									id="email"
									placeholder="name@example.com"
									onChange={handleChange}
									value={formData.email}
									required
									className="input-field pl-12"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-text-primary mb-2"
							>
								Password
							</label>
							<div className="relative">
								<FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									id="password"
									placeholder="Create a strong password"
									onChange={handleChange}
									value={formData.password}
									required
									className="input-field pl-12 pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
								>
									{showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
								</button>
							</div>
							<PasswordStrengthIndicator password={formData.password} />
						</div>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
							>
								{error}
							</motion.div>
						)}

						<div className="text-xs text-text-muted space-y-2">
							<div className="flex items-center space-x-2">
								<FiCheck className="w-4 h-4 text-success" />
								<span>Free forever, no credit card required</span>
							</div>
							<div className="flex items-center space-x-2">
								<FiCheck className="w-4 h-4 text-success" />
								<span>Unlimited projects and tasks</span>
							</div>
						</div>

						<button type="submit" disabled={loading} className="w-full btn-primary group">
							{loading ? (
								<div className="flex items-center justify-center">
									<div className="loading-dots">
										<div />
										<div />
										<div />
									</div>
								</div>
							) : (
								<div className="flex items-center justify-center">
									Create Account
									<FiArrowRight className=" flex  ml-2 group-hover:translate-x-1 transition-transform" />
								</div>
							)}
						</button>
					</form>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="text-center mt-6"
				>
					<p className="text-text-secondary">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-primary hover:text-primary-light transition-colors font-medium"
						>
							Sign in
						</Link>
					</p>
				</motion.div>
			</div>
		</div>
	)
}
