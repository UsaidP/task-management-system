import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { memo, useEffect, useId, useState } from "react"
import {
  FiArrowDown,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiGlobe,
  FiLayout,
  FiList,
  FiMessageSquare,
  FiMoon,
  FiPaperclip,
  FiShield,
  FiTarget,
  FiTrello,
  FiUsers,
  FiZap,
} from "react-icons/fi"
import { Link } from "react-router-dom"

import {
  featureData,
  pricingData,
  teamTypes,
  testimonialData,
} from "../components/landing-page/landingPageComponent.js"

// ─── Animation Variants ──────────────────────────────────────────
const fadeUp = (r) => ({
  hidden: { opacity: 0, y: r ? 0 : 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: r ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] },
  },
})

const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
}

// ─── Icon Map ────────────────────────────────────────────────────
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

// ─── Floating Orb ────────────────────────────────────────────────
const FloatingOrb = ({ className, delay = 0, style }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={style}
    animate={{ y: [0, -16, 0], scale: [1, 1.03, 1] }}
    transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, delay, ease: "easeInOut" }}
    aria-hidden="true"
  />
)

// ─── Kanban Board Preview (Interactive Demo) ─────────────────────
const KANBAN_COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    color: "#8B8178",
    dotColor: "rgba(139, 129, 120, 0.25)",
    tasks: [
      {
        title: "Design system tokens",
        tag: "Design",
        tagColor: "#8B70A0",
        comments: 3,
        attachments: 1,
        assignee: "AK",
      },
      {
        title: "API rate limiting",
        tag: "Backend",
        tagColor: "#6888A0",
        comments: 1,
        attachments: 0,
        assignee: "JD",
      },
    ],
  },
  {
    id: "progress",
    label: "In Progress",
    color: "#C4654A",
    dotColor: "rgba(196, 101, 74, 0.25)",
    tasks: [
      {
        title: "Kanban drag & drop",
        tag: "Frontend",
        tagColor: "#C4654A",
        comments: 5,
        attachments: 2,
        assignee: "SK",
      },
      {
        title: "Sprint planning v2",
        tag: "Feature",
        tagColor: "#D4A548",
        comments: 2,
        attachments: 0,
        assignee: "MR",
      },
      {
        title: "Email notifications",
        tag: "Backend",
        tagColor: "#6888A0",
        comments: 4,
        attachments: 1,
        assignee: "AK",
      },
    ],
  },
  {
    id: "review",
    label: "Under Review",
    color: "#D4A548",
    dotColor: "rgba(212, 165, 72, 0.25)",
    tasks: [
      {
        title: "User onboarding flow",
        tag: "UX",
        tagColor: "#7A9A6D",
        comments: 7,
        attachments: 3,
        assignee: "LM",
      },
    ],
  },
  {
    id: "done",
    label: "Done",
    color: "#7A9A6D",
    dotColor: "rgba(122, 154, 109, 0.25)",
    tasks: [
      {
        title: "Auth refresh tokens",
        tag: "Backend",
        tagColor: "#6888A0",
        comments: 2,
        attachments: 0,
        assignee: "JD",
      },
      {
        title: "Dark mode polish",
        tag: "Frontend",
        tagColor: "#C4654A",
        comments: 6,
        attachments: 1,
        assignee: "SK",
      },
    ],
  },
]

