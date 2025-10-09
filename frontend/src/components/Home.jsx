import { motion } from "framer-motion"
import React from "react"
import {
	FiArrowRight,
	FiCheckCircle,
	FiShield,
	FiTrello,
	FiTrendingUp,
	FiUsers,
	FiZap,
} from "react-icons/fi"
import { Link } from "react-router-dom"

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, delay }}
		className="card-interactive group"
	>
		<div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-primary to-secondary group-hover:shadow-glow transition-all duration-300">
			{icon}
		</div>
		<h3 className="text-xl font-bold mb-3 text-text-primary group-hover:text-primary transition-colors duration-300">
			{title}
		</h3>
		<p className="text-text-secondary leading-relaxed">{description}</p>
	</motion.div>
)

const StatCard = ({ number, label, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.8 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ duration: 0.6, delay }}
		className="text-center"
	>
		<div className="text-4xl font-bold gradient-text mb-2">{number}</div>
		<div className="text-text-secondary">{label}</div>
	</motion.div>
)

export const Home = () => {
	return (
		<div className="min-h-screen">
			{/* Navigation */}
			<nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="text-2xl font-bold gradient-text"
					>
						TaskFlow
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center space-x-4"
					>
						<Link to="/login" className="btn-ghost">
							Sign In
						</Link>
						<Link to="/register" className="btn-primary">
							Get Started
						</Link>
					</motion.div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-6">
				<div className="max-w-7xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="mb-8"
					>
						<h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
							Manage Tasks with
							<span className="gradient-text block">Stunning Simplicity</span>
						</h1>
						<p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
							Transform your productivity with our beautiful, intuitive task management platform.
							Collaborate seamlessly, track progress effortlessly, and achieve more together.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
					>
						<Link to="/register" className="btn-primary text-lg px-8 py-4 group">
							Start Free Today
							<FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
						</Link>
						<Link to="/login" className="btn-ghost text-lg px-8 py-4">
							Sign In
						</Link>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
					>
						<StatCard number="10K+" label="Active Users" delay={0.5} />
						<StatCard number="50K+" label="Tasks Completed" delay={0.6} />
						<StatCard number="99.9%" label="Uptime" delay={0.7} />
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-6">
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center mb-16"
					>
						<h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
							Everything You Need
						</h2>
						<p className="text-xl text-text-secondary max-w-3xl mx-auto">
							Powerful features designed to streamline your workflow and boost team productivity
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<FeatureCard
							icon={<FiTrello className="w-6 h-6 text-white" />}
							title="Kanban Boards"
							description="Visualize your workflow with beautiful, drag-and-drop Kanban boards that make project management intuitive and engaging."
							delay={0.1}
						/>
						<FeatureCard
							icon={<FiUsers className="w-6 h-6 text-white" />}
							title="Team Collaboration"
							description="Work together seamlessly with real-time updates, member management, and role-based permissions for every project."
							delay={0.2}
						/>
						<FeatureCard
							icon={<FiZap className="w-6 h-6 text-white" />}
							title="Lightning Fast"
							description="Experience blazing-fast performance with instant updates, smooth animations, and responsive design across all devices."
							delay={0.3}
						/>
						<FeatureCard
							icon={<FiCheckCircle className="w-6 h-6 text-white" />}
							title="Smart Subtasks"
							description="Break down complex tasks into manageable subtasks with progress tracking and completion status indicators."
							delay={0.4}
						/>
						<FeatureCard
							icon={<FiShield className="w-6 h-6 text-white" />}
							title="Secure & Private"
							description="Your data is protected with enterprise-grade security, encrypted connections, and privacy-first architecture."
							delay={0.5}
						/>
						<FeatureCard
							icon={<FiTrendingUp className="w-6 h-6 text-white" />}
							title="Progress Analytics"
							description="Track your productivity with detailed analytics, completion rates, and performance insights for continuous improvement."
							delay={0.6}
						/>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-4xl mx-auto text-center card"
				>
					<h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
						Ready to Transform Your Workflow?
					</h2>
					<p className="text-xl text-text-secondary mb-8 leading-relaxed">
						Join thousands of teams who have already revolutionized their productivity with
						TaskFlow. Start your journey today, completely free.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link to="/register" className="btn-primary text-lg px-8 py-4 group">
							Get Started Free
							<FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
						</Link>
						<p className="text-sm text-text-muted">No credit card required • Free forever</p>
					</div>
				</motion.div>
			</section>

			{/* Footer */}
			<footer className="py-12 px-6 border-t border-border">
				<div className="max-w-7xl mx-auto text-center">
					<div className="text-2xl font-bold gradient-text mb-4">TaskFlow</div>
					<p className="text-text-muted">
						© {new Date().getFullYear()} TaskFlow. Crafted with ❤️ for productive teams.
					</p>
				</div>
			</footer>
		</div>
	)
}
