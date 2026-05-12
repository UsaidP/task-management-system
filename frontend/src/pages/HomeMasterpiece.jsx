import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import {
  ArrowDown,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  GitBranch,
  Globe,
  Layout,
  Lock,
  MessageSquare,
  Moon,
  Play,
  Quote,
  Shield,
  Sparkles,
  Star,
  Table,
  Users,
  Zap,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import * as THREE from "three"
import Logo from "../components/common/Logo"
import { useTheme } from "../theme/ThemeContext"
import ThemeToggle from "../theme/ThemeToggle"

/* ═══════════════════════════════════════════════════════════════
   Animation Presets
   ═══════════════════════════════════════════════════════════════ */
const fadeUp = (delay = 0, dur = 0.65) => ({
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: dur, ease: [0.23, 1, 0.32, 1], delay },
  },
})

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut", delay } },
})

const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
  },
})

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const staggerFast = { visible: { transition: { staggerChildren: 0.05 } } }

/* ═══════════════════════════════════════════════════════════════
   Utility Hooks
   ═══════════════════════════════════════════════════════════════ */
const useAnimatedCounter = (target, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  const start = useCallback(() => {
    if (hasStarted) return
    setHasStarted(true)
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3 // ease-out cubic
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, hasStarted])

  return { count, start, ref: null }
}

/* ═══════════════════════════════════════════════════════════════
   Scroll Progress Bar
   ═══════════════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left bg-gradient-to-r from-accent-primary via-accent-warm to-accent-primary"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════
   Navbar
   ═══════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [])

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#showcase", label: "Product" },
    { href: "#pricing", label: "Pricing" },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-light-bg-primary/85 dark:bg-dark-bg-primary/85 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)] border-b border-border py-2.5"
            : "bg-transparent py-5"
        }`}
      >
        <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
          <Logo size="lg" to="/" className="font-serif" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-light-bg-secondary/60 dark:bg-dark-bg-secondary/60 backdrop-blur-sm rounded-full px-1.5 py-1 border border-border/50">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full text-text-muted hover:text-text-primary hover:bg-white/80 dark:hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-border bg-white/50 dark:bg-white/5 text-sm font-semibold text-text-primary hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full bg-text-primary text-bg-primary text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center w-10 h-10 border rounded-full md:hidden border-border"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={mobileOpen ? "open" : "closed"}
                className="flex flex-col gap-1.25"
              >
                <motion.span
                  variants={{ open: { rotate: 45, y: 5 }, closed: { rotate: 0, y: 0 } }}
                  className="block w-4 h-[1.5px] bg-text-primary origin-center"
                />
                <motion.span
                  variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
                  className="block w-4 h-[1.5px] bg-text-primary"
                />
                <motion.span
                  variants={{ open: { rotate: -45, y: -5 }, closed: { rotate: 0, y: 0 } }}
                  className="block w-4 h-[1.5px] bg-text-primary origin-center"
                />
              </motion.div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[72px] z-40 bg-light-bg-primary/95 dark:bg-dark-bg-primary/95 backdrop-blur-2xl border-b border-border p-6 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium transition-all rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px my-2 bg-border" />
              <Link
                to="/login"
                className="px-4 py-3 text-base font-semibold text-center rounded-xl text-text-primary"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-3 text-base font-bold text-center rounded-xl bg-text-primary text-bg-primary"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Three.js Hero Canvas (Enhanced)
   ═══════════════════════════════════════════════════════════════ */
