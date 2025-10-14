import { motion } from "framer-motion";
import {
	FiAlertCircle,
	FiArrowRight,
	FiBarChart2,
	FiGitMerge,
	FiLayout,
	FiShield,
	FiTrello,
	FiUsers,
	FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";

// --- DATA & HELPERS ARE CO-LOCATED INSIDE THIS FILE ---

// The content for the feature section
const featureData = [
	{
		title: "Visualize Your Workflow",
		description:
			"See your entire process at a glance with beautiful, intuitive Kanban boards fully customizable to your team's needs.",
		icon: "FiLayout",
		size: "2x1",
		highlight: true,
	},
	{
		title: "Real-time Collaboration",
		description:
			"Work with your team in real-time with live updates, comments, and notifications.",
		icon: "FiUsers",
		size: "1x1",
	},
	{
		title: "Powerful Analytics",
		description:
			"Gain insights into your team's performance with detailed charts and reports.",
		icon: "FiBarChart2",
		size: "1x1",
	},
	{
		title: "Automate Repetitive Tasks",
		description:
			"Create custom rules and workflows to automate common actions and save valuable time.",
		icon: "FiZap",
		size: "1x1",
	},
	{
		title: "Seamless Integrations",
		description:
			"Connect TaskFlow with the tools you already use, like Slack, GitHub, and Figma.",
		icon: "FiGitMerge",
		size: "1x1",
	},
	{
		title: "Enterprise-Grade Security",
		description:
			"Your data is safe with SSO, role-based access control, and advanced encryption.",
		icon: "FiShield",
		size: "2x1",
	},
];

// Helper to map string names to actual icon components
const iconMap = {
	FiLayout,
	FiUsers,
	FiBarChart2,
	FiZap,
	FiGitMerge,
	FiShield,
	FiTrello,
	FiArrowRight,
};

// A dynamic icon component that lives inside this file
const Icon = ({ name, ...props }) => {
	const MatchedIcon = iconMap[name];
	if (!MatchedIcon) {
		return <FiAlertCircle {...props} />;
	}
	return <MatchedIcon {...props} />;
};

// A dynamic class map for the bento grid sizes
const sizeMap = {
	"1x1": "lg:col-span-1 lg:row-span-1",
	"2x1": "lg:col-span-2 lg:row-span-1",
};

// FeatureCard component, also co-located
const FeatureCard = ({
	title,
	description,
	icon,
	size,
	highlight,
	delay = 0,
}) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true, amount: 0.5 }}
		transition={{ duration: 0.5, delay }}
		className={`bento-card-interactive p-8 relative overflow-hidden ${sizeMap[size] || sizeMap["1x1"]}`}
	>
		{highlight && (
			<div className="absolute top-0 right-0 h-full w-full bg-gradient-accent opacity-10 blur-3xl" />
		)}
		<div className="relative z-10">
			<div className="flex items-center justify-center w-12 h-12 mb-5 rounded-lg bg-bento-background border border-bento-border">
				<Icon name={icon} className="w-6 h-6 text-accent-start" />
			</div>
			<h3 className="text-xl font-bold mb-3 text-bento-text-primary">
				{title}
			</h3>
			<p className="text-bento-text-secondary leading-relaxed">{description}</p>
		</div>
	</motion.div>
);

// --- MAIN HOME COMPONENT ---

export const Home = () => {
	return (
		// The `bento-theme` class applies the new background and text colors to THIS page only
		<div className="min-h-screen overflow-x-hidden bento-theme">
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-bento-background/50 backdrop-blur-md">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<Link to="/" className="flex items-center space-x-3">
						<div className="w-10 h-10 flex items-center justify-center bg-bento-surface rounded-lg border border-bento-border">
							<Icon name="FiTrello" className="w-6 h-6 text-accent-start" />
						</div>
						<span className="text-xl font-bold text-bento-text-primary">
							TaskFlow
						</span>
					</Link>
					<div className="hidden md:flex items-center space-x-4">
						<a
							href="#features"
							className="text-bento-text-secondary hover:text-bento-text-primary transition-colors"
						>
							Features
						</a>
						<Link to="/login" className="btn-new-secondary">
							Sign In
						</Link>
						<Link to="/register" className="btn-new-primary">
							Get Started
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-40 pb-24 px-6 text-center relative">
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-accent rounded-full blur-3xl opacity-20" />
				</div>
				<div className="max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="inline-block px-4 py-1.5 mb-6 text-sm rounded-full border border-bento-border bg-bento-surface"
					>
						<span className="gradient-text-new font-medium">
							Now in Public Beta
						</span>
						<span className="text-bento-text-secondary ml-2">
							Join for free
						</span>
					</motion.div>
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter"
					>
						Where Great Work <span className="gradient-text-new">Happens</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-xl text-bento-text-secondary mb-10"
					>
						TaskFlow is the all-in-one platform for high-performance teams.
						Plan, track, and manage your projects from start to finish.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex items-center justify-center gap-4"
					>
						<Link to="/register" className="btn-new-primary text-lg">
							Get Started
							<Icon name="FiArrowRight" className="ml-2" />
						</Link>
					</motion.div>
				</div>
			</section>

			{/* Features "Bento Box" Section */}
			<section id="features" className="py-24 px-6">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold">
							A Better Way to Build
						</h2>
						<p className="text-lg text-bento-text-secondary mt-4">
							TaskFlow gives you the blocks to build any workflow.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[18rem]">
						{featureData.map((feature, index) => (
							<FeatureCard
								key={feature.title}
								{...feature}
								delay={index * 0.1}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-16 px-6 border-t border-bento-border">
				<div className="max-w-7xl mx-auto text-center">
					<p className="text-bento-text-secondary">
						&copy; {new Date().getFullYear()} TaskFlow, Inc. All rights
						reserved.
					</p>
				</div>
			</footer>
		</div>
	);
};
