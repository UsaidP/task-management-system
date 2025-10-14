// src/data/landingPageContent.js

/**
 * This file centralizes all the content for the landing page.
 * It makes updates easy and separates the data layer from the view layer.
 */

export const featureData = [
	{
		icon: "FiTrello",
		title: "Intuitive Kanban Boards",
		description:
			"Visualize workflows with drag-and-drop Kanban boards. Customize columns, set WIP limits, and track progress in real-time.",
	},
	{
		icon: "FiUsers",
		title: "Team Collaboration",
		description:
			"Invite unlimited members, assign tasks, mention teammates, and collaborate seamlessly with real-time updates.",
	},
	{
		icon: "FiZap",
		title: "Lightning Performance",
		description:
			"Built with modern tech stack for blazing-fast performance. Smooth animations and instant updates across devices.",
	},
	{
		icon: "FiLayers",
		title: "Smart Task Management",
		description:
			"Create tasks with descriptions, due dates, priorities, labels, and subtasks. Track everything in one place.",
	},
	{
		icon: "FiBell",
		title: "Real-time Notifications",
		description:
			"Stay updated with instant notifications for task assignments, comments, due dates, and team activities.",
	},
	{
		icon: "FiBarChart2",
		title: "Advanced Analytics",
		description:
			"Track productivity with detailed insights, completion rates, team performance, and custom reports.",
	},
];

export const testimonialData = [
	{
		name: "Sarah Johnson",
		role: "Product Manager",
		company: "TechCorp",
		avatar: "SJ",
		content:
			"TaskFlow has completely transformed how our team collaborates. The intuitive interface and powerful features make project management a breeze.",
	},
	{
		name: "Michael Chen",
		role: "Engineering Lead",
		company: "StartupXYZ",
		avatar: "MC",
		content:
			"We've tried many tools, but TaskFlow stands out with its speed and reliability. Our team's productivity has increased by 40% since switching.",
	},
	{
		name: "Emily Rodriguez",
		role: "Operations Director",
		company: "GrowthCo",
		avatar: "ER",
		content:
			"The real-time collaboration features are game-changing. We can now coordinate across 3 time zones without missing a beat.",
	},
];

export const pricingData = [
	{
		name: "Starter",
		price: "Free",
		period: "",
		features: [
			"Up to 5 team members",
			"3 active projects",
			"Basic task management",
			"Mobile apps",
			"Community support",
		],
	},
	{
		name: "Professional",
		price: "$12",
		period: "user/month",
		highlighted: true,
		features: [
			"Unlimited team members",
			"Unlimited projects",
			"Advanced features",
			"Priority support",
			"Analytics & reports",
			"Custom integrations",
		],
	},
	{
		name: "Enterprise",
		price: "Custom",
		period: "",
		features: [
			"Everything in Pro",
			"SSO & SAML",
			"Advanced security",
			"Dedicated support",
			"Custom contracts",
			"SLA guarantee",
		],
	},
];
