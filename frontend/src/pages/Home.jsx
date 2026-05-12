import {
  CheckIcon,
  ChevronDownIcon as FiChevronDown,
  GlobeIcon as FiGlobe,
  DashboardIcon as FiLayout,
  MoonIcon as FiMoon,
  LayoutGridIcon as FiTrello,
  UsersIcon as FiUsers,
  ZapIcon as FiZap,
} from "@animateicons/react/lucide"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  BriefcaseIcon as FiBriefcase,
  CalendarIcon as FiCalendar,
  ListIcon as FiList,
  TargetIcon as FiTarget,
} from "lucide-react"
import { memo, useEffect, useId, useState } from "react"
import { Link } from "react-router-dom"
import { Hero3D } from "../components/landing-page/Hero3D"

import {
  faqData,
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

// ─── Ticker Component ────────────────────────────────────────────
const Ticker = () => {
  return (
    <div className="w-full bg-[#10101A] border-y border-white/5 overflow-hidden py-4">
      <motion.div
        className="flex whitespace-nowrap items-center gap-12"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-12 text-[#8BAF88]/70 text-sm font-medium tracking-widest uppercase"
          >
            <span>Join 10k+ Teams</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Zero Learning Curve</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Shipped in 30s</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Made for Makers</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Join 10k+ Teams</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Zero Learning Curve</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Shipped in 30s</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8603A]" />
            <span>Made for Makers</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#08080F]/90 backdrop-blur-md border-b border-white/5 shadow-sm py-3" : "bg-transparent py-5"}`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label="TaskFlow Home">
          <div className="flex items-center justify-center w-9 h-9 transition-transform duration-300 rounded-xl bg-[#E8603A] group-hover:scale-105 shadow-[0_0_15px_rgba(232,96,58,0.4)]">
            <span className="font-serif text-lg font-bold text-[#08080F]">T</span>
          </div>
          <span className="hidden font-serif text-xl font-bold tracking-tight text-[#F5EDE0] sm:block">
            TaskFlow
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-[#F5EDE0]/80 hover:text-[#F5EDE0] transition-colors"
            aria-label="Sign in"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[#F5EDE0] text-[#08080F] hover:bg-[#E8603A] hover:text-[#08080F] transition-colors"
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
  <section className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#08080F]">
    <Hero3D variants={variants} reduced={reduced} />

    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: "radial-gradient(circle at center, #E8603A 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
      aria-hidden="true"
    />

    <div className="relative z-10 max-w-5xl px-4 mx-auto text-center sm:px-6 pointer-events-none pt-24 pb-16">
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="pointer-events-auto"
      >
        <motion.div
          className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border backdrop-blur-md"
          style={{
            backgroundColor: "rgba(232, 96, 58, 0.05)",
            borderColor: "rgba(232, 96, 58, 0.2)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: 0.1 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#E8603A] animate-pulse" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#E8603A]">
            TaskFlow 2.0 is here
          </span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-[#F5EDE0] leading-[1.05] tracking-tight mb-6">
          Work that feels
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8603A] to-[#F5EDE0]">
            naturally smooth
          </span>
        </h1>

        <p className="max-w-2xl px-2 mx-auto mb-10 text-lg leading-relaxed text-[#F5EDE0]/70 sm:mb-12 font-sans font-light">
          TaskFlow brings projects, sprints, and team collaboration into one seamless workspace.
          Stop juggling spreadsheets — start shipping.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 mb-16 sm:flex-row sm:gap-6">
          <Link
            to="/register"
            className="group px-8 py-4 text-sm font-semibold text-[#08080F] bg-[#E8603A] hover:bg-[#F5EDE0] rounded-full flex items-center gap-2 transition-all w-full sm:w-auto justify-center shadow-[0_0_30px_rgba(232,96,58,0.3)] hover:shadow-[0_0_40px_rgba(245,237,224,0.4)]"
            aria-label="Start free trial"
          >
            Start Free Today
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <ArrowDownIcon className="w-6 h-6 text-[#F5EDE0]/30" />
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
    className="px-4 py-24 sm:py-32 sm:px-6 bg-[#08080F]"
    aria-labelledby={id}
  >
    <div className="mx-auto max-w-7xl">
      <div className="mb-16 text-center">
        <h2
          id={id}
          className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[#F5EDE0]"
        >
          Everything You Need
        </h2>
        <p className="max-w-xl mx-auto text-lg text-[#F5EDE0]/60 font-light">
          Powerful features designed to streamline your workflow and boost team productivity.
        </p>
      </div>
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 bg-white/5 border border-white/5 rounded-3xl overflow-hidden"
      >
        {featureData.map((feature) => (
          <div
            key={feature.title}
            className="bg-[#10101A] p-8 hover:bg-[#151522] transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E8603A]/10 flex items-center justify-center mb-6">
              <SectionIcon name={feature.icon} className="w-6 h-6 text-[#E8603A]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#F5EDE0] mb-3">{feature.title}</h3>
            <p className="text-[#F5EDE0]/60 leading-relaxed font-light">{feature.description}</p>
          </div>
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
      className="px-4 py-24 sm:py-32 sm:px-6 bg-[#10101A] border-y border-white/5"
      aria-labelledby={id}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            id={id}
            className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[#F5EDE0]"
          >
            Built for Modern Teams
          </h2>
          <p className="max-w-xl mx-auto text-lg text-[#F5EDE0]/60 font-light">
            Whether you're a startup or an enterprise, TaskFlow adapts to how your team works.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamTypes.map((team) => (
            <motion.div
              key={team.label}
              variants={fadeUp(r)}
              className="group bg-[#08080F] rounded-3xl p-8 border border-white/5 hover:border-[#E8603A]/30 transition-colors text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#E8603A]/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <SectionIcon name={team.icon} className="w-8 h-8 text-[#E8603A]" />
              </div>
              <h3 className="mb-3 text-lg font-serif font-bold text-[#F5EDE0]">{team.label}</h3>
              <p className="text-[#F5EDE0]/60 font-light">{team.description}</p>
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
    className="px-4 py-24 sm:py-32 sm:px-6 bg-[#08080F]"
    aria-labelledby={id}
  >
    <div className="max-w-6xl mx-auto">
      <div className="mb-16 text-center">
        <h2
          id={id}
          className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[#F5EDE0]"
        >
          Loved by Teams Worldwide
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {testimonialData.map((t) => (
          <div key={t.name} className="bg-[#10101A] p-8 rounded-3xl border border-white/5 relative">
            <div className="text-[#E8603A] mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="inline-block mr-1">
                  ★
                </span>
              ))}
            </div>
            <p className="text-[#F5EDE0]/80 italic mb-6 leading-relaxed font-serif text-lg">
              "{t.quote}"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8603A]/20 flex items-center justify-center text-[#E8603A] font-bold font-serif">
                {t.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-[#F5EDE0] text-sm">{t.name}</h4>
                <p className="text-[#F5EDE0]/50 text-xs">{t.role}</p>
              </div>
            </div>
          </div>
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
    className="px-4 py-24 sm:py-32 sm:px-6 bg-[#10101A] border-y border-white/5"
    aria-labelledby={id}
  >
    <div className="max-w-5xl mx-auto">
      <div className="mb-16 text-center">
        <h2
          id={id}
          className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[#F5EDE0]"
        >
          Simple, Transparent Pricing
        </h2>
        <p className="max-w-xl mx-auto text-lg text-[#F5EDE0]/60 font-light">
          Start free for 14 days. No credit card required.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-center">
        {pricingData.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 rounded-3xl border ${plan.popular ? "bg-[#E8603A] border-[#E8603A] transform md:-translate-y-4 shadow-[0_0_40px_rgba(232,96,58,0.2)]" : "bg-[#08080F] border-white/10"}`}
          >
            {plan.popular && (
              <div className="bg-[#08080F]/20 text-[#08080F] text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block mb-4">
                Most Popular
              </div>
            )}
            <h3
              className={`text-2xl font-serif font-bold mb-2 ${plan.popular ? "text-[#08080F]" : "text-[#F5EDE0]"}`}
            >
              {plan.name}
            </h3>
            <div className="mb-6">
              <span
                className={`text-4xl font-bold ${plan.popular ? "text-[#08080F]" : "text-[#F5EDE0]"}`}
              >
                {plan.price}
              </span>
              <span
                className={`text-sm ${plan.popular ? "text-[#08080F]/70" : "text-[#F5EDE0]/50"}`}
              >
                {plan.interval}
              </span>
            </div>
            <p
              className={`mb-8 text-sm leading-relaxed ${plan.popular ? "text-[#08080F]/80" : "text-[#F5EDE0]/60"}`}
            >
              {plan.description}
            </p>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckIcon
                    className={`w-5 h-5 shrink-0 ${plan.popular ? "text-[#08080F]" : "text-[#E8603A]"}`}
                  />
                  <span
                    className={`text-sm ${plan.popular ? "text-[#08080F]/90" : "text-[#F5EDE0]/80"}`}
                  >
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`block w-full py-4 rounded-full text-center font-bold transition-all ${plan.popular ? "bg-[#08080F] text-[#F5EDE0] hover:bg-black" : "bg-white/5 text-[#F5EDE0] hover:bg-white/10"}`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </motion.section>
)

// ─── FAQ ─────────────────────────────────────────────────────────
const FAQAccordion = memo(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-left focus:outline-none"
      >
        <h3 className="text-lg font-serif font-bold text-[#F5EDE0]">{question}</h3>
        <FiChevronDown
          className={`w-5 h-5 text-[#E8603A] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#F5EDE0]/60 font-light leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
FAQAccordion.displayName = "FAQAccordion"

const FAQ = ({ variants, id }) => (
  <motion.section
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    className="px-4 py-24 sm:py-32 sm:px-6 bg-[#08080F]"
    aria-labelledby={id}
  >
    <div className="max-w-3xl mx-auto">
      <div className="mb-16 text-center">
        <h2
          id={id}
          className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[#F5EDE0]"
        >
          Frequently Asked Questions
        </h2>
      </div>
      <div className="bg-[#10101A] p-8 rounded-3xl border border-white/5">
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
    className="relative px-4 py-24 overflow-hidden sm:py-32 sm:px-6"
  >
    <div className="absolute inset-0 bg-[#E8603A]" aria-hidden="true" />
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: "radial-gradient(circle, #08080F 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      aria-hidden="true"
    />
    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight text-[#08080F] sm:text-5xl md:text-6xl">
        Ready to Transform Your Workflow?
      </h2>
      <p className="max-w-xl mx-auto mb-12 text-lg text-[#08080F]/80">
        Get started in 30 seconds. Create your account, add your first project, invite your team,
        and start shipping.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <Link
          to="/register"
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-[#F5EDE0] bg-[#08080F] hover:bg-black transition-colors"
          aria-label="Start free trial"
        >
          Start Free Trial
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </motion.section>
)

// ─── Footer ──────────────────────────────────────────────────────
const Footer = () => {
  return (
    <footer className="px-4 py-16 border-t sm:py-24 sm:px-6 border-white/5 bg-[#08080F]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-12 mb-16 md:grid-cols-4">
          <div>
            <h4 className="mb-6 font-serif text-lg font-bold text-[#F5EDE0]">Product</h4>
            <ul className="space-y-4 text-sm text-[#F5EDE0]/60">
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-serif text-lg font-bold text-[#F5EDE0]">Resources</h4>
            <ul className="space-y-4 text-sm text-[#F5EDE0]/60">
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Guides
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-serif text-lg font-bold text-[#F5EDE0]">Company</h4>
            <ul className="space-y-4 text-sm text-[#F5EDE0]/60">
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-serif text-lg font-bold text-[#F5EDE0]">Legal</h4>
            <ul className="space-y-4 text-sm text-[#F5EDE0]/60">
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8603A] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-8 border-t border-white/5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8603A]">
              <span className="font-serif text-sm font-bold text-[#08080F]">T</span>
            </div>
            <span className="font-serif text-lg font-bold text-[#F5EDE0]">TaskFlow</span>
          </div>
          <p className="text-sm text-[#F5EDE0]/40">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
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
    <div className="min-h-screen bg-[#08080F] text-[#F5EDE0] font-sans selection:bg-[#E8603A]/30 selection:text-[#F5EDE0]">
      <a
        href={`#${mainId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#E8603A] focus:text-[#08080F] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-bold focus:shadow-md"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id={mainId}>
        <Hero variants={variants} reduced={r} />
        <Ticker />
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
