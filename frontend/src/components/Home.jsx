import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiShield,
  FiTarget,
  FiTrello,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi"
import { Link } from "react-router-dom"

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="card-interactive group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative">
      <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-primary to-secondary group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-text-primary group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  </motion.div>
)

const StatCard = ({ number, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="text-center p-6 rounded-xl glass"
  >
    <div className="text-5xl font-bold gradient-text mb-2">{number}</div>
    <div className="text-text-secondary font-medium">{label}</div>
  </motion.div>
)

const TestimonialCard = ({ name, role, company, content, avatar, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="card p-8"
  >
    <div className="flex items-center mb-6">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mr-4">
        {avatar}
      </div>
      <div>
        <div className="font-bold text-text-primary">{name}</div>
        <div className="text-sm text-text-muted">
          {role} at {company}
        </div>
      </div>
    </div>
    <p className="text-text-secondary leading-relaxed italic">"{content}"</p>
  </motion.div>
)

const PricingCard = ({ name, price, period, features, highlighted = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={`card p-8 ${highlighted ? "ring-2 ring-primary shadow-glow" : ""} relative`}
  >
    {highlighted && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-white text-sm font-bold">
        Most Popular
      </div>
    )}
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold mb-2 text-text-primary">{name}</h3>
      <div className="flex items-baseline justify-center mb-2">
        <span className="text-5xl font-bold gradient-text">{price}</span>
        {period && <span className="text-text-muted ml-2">/{period}</span>}
      </div>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <FiCheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-text-secondary">{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      to="/register"
      className={highlighted ? "btn-primary w-full text-center" : "btn-ghost w-full text-center"}
    >
      Get Started
    </Link>
  </motion.div>
)

export const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div className="fixed inset-0 -z-10" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FiTrello className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">TaskFlow</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center space-x-8"
          >
            <a
              href="#features"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Testimonials
            </a>
            <a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">
              Pricing
            </a>
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
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-6">
                  <FiAward className="w-4 h-4 text-primary" />
                  <span className="text-sm text-text-secondary">
                    Trusted by 10,000+ teams worldwide
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Organize Work,
                  <span className="gradient-text block">Achieve More</span>
                </h1>
                <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                  The ultimate task management platform that brings your team together. Plan, track,
                  and deliver projects with powerful features and beautiful design.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 group">
                    Start Free Trial
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="btn-ghost text-lg px-8 py-4">
                    Watch Demo
                  </Link>
                </div>
                <div className="flex items-center space-x-6 text-sm text-text-muted">
                  <div className="flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-primary mr-2" />
                    Free 14-day trial
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-primary mr-2" />
                    No credit card required
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="card p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl" />
                <div className="relative space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="glass p-4 rounded-xl flex items-center space-x-4"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                      <div className="flex-1">
                        <div className="h-3 bg-border rounded w-3/4 mb-2" />
                        <div className="h-2 bg-border/50 rounded w-1/2" />
                      </div>
                      <FiCheckCircle className="w-6 h-6 text-primary" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            <StatCard number="10K+" label="Active Teams" delay={0.7} />
            <StatCard number="500K+" label="Tasks Completed" delay={0.8} />
            <StatCard number="99.9%" label="Uptime SLA" delay={0.9} />
            <StatCard number="4.9/5" label="User Rating" delay={1.0} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-6">
              <FiZap className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Built for modern teams with powerful features that scale with your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiTrello className="w-7 h-7 text-white" />}
              title="Intuitive Kanban Boards"
              description="Visualize workflows with drag-and-drop Kanban boards. Customize columns, set WIP limits, and track progress in real-time."
              delay={0.1}
            />
            <FeatureCard
              icon={<FiUsers className="w-7 h-7 text-white" />}
              title="Team Collaboration"
              description="Invite unlimited members, assign tasks, mention teammates, and collaborate seamlessly with real-time updates."
              delay={0.2}
            />
            <FeatureCard
              icon={<FiZap className="w-7 h-7 text-white" />}
              title="Lightning Performance"
              description="Built with modern tech stack for blazing-fast performance. Smooth animations and instant updates across devices."
              delay={0.3}
            />
            <FeatureCard
              icon={<FiLayers className="w-7 h-7 text-white" />}
              title="Smart Task Management"
              description="Create tasks with descriptions, due dates, priorities, labels, and subtasks. Track everything in one place."
              delay={0.4}
            />
            <FeatureCard
              icon={<FiBell className="w-7 h-7 text-white" />}
              title="Real-time Notifications"
              description="Stay updated with instant notifications for task assignments, comments, due dates, and team activities."
              delay={0.5}
            />
            <FeatureCard
              icon={<FiBarChart2 className="w-7 h-7 text-white" />}
              title="Advanced Analytics"
              description="Track productivity with detailed insights, completion rates, team performance, and custom reports."
              delay={0.6}
            />
            <FeatureCard
              icon={<FiShield className="w-7 h-7 text-white" />}
              title="Enterprise Security"
              description="Bank-level encryption, SSO integration, role-based access control, and compliance with SOC 2 & GDPR."
              delay={0.7}
            />
            <FeatureCard
              icon={<FiClock className="w-7 h-7 text-white" />}
              title="Time Tracking"
              description="Track time spent on tasks, generate timesheets, and analyze team productivity with detailed reports."
              delay={0.8}
            />
            <FeatureCard
              icon={<FiTarget className="w-7 h-7 text-white" />}
              title="Goal Setting"
              description="Set team goals, track OKRs, measure progress with milestones, and celebrate achievements together."
              delay={0.9}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 px-6 bg-gradient-to-b from-transparent to-primary/5"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-6">
              <FiAward className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              See how teams are transforming their productivity with TaskFlow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Product Manager"
              company="TechCorp"
              avatar="SJ"
              content="TaskFlow has completely transformed how our team collaborates. The intuitive interface and powerful features make project management a breeze."
              delay={0.1}
            />
            <TestimonialCard
              name="Michael Chen"
              role="Engineering Lead"
              company="StartupXYZ"
              avatar="MC"
              content="We've tried many tools, but TaskFlow stands out with its speed and reliability. Our team's productivity has increased by 40% since switching."
              delay={0.2}
            />
            <TestimonialCard
              name="Emily Rodriguez"
              role="Operations Director"
              company="GrowthCo"
              avatar="ER"
              content="The real-time collaboration features are game-changing. We can now coordinate across 3 time zones without missing a beat."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-6">
              <FiTrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Plans That Scale With You
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              name="Starter"
              price="Free"
              period=""
              features={[
                "Up to 5 team members",
                "3 active projects",
                "Basic task management",
                "Mobile apps",
                "Community support",
              ]}
              delay={0.1}
            />
            <PricingCard
              name="Professional"
              price="$12"
              period="user/month"
              highlighted={true}
              features={[
                "Unlimited team members",
                "Unlimited projects",
                "Advanced features",
                "Priority support",
                "Analytics & reports",
                "Custom integrations",
              ]}
              delay={0.2}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period=""
              features={[
                "Everything in Pro",
                "SSO & SAML",
                "Advanced security",
                "Dedicated support",
                "Custom contracts",
                "SLA guarantee",
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center card-interactive p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-xl text-text-secondary mb-10 leading-relaxed max-w-3xl mx-auto">
              Join 10,000+ teams already using TaskFlow to manage their projects better. Start your
              free 14-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/register" className="btn-primary text-lg px-10 py-5 group">
                Start Free Trial
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center space-x-6 text-sm text-text-muted">
                <div className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 text-primary mr-2" />
                  14-day trial
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 text-primary mr-2" />
                  No credit card
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 text-primary mr-2" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <FiTrello className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">TaskFlow</span>
              </div>
              <p className="text-text-secondary mb-6 max-w-md">
                The modern task management platform that helps teams stay organized, productive, and
                connected.
              </p>
              <div className="flex space-x-4">
                {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-text-primary mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-text-muted">
              © {new Date().getFullYear()} TaskFlow. All rights reserved. Built with ❤️ for
              productive teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