const HeroCanvas = () => {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    let animationId
    let cleanup

    const W = canvas.clientWidth
    const H = canvas.clientHeight
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.set(4, 0, 10)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const tl = new THREE.PointLight(0xc4654a, 3, 18)
    tl.position.set(3, 4, 5)
    scene.add(tl)
    const bl = new THREE.PointLight(0x6888a0, 2, 18)
    bl.position.set(8, -3, 3)
    scene.add(bl)
    const sl = new THREE.PointLight(0x7a9a6d, 1.5, 20)
    sl.position.set(-2, 5, 4)
    scene.add(sl)
    // Additional warm rim light
    const rim = new THREE.PointLight(0xd4a548, 1.2, 15)
    rim.position.set(-4, 2, 6)
    scene.add(rim)

    // Cards (floating UI mockup panels)
    const cards = [
      { color: 0x6888a0, pos: [2.5, 1.8, 0], rot: [0.05, -0.2, 0.08], scale: 1 },
      { color: 0xc4654a, pos: [5.2, 0.2, 1], rot: [-0.1, 0.15, 0.06], scale: 0.9 },
      { color: 0x7a9a6d, pos: [1.8, -1.6, 2], rot: [0.12, -0.05, 0.1], scale: 0.85 },
      { color: 0xd4a548, pos: [6.5, 1.6, -1], rot: [-0.06, 0.25, -0.05], scale: 0.95 },
      { color: 0x8b70a0, pos: [4.0, -1.2, -2], rot: [0.08, -0.12, 0.04], scale: 0.8 },
      { color: 0xc4654a, pos: [0.5, 0.8, -1.5], rot: [0.15, 0.1, -0.08], scale: 0.7 },
    ]

    const meshes = []
    const geo = new THREE.PlaneGeometry(2.6, 1.62)
    cards.forEach((cd, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: cd.color,
        transparent: true,
        roughness: 0.4,
        metalness: 0.1,
        opacity: 0.85,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...cd.pos)
      mesh.rotation.set(...cd.rot)
      mesh.scale.setScalar(cd.scale)
      mesh.userData = {
        basePos: [...cd.pos],
        baseRot: [...cd.rot],
        phase: i * 0.72,
        baseScale: cd.scale,
      }
      scene.add(mesh)
      meshes.push(mesh)
    })

    // Particles — two layers for depth
    const createParticles = (
      count,
      color,
      size,
      opacity,
      spread
    ) => {
      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        pPos[i * 3] = (Math.random() - 0.2) * spread + 4
        pPos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7
        pPos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.4
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3))
      return new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color, size, transparent: true, opacity, sizeAttenuation: true })
      )
    }
    scene.add(createParticles(200, 0xc4654a, 0.04, 0.35, 20))
    scene.add(createParticles(100, 0x6888a0, 0.025, 0.2, 24))
    scene.add(createParticles(60, 0xd4a548, 0.06, 0.15, 18))

    // Mouse tracking
    let mx = 0
    let my = 0
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.4
      my = (e.clientY / window.innerHeight - 0.5) * 0.3
    }
    document.addEventListener("mousemove", onMove)

    let t = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      t += 0.008

      meshes.forEach((m) => {
        const { basePos: bp, baseRot: br, phase: ph, baseScale: bs } = m.userData
        m.position.x = bp[0] + Math.sin(t + ph) * 0.15
        m.position.y = bp[1] + Math.cos(t * 0.7 + ph) * 0.12
        m.rotation.x = br[0] + Math.sin(t * 0.5 + ph) * 0.03
        m.rotation.y = br[1] + Math.cos(t * 0.4 + ph) * 0.04
        m.scale.setScalar(bs + Math.sin(t * 0.3 + ph) * 0.02)
      })

      camera.position.x = 4 + mx * 1.5
      camera.position.y = my * 1.0
      camera.lookAt(5, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener("resize", onResize)

    cleanup = () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      geo.dispose()
      meshes.forEach((m) => {
        m.material.dispose()
      })
    }

    return () => {
      if (cleanup) cleanup()
    }
  }, [reduced])

  if (reduced) return null
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-light-bg-primary/50 dark:bg-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 60% at 20% 50%, transparent 30%, #1A1614 75%), radial-gradient(ellipse 50% 80% at 100% 100%, rgba(196,101,74,0.06) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 60% at 20% 50%, transparent 30%, #FAF6F1 75%), radial-gradient(ellipse 50% 80% at 100% 100%, rgba(196,101,74,0.06) 0%, transparent 60%)",
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Rotating Text Effect
   ═══════════════════════════════════════════════════════════════ */
