import { motion } from "framer-motion"
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiGlobe,
  FiLayout,
  FiList,
  FiMoon,
  FiTarget,
  FiTrello,
  FiUsers,
  FiZap,
} from "react-icons/fi"
import { Link } from "react-router-dom"

import {
  featureData,
  pricingData,
  statsData,
  teamTypes,
  testimonialData,
} from "../components/landing-page/landingPageComponent.js"

// Icon map — all SVG, no emoji
const ICON_MAP = {
  FiLayout,
  FiTrello,
  FiCalendar,
  FiList,
  FiUsers,
  FiMoon,
  FiZap,
  FiBriefcase,
  FiTarget,
  FiGlobe,
}

const SectionIcon = ({ name, className }) => {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon className={className} /> : null
}

// Shared viewport animation variant
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="card group p-6 flex flex-col gap-4">
    <div className="w-11 h-11 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-primary transition-colors duration-200">
      <SectionIcon
        name={icon}
        className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors duration-200"
      />
    </div>
    <div>
      <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 group-hover:text-accent-primary transition-colors duration-200">
        {title}
      </h3>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  </div>
)

const TestimonialCard = ({ name, role, company, initials, content }) => (
  <div className="card p-6 flex flex-col gap-4">
    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed italic">
      "{content}"
    </p>
    <div className="flex items-center gap-3 pt-2 border-t border-light-border dark:border-dark-border">
      <div className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div>
        <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
          {name}
        </p>
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
          {role}, {company}
        </p>
      </div>
    </div>
  </div>
)

const PricingCard = ({ name, price, period, features, highlighted, badge, cta }) => (
  <div
    className={`card flex flex-col ${highlighted ? "border-2 border-accent-primary shadow-glow relative" : ""}`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="bg-accent-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
          {badge}
        </span>
      </div>
    )}
    <div className="p-6 flex-1">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
        {name}
      </h3>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
          {price}
        </span>
        {period && (
          <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
            /{period}
          </span>
        )}
      </div>
      <ul className="mt-5 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary"
          >
            <FiCheckCircle className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
    <div className="p-6 pt-0">
      <Link
        to="/register"
        className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${
          highlighted ? "btn-primary w-full" : "btn-secondary w-full"
        }`}
      >
        {cta}
      </Link>
    </div>
  </div>
)

export const Home = () => {
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-md border-b border-light-border/50 dark:border-dark-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent-primary flex items-center justify-center flex-shrink-0">
              <span className="font-serif font-bold text-white text-sm leading-none">T</span>
            </div>
            <span className="font-serif font-bold text-base sm:text-lg text-light-text-primary dark:text-dark-text-primary hidden xs:block">
              TaskFlow
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <span className="inline-block mb-3 sm:mb-4 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              The All-In-One Task Management Platform
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary leading-tight mb-4 sm:mb-6">
              Streamline Your Workflow,{" "}
              <span className="text-accent-primary">Elevate Your Team</span>
            </h1>
            <p className="text-base sm:text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-10 px-2">
              Stop juggling scattered tasks across endless spreadsheets. TaskFlow brings your
              projects, sprints, and team collaboration into one seamless workspace.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-14 md:mb-16 px-4"
          >
            <Link
              to="/register"
              className="btn-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Start Free Today
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto px-4"
          >
            {statsData.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-serif text-light-text-primary dark:text-dark-text-primary">
                  {stat.number}
                </div>
                <div className="text-[10px] sm:text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              Everything You Need
            </h2>
            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto px-4">
              Powerful features designed to streamline your workflow and boost team productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featureData.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Who It's For ───────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              Built for Modern Teams
            </h2>
            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto px-4">
              Whether you're a startup or an enterprise, TaskFlow adapts to how your team works.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {teamTypes.map((team) => (
              <div
                key={team.label}
                className="card p-4 sm:p-5 text-center flex flex-col items-center gap-3"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                  <SectionIcon
                    name={team.icon}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary"
                  />
                </div>
                <div>
                  <p className="font-semibold text-light-text-primary dark:text-dark-text-primary text-xs sm:text-sm">
                    {team.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                    {team.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Pricing ────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto px-4">
              Start free for 14 days. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {pricingData.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Testimonials ───────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              Loved by Teams Worldwide
            </h2>
            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto px-4">
              See what teams are saying about TaskFlow.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonialData.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── CTA ────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary"
      >
        <div className="max-w-2xl mx-auto text-center card p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mb-6 sm:mb-8 leading-relaxed">
            Get started in 30 seconds. Create your account, add your first project, invite your
            team, and start shipping.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/register"
              className="btn-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Start Free Trial
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              Sign In
            </Link>
          </div>
          <p className="text-[10px] sm:text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-4">
            No credit card required · Free for 14 days
          </p>
        </div>
      </motion.section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-primary flex items-center justify-center">
              <span className="font-serif font-bold text-white text-xs leading-none">T</span>
            </div>
            <span className="font-serif font-bold text-sm text-light-text-primary dark:text-dark-text-primary">
              TaskFlow
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center sm:text-left">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <a
              href="mailto:hello@taskly.app"
              className="hover:text-accent-primary transition-colors duration-200"
            >
              hello@taskly.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