const KanbanBoardPreview = () => {
  const r = useReducedMotion()
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <div
      className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden shadow-md dark:shadow-dark-md"
      style={{ backgroundColor: "#F5EDE3" }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-light-border dark:border-dark-border"
        style={{ backgroundColor: "#FAF6F1" }}
      >
        <div className="flex gap-1.5" aria-hidden="true">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "rgba(196, 74, 74, 0.5)" }}
          />
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "rgba(212, 165, 72, 0.5)" }}
          />
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "rgba(122, 154, 109, 0.5)" }}
          />
        </div>
        <div className="flex-1 mx-4">
          <div
            className="rounded-md px-3 py-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary max-w-xs mx-auto text-center truncate"
            style={{ backgroundColor: "#F0E6D6" }}
          >
            app.taskflow.app/project/kanban-board
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 sm:p-4">
        {KANBAN_COLUMNS.map((col) => (
          <section
            key={col.id}
            className="rounded-lg p-2.5 sm:p-3"
            style={{ backgroundColor: col.dotColor }}
            aria-label={`${col.label} column`}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: col.color }}
              />
              <span className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">
                {col.label}
              </span>
              <span className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary ml-auto font-medium">
                {col.tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.tasks.map((task, idx) => (
                <motion.div
                  key={`${col.id}-${idx}`}
                  onHoverStart={() => setHoveredCard(`${col.id}-${idx}`)}
                  onHoverEnd={() => setHoveredCard(null)}
                  animate={hoveredCard === `${col.id}-${idx}` ? { y: -2 } : { y: 0 }}
                  transition={{ duration: r ? 0 : 0.15 }}
                  className="rounded-lg p-2.5 border border-light-border dark:border-dark-border"
                  style={{ backgroundColor: "#FAF6F1" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: task.tagColor }}
                    >
                      {task.tag}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary leading-snug mb-2">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">
                      {task.comments > 0 && (
                        <span className="flex items-center gap-0.5">
                          <FiMessageSquare className="w-2.5 h-2.5" />
                          {task.comments}
                        </span>
                      )}
                      {task.attachments > 0 && (
                        <span className="flex items-center gap-0.5">
                          <FiPaperclip className="w-2.5 h-2.5" />
                          {task.attachments}
                        </span>
                      )}
                    </div>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                      style={{ background: "linear-gradient(135deg, #C4654A, #A8503A)" }}
                    >
                      {task.assignee}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

// ─── Feature Card ────────────────────────────────────────────────
const FeatureCard = ({ icon, title, description }) => {
  const [hovered, setHovered] = useState(false)
  const r = useReducedMotion()

  return (
    <motion.div
      variants={fadeUp(r)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative card rounded-xl overflow-hidden cursor-default"
    >
      <motion.div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl"
        style={{ backgroundColor: "rgba(196, 101, 74, 0.08)" }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: "rgba(196, 101, 74, 0.08)" }}
        >
          <SectionIcon
            name={icon}
            className="w-5 h-5 text-accent-primary transition-colors duration-200"
          />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm sm:text-[15px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Testimonial Card ────────────────────────────────────────────
const TestimonialCard = memo(({ name, role, company, initials, content }) => (
  <article className="relative card rounded-xl">
    <span
      className="absolute top-3 right-5 text-6xl font-serif text-accent-primary/10 leading-none select-none pointer-events-none"
      aria-hidden="true"
    >
      &ldquo;
    </span>
    <blockquote className="relative z-10 text-sm sm:text-[15px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed italic mb-5">
      &ldquo;{content}&rdquo;
    </blockquote>
    <footer className="flex items-center gap-3 pt-4 border-t border-light-border dark:border-dark-border">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md"
        style={{ background: "linear-gradient(135deg, #C4654A, #A8503A)" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <cite className="not-italic text-sm font-semibold text-light-text-primary dark:text-dark-text-primary block truncate">
          {name}
        </cite>
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary truncate">
          {role}, {company}
        </p>
      </div>
      <span className="flex items-center gap-1 text-xs text-accent-success dark:text-accent-success-light font-medium flex-shrink-0">
        <FiCheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Verified
      </span>
    </footer>
  </article>
))
TestimonialCard.displayName = "TestimonialCard"

// ─── Pricing Card ────────────────────────────────────────────────
const PricingCard = memo(({ name, price, period, features, highlighted, badge, cta }) => (
  <div
    className={`relative rounded-xl overflow-hidden ${highlighted ? "border-2 border-accent-primary shadow-glow" : "card"}`}
  >
    {badge && (
      <div
        className="absolute -top-px left-0 right-0 h-7 flex items-center justify-center"
        style={{ backgroundColor: "#C4654A" }}
      >
        <span className="text-white text-[11px] font-bold uppercase tracking-wider">{badge}</span>
      </div>
    )}
    <div className={`p-6 sm:p-7 ${badge ? "pt-9" : ""}`}>
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
        {name}
      </h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">
          {price}
        </span>
        {period && (
          <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-0.5">
            /{period}
          </span>
        )}
      </div>
      <ul className="mt-5 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary"
          >
            <FiCheck className="w-4 h-4 text-accent-success dark:text-accent-success-light flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="px-6 sm:px-7 pb-6 sm:pb-7">
      <Link
        to="/register"
        className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${highlighted ? "btn-primary w-full" : "btn-secondary w-full"}`}
        aria-label={`Sign up for ${name} plan`}
      >
        {cta}
      </Link>
    </div>
  </div>
))
PricingCard.displayName = "PricingCard"

// ─── FAQ Accordion ───────────────────────────────────────────────
const FAQAccordion = memo(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)
  const r = useReducedMotion()

  return (
    <div className="border-b border-light-border dark:border-dark-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left group cursor-pointer focus-visible-ring rounded"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-[15px] font-medium text-light-text-primary dark:text-dark-text-primary pr-4 group-hover:text-accent-primary dark:group-hover:text-accent-primary-light transition-colors duration-200 text-left">
          {question}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: r ? 0 : 0.2 }}>
          <FiChevronDown
            className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0"
            aria-hidden="true"
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: r ? 0 : 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 px-1 text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
FAQAccordion.displayName = "FAQAccordion"

const faqData = [
  {
    question: "Is there really no credit card required for the free trial?",
    answer:
      "Absolutely. Start using TaskFlow immediately with zero commitment. Upgrade only when you're ready — we'll never surprise you with a bill.",
  },
  {
    question: "Can I import tasks from other tools like Trello or Asana?",
    answer:
      "Yes. We support CSV imports from any tool, and our one-click migrator works with Trello, Asana, Jira, and Notion. Most teams are fully migrated in under 10 minutes.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data remains accessible in read-only mode for 90 days. You can export everything as CSV or JSON at any time. We believe in data portability.",
  },
  {
    question: "Do you offer discounts for nonprofits or education?",
    answer:
      "Yes — 50% off for verified nonprofits, educational institutions, and open-source projects. Contact us with proof of eligibility.",
  },
  {
    question: "How does team collaboration work?",
    answer:
      "Invite unlimited members on paid plans. Assign roles (admin, member, viewer), create projects with specific access, and collaborate in real time with task comments and subtasks.",
  },
]

// ─── Navbar ──────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-light-bg-primary/90 dark:bg-dark-bg-primary/90 backdrop-blur-md border-b border-light-border dark:border-dark-border shadow-sm" : "bg-transparent"}`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="TaskFlow Home">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <span className="font-serif font-bold text-white text-sm leading-none">T</span>
          </div>
          <span className="font-serif font-bold text-lg text-light-text-primary dark:text-dark-text-primary hidden sm:block tracking-tight">
            TaskFlow
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
            aria-label="Sign in"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2"
            aria-label="Get started"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ────────────────────────────────────────────────────────
const Hero = ({ variants, reduced }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
    <div
      className="absolute inset-0 bg-light-bg-primary dark:bg-dark-bg-primary"
      aria-hidden="true"
    />
    <FloatingOrb
      className="w-[28rem] h-[28rem]"
      style={{ backgroundColor: "rgba(196, 101, 74, 0.05)", top: "-6rem", left: "-8rem" }}
      delay={0}
    />
    <FloatingOrb
      className="w-72 h-72"
      style={{ backgroundColor: "rgba(212, 165, 72, 0.04)", top: "25%", right: "-5rem" }}
      delay={2.5}
    />

    <div
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.035]"
      style={{
        backgroundImage:
          "linear-gradient(#2C2420 1px, transparent 1px), linear-gradient(90deg, #2C2420 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
      aria-hidden="true"
    />

    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
      <motion.div variants={variants} initial="hidden" animate="visible">
        <motion.div
          className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 py-1.5 rounded-full border backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(196, 101, 74, 0.06)",
            borderColor: "rgba(196, 101, 74, 0.15)",
          }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.45, delay: 0.1 }}
        >
          <span
            className="w-2 h-2 rounded-full bg-accent-success animate-pulse"
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm font-semibold text-accent-primary dark:text-accent-primary-light">
            Free for 14 Days — No Credit Card
          </span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary leading-[1.1] tracking-tight mb-4 sm:mb-5">
          Work that feels
          <br />
          <span className="text-accent-primary dark:text-accent-primary-light">
            naturally smooth
          </span>
        </h1>

        <p className="text-base sm:text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2">
          TaskFlow brings projects, sprints, and team collaboration into one seamless workspace.
          Stop juggling spreadsheets — start shipping.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          <Link
            to="/register"
            className="btn-primary group px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center"
            aria-label="Start free trial"
          >
            Start Free Today
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base w-full sm:w-auto justify-center"
            aria-label="Sign in"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-12 max-w-md mx-auto mb-10 sm:mb-12">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Tasks Completed" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-light-text-primary dark:text-dark-text-primary">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Kanban Board Preview */}
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ delay: reduced ? 0 : 0.5 }}
        className="mt-12 sm:mt-16 max-w-5xl mx-auto"
      >
        <KanbanBoardPreview />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <FiArrowDown className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
      </motion.div>
    </div>
  </section>
)

// ─── Features ────────────────────────────────────────────────────
const Features = ({ variants, id }) => (
  <motion.section
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    className="py-16 sm:py-24 px-4 sm:px-6"
    aria-labelledby={id}
  >
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-accent-primary dark:text-accent-primary-light mb-3">
          Features
        </span>
        <h2
          id={id}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3 tracking-tight"
        >
          Everything You Need
        </h2>
        <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto">
          Powerful features designed to streamline your workflow and boost team productivity.
        </p>
      </div>
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {featureData.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </motion.div>
    </div>
  </motion.section>
)

// ─── Teams ───────────────────────────────────────────────────────
const Teams = ({ variants, id }) => {
  const r = useReducedMotion()
  return (
    <motion.section
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-16 sm:py-24 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary"
      aria-labelledby={id}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-accent-primary dark:text-accent-primary-light mb-3">
            Who It&apos;s For
          </span>
          <h2
            id={id}
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3 tracking-tight"
          >
            Built for Modern Teams
          </h2>
          <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto">
            Whether you&apos;re a startup or an enterprise, TaskFlow adapts to how your team works.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {teamTypes.map((team) => (
            <motion.div
              key={team.label}
              variants={fadeUp(r)}
              className="group bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-5 sm:p-6 border border-light-border dark:border-dark-border text-center hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-dark-md transition-all duration-200"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: "rgba(196, 101, 74, 0.08)" }}
              >
                <SectionIcon name={team.icon} className="w-5 h-5 text-accent-primary" />
              </div>
              <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 text-xs sm:text-sm">
                {team.label}
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {team.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// ─── Testimonials ────────────────────────────────────────────────
const Testimonials = ({ variants, id }) => (
  <motion.section
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    className="py-16 sm:py-24 px-4 sm:px-6"
    aria-labelledby={id}
  >
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-accent-primary dark:text-accent-primary-light mb-3">
          Testimonials
        </span>
        <h2
          id={id}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3 tracking-tight"
        >
          Loved by Teams Worldwide
        </h2>
        <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto">
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
)

// ─── Pricing ─────────────────────────────────────────────────────
const Pricing = ({ variants, id }) => (
  <motion.section
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    className="py-16 sm:py-24 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary"
    aria-labelledby={id}
  >
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-accent-primary dark:text-accent-primary-light mb-3">
          Pricing
        </span>
        <h2
          id={id}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3 tracking-tight"
        >
          Simple, Transparent Pricing
        </h2>
        <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto">
          Start free for 14 days. No credit card required.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {pricingData.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>
      <p className="text-center text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-10 flex items-center justify-center gap-2">
        <FiShield className="w-4 h-4 flex-shrink-0" />
        All plans include core features, dark mode, and community support
      </p>
    </div>
  </motion.section>
)

// ─── FAQ ─────────────────────────────────────────────────────────
const FAQ = ({ variants, id }) => (
  <motion.section
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    className="py-16 sm:py-24 px-4 sm:px-6"
    aria-labelledby={id}
  >
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12 sm:mb-14">
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-accent-primary dark:text-accent-primary-light mb-3">
          FAQ
        </span>
        <h2
          id={id}
          className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-3 tracking-tight"
        >
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto">
          Everything you need to know about TaskFlow.
        </p>
      </div>
      <div className="card rounded-xl">
        {faqData.map((faq) => (
          <FAQAccordion key={faq.question} {...faq} />
        ))}
      </div>
    </div>
  </motion.section>
)

// ─── CTA ─────────────────────────────────────────────────────────
const CTA = ({ variants }) => (
  <motion.section
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
  >
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(135deg, #C4654A 0%, #A8503A 100%)" }}
      aria-hidden="true"
    />
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      aria-hidden="true"
    />
    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-4 tracking-tight">
        Ready to Transform Your Workflow?
      </h2>
      <p className="text-sm sm:text-base text-white/80 mb-8 sm:mb-10 max-w-xl mx-auto">
        Get started in 30 seconds. Create your account, add your first project, invite your team,
        and start shipping.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Link
          to="/register"
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#FAF6F1", color: "#C4654A" }}
          aria-label="Start free trial"
        >
          Start Free Trial
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
        <Link
          to="/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base border transition-all duration-200 cursor-pointer backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "#FAF6F1",
            borderColor: "rgba(255,255,255,0.2)",
          }}
          aria-label="Sign in"
        >
          Sign In
        </Link>
      </div>
      <p className="text-xs sm:text-sm text-white/60 mt-4">
        No credit card required \u00b7 Free for 14 days \u00b7 Cancel anytime
      </p>
    </div>
  </motion.section>
)

// ─── Footer ──────────────────────────────────────────────────────
const Footer = () => {
  const featuresId = useId()
  const pricingId = useId()
  const faqId = useId()

  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`#${featuresId}`}
                  className="text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary-light transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href={`#${pricingId}`}
                  className="text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary-light transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href={`#${faqId}`}
                  className="text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary-light transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Documentation
                </span>
              </li>
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  API Reference
                </span>
              </li>
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Guides
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">About</span>
              </li>
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Blog</span>
              </li>
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Careers
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Terms of Service
                </span>
              </li>
              <li>
                <a
                  href="mailto:hello@taskflow.app"
                  className="text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary-light transition-colors"
                  aria-label="Contact us"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-10 py-5 sm:py-6 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                Stay in the Loop
              </h4>
              <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Get product updates, tips, and best practices. No spam, ever.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full sm:w-auto gap-2"
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 sm:w-56 px-4 py-2.5 text-sm rounded-lg bg-light-bg-primary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all duration-200"
                aria-label="Email for newsletter"
                required
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2.5 text-xs sm:text-sm whitespace-nowrap"
                aria-label="Subscribe"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 border-t border-light-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-primary flex items-center justify-center shadow-sm">
              <span className="font-serif font-bold text-white text-xs leading-none">T</span>
            </div>
            <span className="font-serif font-bold text-sm text-light-text-primary dark:text-dark-text-primary">
              TaskFlow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary text-center sm:text-left">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <a
            href="mailto:hello@taskflow.app"
            className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary hover:text-accent-primary dark:hover:text-accent-primary-light transition-colors"
            aria-label="Email us"
          >
            hello@taskflow.app
          </a>
        </div>
      </div>
    </footer>
  )
}

// ─── Main ────────────────────────────────────────────────────────
export const Home = () => {
  const r = useReducedMotion()
  const variants = fadeUp(r)
  const featuresId = useId()
  const teamsId = useId()
  const pricingId = useId()
  const testimonialsId = useId()
  const faqId = useId()
  const mainId = useId()

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-secondary dark:text-dark-text-secondary overflow-x-hidden antialiased">
      <a
        href={`#${mainId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-accent-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id={mainId}>
        <Hero variants={variants} reduced={r} />
        <Features variants={variants} id={featuresId} />
        <Teams variants={variants} id={teamsId} />
        <Testimonials variants={variants} id={testimonialsId} />
        <Pricing variants={variants} id={pricingId} />
        <FAQ variants={variants} id={faqId} />
        <CTA variants={variants} />
      </main>

      <Footer />
    </div>
  )
}

export default Home