const RotatingWords = ({ words }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span className="inline-block relative h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="block italic text-primary"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════════════════════════ */
const Hero = () => (
  <section className="relative flex items-center min-h-screen pt-20 overflow-hidden">
    <HeroCanvas />
    <div className="relative z-10 max-w-5xl px-6 mx-auto">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
        <motion.div
          variants={fadeUp(0)}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-accent-primary/30 bg-accent-primary/8 backdrop-blur-sm text-xs font-semibold text-primary mb-8 tracking-wider uppercase"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full animate-ping bg-primary opacity-60" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
          </span>
          Now with AI Sprint Planning
          <ChevronRight size={12} className="text-primary/60" />
        </motion.div>

        <motion.h1
          variants={fadeUp(0.1)}
          className="font-serif text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-text-primary mb-6"
        >
          Projects that
          <br />
          <RotatingWords words={["actually ship.", "hit deadlines.", "stay on track.", "move fast."]} />
        </motion.h1>

        <motion.p
          variants={fadeUp(0.2)}
          className="max-w-xl mb-10 text-lg font-light leading-relaxed md:text-xl text-text-secondary"
        >
          TaskFlow connects sprints, kanban boards, and team collaboration in one workspace.
          Stop juggling tabs — start closing tickets.
        </motion.p>

        <motion.div variants={fadeUp(0.3)} className="flex flex-wrap gap-3.5 mb-16">
          <Link
            to="/register"
            className="group relative px-7 py-3.5 rounded-xl bg-text-primary text-bg-primary text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <Sparkles size={16} strokeWidth={2.5} /> Start Free — 14 Days
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#showcase"
            className="group px-7 py-3.5 rounded-xl bg-white/8 backdrop-blur-sm border border-white/15 text-text-primary text-sm font-medium hover:bg-white/15 transition-all duration-300 flex items-center gap-2"
          >
            <Play size={14} className="text-primary" /> Watch Demo
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp(0.4)}
          className="flex flex-wrap gap-12 border-t pt-9 border-border/60"
        >
          {[
            { value: "10K+", label: "Active teams", icon: Users },
            { value: "2.4M", label: "Tasks completed", icon: Check },
            { value: "99.9%", label: "Uptime SLA", icon: Shield },
            { value: "4.9★", label: "Avg rating", icon: Star },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="group">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="transition-colors text-primary/50 group-hover:text-primary" />
                <span className="font-serif text-3xl font-bold leading-none tracking-tight md:text-4xl text-text-primary">
                  {value}
                </span>
              </div>
              <div className="mt-1 text-xs text-text-muted">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      className="absolute z-10 flex flex-col items-center gap-2 -translate-x-1/2 bottom-8 left-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      <span className="text-[10px] tracking-widest uppercase text-text-muted font-medium">Scroll</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <ArrowDown className="w-4 h-4 text-text-muted" />
      </motion.div>
    </motion.div>
  </section>
)

/* ═══════════════════════════════════════════════════════════════
   Logo Ticker / Social Proof
   ═══════════════════════════════════════════════════════════════ */
const LogoTicker = () => {
  const companies = [
    "Stripe", "Vercel", "Linear", "Notion", "Figma",
    "Supabase", "Resend", "Clerk", "Railway", "Planetscale",
  ]

  return (
    <section className="py-14 border-y border-border bg-bg-surface/50">
      <div className="px-6 mx-auto mb-8 max-w-7xl">
        <p className="text-center text-xs font-medium tracking-[0.2em] uppercase text-text-muted">
          Trusted by teams at
        </p>
      </div>
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-20 whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {[...companies, ...companies, ...companies].map((name, i) => (
            <span
              key={i}
              className="font-serif text-lg font-bold tracking-wide transition-colors select-none text-text-muted/40 hover:text-text-muted/70"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Feature Ticker
   ═══════════════════════════════════════════════════════════════ */
const Ticker = () => {
  const items = [
    "Kanban Boards", "Sprint Planning", "Timeline View", "Team Collaboration",
    "Role-Based Access", "Gantt Charts", "Calendar View", "Dark Mode",
    "AI Summaries", "Real-Time Sync", "Custom Workflows", "Table View",
  ]
  return (
    <div className="overflow-hidden border-y border-border bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 py-3.5">
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        {[...items, ...items].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 text-xs font-medium text-text-muted tracking-wider uppercase"
          >
            <Zap size={14} className="text-primary" /> {t}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Features
   ═══════════════════════════════════════════════════════════════ */
const Features = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const features = [
    {
      icon: Layout,
      title: "Unified Workspace",
      desc: "Every project, every task, every team member — consolidated. No more context-switching between tools.",
      accent: "#C4654A",
    },
    {
      icon: Zap,
      title: "Kanban & Sprints",
      desc: "Drag-and-drop cards across custom columns. Visualise velocity. Close the sprint with confidence.",
      accent: "#6888A0",
    },
    {
      icon: Calendar,
      title: "Timeline & Gantt",
      desc: "Map dependencies and milestones at a glance. Spot blockers before they become incidents.",
      accent: "#7A9A6D",
    },
    {
      icon: Table,
      title: "Table View",
      desc: "Spreadsheet-style power for ops-heavy teams. Sort, filter, and bulk-edit without missing a beat.",
      accent: "#D4A548",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      desc: "Granular RBAC — admins, members, guests. Keep the right people in the right context.",
      accent: "#8B70A0",
    },
    {
      icon: Moon,
      title: "Dark Mode Native",
      desc: "Seamless theme switching, built from day one. Not an afterthought — a design principle.",
      accent: "#6888A0",
    },
    {
      icon: MessageSquare,
      title: "In-Task Threads",
      desc: "Discuss work where the work happens. Inline comments, @mentions, and file attachments on every card.",
      accent: "#C4654A",
    },
    {
      icon: GitBranch,
      title: "Custom Workflows",
      desc: "Define your own stages, automations, and triggers. Every team works differently — TaskFlow adapts.",
      accent: "#7A9A6D",
    },
    {
      icon: Cpu,
      title: "AI Assistant",
      desc: "Auto-generate sprint summaries, detect blockers, and get smart task estimates powered by AI.",
      accent: "#D4A548",
    },
  ]

  return (
    <section id="features" className="px-6 py-24 md:py-32 bg-bg-canvas">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 mb-16 md:flex-row md:justify-between md:items-end">
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp(0)}
              className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
            >
              <div className="w-6 h-px bg-primary" /> Features
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp(0.1)}
              className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary max-w-xl"
            >
              Everything your team needs.
              <br />
              <span className="text-text-secondary">Nothing it doesn't.</span>
            </motion.h2>
          </div>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.2)}
            className="max-w-sm text-base leading-relaxed text-text-secondary"
          >
            Purpose-built for product and engineering teams who care about momentum, not status
            meetings.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border md:grid-cols-2 lg:grid-cols-3 bg-border border-border rounded-2xl">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp(i * 0.06)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative p-8 overflow-hidden transition-colors duration-300 cursor-default bg-bg-surface group"
              style={{
                backgroundColor:
                  hoveredIdx === i
                    ? `color-mix(in srgb, ${f.accent} 4%, var(--color-bg-surface))`
                    : undefined,
              }}
            >
              {/* Top accent bar on hover */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: hoveredIdx === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ background: f.accent, transformOrigin: "left" }}
              />

              <div
                className="w-11 h-11 rounded-[11px] border flex items-center justify-center mb-5 transition-all duration-300"
                style={{
                  background: `${f.accent}12`,
                  borderColor: `${f.accent}25`,
                  color: f.accent,
                }}
              >
                <f.icon size={18} strokeWidth={2} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-text-primary mb-2.5">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   How It Works
   ═══════════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Create Your Workspace",
      desc: "Sign up in 30 seconds. Set your team name, invite members, and pick a template — or start blank.",
      icon: Globe,
      accent: "#C4654A",
    },
    {
      num: "02",
      title: "Build Your Board",
      desc: "Customize columns, define workflows, and import existing tasks. Drag to prioritize. Tag to categorize.",
      icon: Layout,
      accent: "#6888A0",
    },
    {
      num: "03",
      title: "Run Your Sprint",
      desc: "Assign tasks, set story points, track velocity in real-time. AI flags blockers before they slow you down.",
      icon: Zap,
      accent: "#7A9A6D",
    },
    {
      num: "04",
      title: "Ship & Iterate",
      desc: "Close the sprint, review the retrospective, and plan the next cycle — all in the same view.",
      icon: Rocket,
      accent: "#D4A548",
    },
  ]

  return (
    <section id="how-it-works" className="relative px-6 py-24 overflow-hidden md:py-32 bg-bg-surface">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0)}
            className="flex items-center justify-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
          >
            <div className="w-6 h-px bg-primary" /> How It Works
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.1)}
            className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary"
          >
            From signup to shipped in four steps.
          </motion.h2>
        </div>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-border via-border to-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp(i * 0.12)}
              className="relative group"
            >
              <div className="relative transition-all duration-300 border bg-bg-canvas rounded-2xl p-7 border-border hover:border-accent-primary/30 hover:shadow-lg hover:-translate-y-1">
                {/* Step number */}
                <div
                  className="relative z-10 flex items-center justify-center w-10 h-10 mb-5 text-sm font-bold text-white rounded-full shadow-lg"
                  style={{ background: step.accent }}
                >
                  {step.num}
                </div>
                <div
                  className="flex items-center justify-center mb-4 border rounded-lg w-9 h-9"
                  style={{ borderColor: `${step.accent}25`, color: step.accent }}
                >
                  <step.icon size={16} />
                </div>
                <h3 className="mb-2 font-serif text-lg font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Need to add Rocket import — we'll use a simple SVG inline or add to imports
const Rocket = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

/* ═══════════════════════════════════════════════════════════════
   Showcase (Enhanced)
   ═══════════════════════════════════════════════════════════════ */
const Showcase = () => {
  const checks = [
    "Real-time updates — no refresh, no lag",
    "Sub-tasks, threads, and file attachments on every card",
    "AI-generated sprint summaries and blockers digest",
    "One-click import from Jira, Asana, or Trello",
    "Custom automations and workflow triggers",
    "Built-in time tracking and estimation",
  ]

  return (
    <section id="showcase" className="px-6 py-24 md:py-32 bg-bg-canvas">
      <div className="grid items-center max-w-6xl grid-cols-1 gap-16 mx-auto lg:grid-cols-2">
        <div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0)}
            className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
          >
            <div className="w-6 h-px bg-primary" /> Product
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.1)}
            className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary max-w-md"
          >
            Your entire sprint in one frame.
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.2)}
            className="max-w-md mt-4 text-base leading-relaxed text-text-secondary"
          >
            No more jumping between Jira, Notion, and spreadsheets. TaskFlow gives every team a
            single source of truth that actually stays current.
          </motion.p>
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.3)}
            className="mt-8 space-y-3.5"
          >
            {checks.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-3 text-sm text-text-secondary"
              >
                <div className="w-5 h-5 rounded-full bg-accent-success/15 border border-accent-success/35 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-success" />
                </div>
                {c}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={scaleIn(0.2)}
          className="relative"
        >
          {/* Glow behind the card */}
          <div className="absolute pointer-events-none -inset-8 bg-gradient-to-br from-accent-primary/8 via-transparent to-accent-primary/5 rounded-3xl blur-2xl" />

          <div className="perspective-[900px] relative">
            <div className="transform rotate-y-[-16deg] rotate-x-[6deg] rounded-[16px] overflow-hidden shadow-2xl border border-border/80 transition-transform duration-700 hover:rotate-y-[-6deg] hover:rotate-x-[3deg]">
              {/* Window chrome */}
              <div className="bg-bg-elevated h-8 flex items-center px-3.5 gap-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
                </div>
                <div className="flex justify-center flex-1">
                  <div className="bg-bg-canvas rounded-md px-4 py-0.5 text-[10px] text-text-muted font-mono">
                    taskflow.app/board/sprint-42
                  </div>
                </div>
              </div>

              {/* Board content */}
              <div className="grid grid-cols-4 gap-3 p-4 bg-bg-surface">
                {[
                  {
                    name: "To Do",
                    color: "#8B8178",
                    count: 2,
                    cards: [
                      { t: "Design onboarding flow", tag: "Design", tc: "#6888A0", av: "#6888A0", a: "A", sp: 3 },
                      { t: "Update API docs", tag: "Docs", tc: "#7A9A6D", av: "#7A9A6D", a: "U", sp: 2 },
                    ],
                  },
                  {
                    name: "In Progress",
                    color: "#C4654A",
                    count: 2,
                    cards: [
                      { t: "Sprint dashboard v2", tag: "Urgent", tc: "#C4654A", av: "#C4654A", a: "S", sp: 5 },
                      { t: "Fix SSE reconnection", tag: "Bug", tc: "#C44A4A", av: "#6888A0", a: "A", sp: 2 },
                    ],
                  },
                  {
                    name: "Review",
                    color: "#D4A548",
                    count: 1,
                    cards: [
                      { t: "RBAC permission audit", tag: "Review", tc: "#D4A548", av: "#7A9A6D", a: "L", sp: 3 },
                    ],
                  },
                  {
                    name: "Done",
                    color: "#7A9A6D",
                    count: 3,
                    cards: [
                      { t: "Redis rate limiter", tag: "Done", tc: "#7A9A6D", sp: 2 },
                      { t: "Docker CI pipeline", tag: "Done", tc: "#7A9A6D", sp: 3 },
                    ],
                  },
                ].map((col) => (
                  <div key={col.name}>
                    <div className="flex items-center justify-between pb-2.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: col.color }}
                        />
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-text-muted">
                          {col.name}
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                        style={{ background: `${col.color}18`, color: col.color }}
                      >
                        {col.count}
                      </span>
                    </div>
                    {col.cards.map((c, ci) => (
                      <div
                        key={ci}
                        className="bg-bg-canvas rounded-lg p-2.5 mb-2 border border-border/80 hover:border-border hover:shadow-sm transition-all cursor-default"
                      >
                        <div className="text-[11px] font-medium text-text-primary mb-2 leading-snug">
                          {c.t}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ background: `${c.tc}1A`, color: c.tc }}
                          >
                            {c.tag}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {c.sp && (
                              <span className="text-[8px] text-text-muted font-mono">
                                {c.sp}sp
                              </span>
                            )}
                            {c.av && (
                              <div
                                className="w-[14px] h-[14px] rounded-full text-[7px] font-bold text-white flex items-center justify-center"
                                style={{ background: c.av }}
                              >
                                {c.a}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Sprint footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-bg-elevated border-border">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-medium text-text-muted uppercase tracking-wider">
                    Sprint 42
                  </span>
                  <div className="h-1.5 w-24 bg-bg-canvas rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-warm"
                      style={{ width: "68%" }}
                    />
                  </div>
                  <span className="text-[9px] text-text-muted font-mono">68%</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[14px] h-[14px] rounded-full border-2 border-bg-surface -ml-1 first:ml-0"
                      style={{
                        background: ["#C4654A", "#6888A0", "#7A9A6D", "#D4A548"][i],
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Stats / Metrics Band
   ═══════════════════════════════════════════════════════════════ */
const MetricsBand = () => {
  const metrics = [
    { value: "40%", label: "Faster sprint velocity", suffix: "" },
    { value: "3", label: "Tools replaced on average", suffix: "" },
    { value: "2min", label: "Average onboarding time", suffix: "" },
    { value: "10x", label: "Fewer status meetings", suffix: "" },
  ]

  return (
    <section className="relative px-6 py-16 overflow-hidden bg-bg-surface text-text-primary">
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-primary/10" />

      <div className="relative grid max-w-6xl grid-cols-2 gap-8 mx-auto md:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp(i * 0.1)}
            className="text-center"
          >
            <div className="mb-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              {m.value}
            </div>
            <div className="text-sm font-medium text-text-secondary">{m.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Testimonials (Enhanced)
   ═══════════════════════════════════════════════════════════════ */
const Testimonials = () => {
  const data = [
    {
      name: "Sarah K.",
      role: "Product Lead at FinTech Startup",
      text: "TaskFlow replaced three tools overnight. Our sprint velocity went up 40% in the first month — and we stopped having daily standups just to track status.",
      color: "#C4654A",
      initial: "S",
      company: "FinTech Startup",
    },
    {
      name: "Mike R.",
      role: "Agency Owner, Creative Studio",
      text: "The visual design is gorgeous but the workflow is what keeps us here. Jira felt like filing expense reports. TaskFlow feels like actually building things.",
      color: "#6888A0",
      initial: "M",
      company: "Creative Studio",
    },
    {
      name: "Lisa M.",
      role: "Founder at Launch Stage Startup",
      text: "Finally a task manager that doesn't feel like it was built in 2005. The RBAC alone saved us hours of onboarding new contractors every month.",
      color: "#7A9A6D",
      initial: "L",
      company: "Launch Startup",
    },
    {
      name: "David C.",
      role: "Engineering Manager",
      text: "We migrated 200+ issues from Jira in one click. The sprint board is buttery smooth and the AI summaries catch blockers I would have missed.",
      color: "#D4A548",
      initial: "D",
      company: "SaaS Company",
    },
  ]

  return (
    <section className="px-6 py-24 md:py-32 bg-bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-end mb-14">
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp(0)}
              className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
            >
              <div className="w-6 h-px bg-primary" /> Testimonials
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp(0.1)}
              className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary max-w-2xl"
            >
              Teams that shipped more
              <br />
              <span className="text-text-secondary">switched to TaskFlow.</span>
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {data.map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp(i * 0.1)}
              className="relative p-8 overflow-hidden transition-all duration-300 border bg-bg-canvas border-border rounded-2xl hover:border-accent-primary/25 hover:shadow-lg hover:-translate-y-1 group"
            >
              {/* Quote icon */}
              <Quote
                size={32}
                className="absolute transition-colors top-6 right-6 text-border/50 group-hover:text-accent-primary/15"
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className="fill-warning text-warning"
                  />
                ))}
              </div>

              <p className="text-[15px] leading-[1.7] text-text-secondary mb-7 font-serif relative">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                <div
                  className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full shadow-md"
                  style={{ background: t.color }}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{t.name}</div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Integrations Section
   ═══════════════════════════════════════════════════════════════ */
const Integrations = () => {
  const integrations = [
    { name: "GitHub", color: "#24292E" },
    { name: "Slack", color: "#4A154B" },
    { name: "Figma", color: "#F24E1E" },
    { name: "Notion", color: "#000000" },
    { name: "Jira", color: "#0052CC" },
    { name: "Asana", color: "#F06A6A" },
    { name: "Trello", color: "#0079BF" },
    { name: "Zapier", color: "#FF4A00" },
    { name: "Google", color: "#4285F4" },
    { name: "Linear", color: "#5E6AD2" },
  ]

  return (
    <section className="relative px-6 py-24 overflow-hidden md:py-32 bg-bg-canvas">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp(0)}
          className="flex items-center justify-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
        >
          <div className="w-6 h-px bg-primary" /> Integrations
        </motion.div>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp(0.1)}
          className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary mb-4"
        >
          Plays well with your stack.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp(0.15)}
          className="max-w-lg mx-auto text-base leading-relaxed text-text-secondary mb-14"
        >
          Connect the tools you already use. One-click imports, real-time sync, and webhook support
          for everything else.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerFast}
          className="flex flex-wrap justify-center gap-4"
        >
          {integrations.map((int, i) => (
            <motion.div
              key={int.name}
              variants={fadeUp(i * 0.04)}
              whileHover={{ y: -4, scale: 1.05 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-border bg-bg-surface hover:border-accent-primary/30 hover:shadow-md transition-all duration-200 cursor-default"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: int.color }}
              >
                {int.name[0]}
              </div>
              <span className="text-sm font-medium text-text-primary">{int.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp(0.6)}
          className="mt-8 text-sm text-text-muted"
        >
          + 50 more via our REST API and webhooks
        </motion.p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Pricing (Enhanced)
   ═══════════════════════════════════════════════════════════════ */
const Pricing = () => {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Starter",
      price: annual ? "$0" : "$0",
      period: "14-day free trial",
      features: [
        "Up to 5 members",
        "All core views",
        "5 active projects",
        "Community support",
        "Basic analytics",
      ],
      cta: "Start Free Trial",
      featured: false,
    },
    {
      name: "Pro",
      price: annual ? "$10" : "$12",
      period: annual ? "per member / month, billed annually" : "per member / month",
      features: [
        "Unlimited projects",
        "Unlimited team members",
        "Advanced sprint management",
        "Timeline & Gantt views",
        "Priority support",
        "Custom branding",
        "AI assistant",
      ],
      cta: "Get Started",
      featured: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Tailored to your needs",
      features: [
        "Everything in Pro",
        "SSO & SAML",
        "Dedicated account manager",
        "Custom integrations",
        "99.99% SLA guarantee",
        "On-premise option",
        "Custom contracts",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ]

  return (
    <section id="pricing" className="px-6 py-24 md:py-32 bg-bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0)}
            className="flex items-center justify-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
          >
            <div className="w-6 h-px bg-primary" /> Pricing
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.1)}
            className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary"
          >
            Simple. Transparent.
            <br />
            <span className="text-text-secondary">No surprises.</span>
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp(0.15)}
            className="mt-4 mb-8 text-base text-text-secondary"
          >
            Start free for 14 days. No credit card required. Cancel whenever.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp(0.2)}
            className="flex items-center justify-center gap-3"
          >
            <span
              className={`text-sm font-medium transition-colors ${!annual ? "text-text-primary" : "text-text-muted"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? "bg-accent-primary" : "bg-border"}`}
              aria-label="Toggle annual billing"
            >
              <motion.div
                layout
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                style={{ left: annual ? "26px" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${annual ? "text-text-primary" : "text-text-muted"}`}
            >
              Annual
            </span>
            {annual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider"
              >
                Save 17%
              </motion.span>
            )}
          </motion.div>
        </div>

        <div className="grid items-start grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp(i * 0.1)}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                p.featured
                  ? "bg-bg-surface border-accent-primary scale-[1.02] shadow-2xl shadow-accent-primary/10"
                  : "bg-bg-canvas border-border hover:border-border-strong hover:shadow-lg"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-[10px] font-bold px-3.5 py-1 rounded-full tracking-wider uppercase shadow-lg">
                  {p.badge}
                </div>
              )}

              <div
                className={`text-xs font-semibold tracking-wider uppercase mb-3 ${
                  p.featured ? "text-accent-primary" : "text-text-muted"
                }`}
              >
                {p.name}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-[52px] font-bold leading-none tracking-tight text-text-primary">
                  {p.price}
                </span>
                {p.price !== "Custom" && (
                  <span className="text-sm text-text-muted">
                    /mo
                  </span>
                )}
              </div>

              <div className="text-sm mb-7 text-text-secondary">
                {p.period}
              </div>

              <div className="h-px mb-7 bg-border" />

              <ul className="mb-8 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-text-secondary"
                  >
                    <Check
                      size={14}
                      className={`shrink-0 mt-0.5 ${
                        p.featured ? "text-accent-primary" : "text-accent-success"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full py-3.5 rounded-xl text-center text-sm font-bold transition-all duration-200 ${
                  p.featured
                    ? "bg-accent-primary text-white hover:bg-white hover:text-accent-primary shadow-lg shadow-accent-primary/25"
                    : "bg-text-primary text-bg-primary hover:opacity-90"
                } hover:-translate-y-0.5 hover:shadow-xl`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FAQ Section
   ═══════════════════════════════════════════════════════════════ */
const FAQItem = ({
  q,
  a,
  isOpen,
  onToggle,
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-40px" }}
    variants={fadeUp(0)}
    className="overflow-hidden transition-colors border border-border rounded-xl bg-bg-surface hover:border-accent-primary/20"
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-5 text-left px-7"
      aria-expanded={isOpen}
    >
      <span className="pr-4 text-base font-semibold text-text-primary">{q}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="shrink-0"
      >
        <ChevronDown size={18} className="text-text-muted" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="pb-6 text-sm leading-relaxed px-7 text-text-secondary">{a}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0)

  const faqs = [
    {
      q: "How does the 14-day free trial work?",
      a: "Sign up without a credit card and get full access to all Pro features for 14 days. At the end of the trial, choose a plan that works for you or continue with the free Starter tier.",
    },
    {
      q: "Can I import my data from Jira, Asana, or Trello?",
      a: "Absolutely. We have one-click import tools for Jira, Asana, Trello, Monday.com, and Linear. Your tasks, labels, assignments, and comments come over seamlessly. CSV import is also supported for custom data.",
    },
    {
      q: "Is TaskFlow suitable for enterprise teams?",
      a: "Yes. Our Enterprise plan includes SSO/SAML, advanced RBAC, dedicated account management, custom SLAs, audit logs, and on-premise deployment options. Contact our sales team for a custom quote.",
    },
    {
      q: "How does the AI assistant work?",
      a: "Our AI analyzes your sprint data to generate summaries, detect potential blockers, suggest task estimates, and provide retrospective insights. It runs on your data securely and never shares information between workspaces.",
    },
    {
      q: "What happens to my data if I cancel?",
      a: "Your data remains accessible in read-only mode for 30 days after cancellation. You can export everything (tasks, comments, files) as CSV or JSON at any time. We permanently delete data after the grace period.",
    },
  ]

  return (
    <section className="px-6 py-24 md:py-32 bg-bg-canvas">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp(0)}
            className="flex items-center justify-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-4"
          >
            <div className="w-6 h-px bg-primary" /> FAQ
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp(0.1)}
            className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-text-primary"
          >
            Questions? Answered.
          </motion.h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CTA Band (Enhanced)
   ═══════════════════════════════════════════════════════════════ */
const CTABand = () => (
  <section className="relative px-6 py-24 overflow-hidden md:py-36 bg-bg-surface">
    {/* Background effects */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(ellipse,rgba(196,101,74,0.1)_0%,transparent_65%)]" />
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>

    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp(0)}
        className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-semibold tracking-wider uppercase border rounded-full border-accent-primary/25 bg-accent-primary/6 text-primary"
      >
        <Sparkles size={12} /> No credit card required
      </motion.div>

      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp(0.1)}
        className="font-serif text-4xl md:text-6xl lg:text-[72px] font-bold leading-[1.05] tracking-tight text-text-primary mb-6"
      >
        Ready to
        <br />
        <em className="italic text-primary">actually ship?</em>
      </motion.h2>

      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp(0.15)}
        className="max-w-md mx-auto mb-12 text-lg leading-relaxed text-text-secondary"
      >
        Join 10,000+ teams who stopped managing their tools and started managing their work.
      </motion.p>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp(0.2)}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link
          to="/register"
          className="group relative px-8 py-4 rounded-xl bg-text-primary text-bg-primary text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          Start Free — No Card
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-all duration-200 border rounded-xl border-border bg-bg-canvas text-text-primary hover:bg-bg-hover hover:shadow-md"
        >
          <MessageSquare size={14} /> Talk to Sales
        </Link>
      </motion.div>

      {/* Trust signals */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp(0.4)}
        className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-text-muted"
      >
        {[
          { icon: Shield, text: "SOC 2 Compliant" },
          { icon: Lock, text: "256-bit Encryption" },
          { icon: Globe, text: "99.9% Uptime" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon size={12} />
            <span>{text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
)

/* ═══════════════════════════════════════════════════════════════
   Footer (Enhanced)
   ═══════════════════════════════════════════════════════════════ */
const Footer = () => (
  <footer className="px-6 pt-16 pb-8 border-t bg-bg-surface border-border">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-2 gap-10 md:grid-cols-5 mb-14">
        <div className="col-span-2 md:col-span-1">
          <Logo size="md" to="/" className="font-serif" />
          <p className="text-sm text-text-secondary leading-relaxed mt-4 max-w-[240px]">
            The project management tool built for teams that move fast and ship faster.
          </p>
          <div className="flex gap-3 mt-5">
            {["X", "GH", "LI"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-[10px] font-bold text-text-muted hover:text-text-primary hover:border-accent-primary/30 transition-all"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
        {[
          {
            title: "Product",
            links: ["Features", "Changelog", "Pricing", "Roadmap", "Integrations"],
          },
          {
            title: "Resources",
            links: ["Documentation", "Guides", "API Reference", "Status"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies"],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-5 text-xs font-semibold tracking-wide uppercase text-text-primary">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#footer-link"
                    className="text-sm transition-colors text-text-secondary hover:text-text-primary"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-between gap-5 pt-8 border-t border-border md:flex-row">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} TaskFlow, Inc. All rights reserved.
        </p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <div className="w-2 h-2 rounded-full bg-accent-success" /> All systems operational
          </div>
        </div>
      </div>
    </div>
  </footer>
)

/* ═══════════════════════════════════════════════════════════════
   Main Export
   ═══════════════════════════════════════════════════════════════ */
export const HomeMasterpiece = () => (
  <div className="min-h-screen font-sans bg-bg-canvas text-text-primary selection:bg-accent-primary/30 selection:text-white scroll-smooth">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent-primary focus:text-white focus:px-5 focus:py-2.5 focus:rounded-full focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
    >
      Skip to main content
    </a>
    
    <ScrollProgress />
    <Navbar />
    
    <main id="main" className="relative">
      <Hero />
      <LogoTicker />
      <Ticker />
      <Features />
      <HowItWorks />
      <Showcase />
      <MetricsBand />
      <Testimonials />
      <Integrations />
      <Pricing />
      <FAQ />
      <CTABand />
    </main>
    
    <Footer />
  </div>
)

export default HomeMasterpiece