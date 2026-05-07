import { useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronRight, Check, Sparkles, Zap, Layout, Calendar, Table, Users, Moon, Star, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { useTheme } from '../theme/ThemeContext'
import ThemeToggle from '../theme/ThemeToggle'

/* ─── Animation Helpers ─── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1], delay } }
})
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

/* ─── Navbar ─── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-xl border-b border-light-border dark:border-dark-border py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center font-sans text-sm font-medium text-white">T</div>
          TaskFlow
        </Link>
        <div className="hidden md:flex items-center gap-9">
          <a href="#features" className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Features</a>
          <a href="#showcase" className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Product</a>
          <a href="#pricing" className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="px-5 py-2.5 rounded-lg border border-accent-primary/10 bg-white text-accent-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border text-sm font-semibold hover:bg-white/90 dark:hover:bg-dark-bg-hover hover:shadow-md transition-all">Sign In</Link>
          <Link to="/register" className="px-5 py-2.5 rounded-lg bg-white text-accent-primary dark:bg-accent-primary dark:text-white text-sm font-bold shadow-glow dark:shadow-glow hover:bg-white/90 dark:hover:bg-accent-primary-dark hover:shadow-lg hover:-translate-y-0.5 transition-all">Get Started Free</Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── Three.js Hero Canvas ─── */
const HeroCanvas = () => {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    let animationId, cleanup

    const W = canvas.clientWidth, H = canvas.clientHeight
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.set(4, 0, 10)

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const tl = new THREE.PointLight(0xC4654A, 3, 18); tl.position.set(3, 4, 5); scene.add(tl)
    const bl = new THREE.PointLight(0x6888A0, 2, 18); bl.position.set(8, -3, 3); scene.add(bl)
    const sl = new THREE.PointLight(0x7A9A6D, 1.5, 20); sl.position.set(-2, 5, 4); scene.add(sl)

    const cards = [
      { color: 0x6888A0, pos: [2.5, 1.8, 0], rot: [0.05, -0.2, 0.08] },
      { color: 0xC4654A, pos: [5.2, 0.2, 1], rot: [-0.1, 0.15, 0.06] },
      { color: 0x7A9A6D, pos: [1.8, -1.6, 2], rot: [0.12, -0.05, 0.1] },
      { color: 0xD4A548, pos: [6.5, 1.6, -1], rot: [-0.06, 0.25, -0.05] },
      { color: 0x8B70A0, pos: [4.0, -1.2, -2], rot: [0.08, -0.12, 0.04] },
    ]

    const meshes = []
    const geo = new THREE.PlaneGeometry(2.6, 1.62)
    cards.forEach((cd, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: cd.color, transparent: true, roughness: 0.4, metalness: 0.1, opacity: 0.9, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...cd.pos); mesh.rotation.set(...cd.rot)
      mesh.userData = { basePos: [...cd.pos], baseRot: [...cd.rot], phase: i * 0.72 }
      scene.add(mesh); meshes.push(mesh)
    })

    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(180 * 3)
    for (let i = 0; i < 180; i++) { pPos[i*3] = (Math.random()-0.2)*20+4; pPos[i*3+1] = (Math.random()-0.5)*14; pPos[i*3+2] = (Math.random()-0.5)*8 }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xC4654A, size: 0.04, transparent: true, opacity: 0.4 })))

    let mx = 0, my = 0
    const onMove = (e) => { mx = (e.clientX/window.innerWidth-0.5)*0.4; my = (e.clientY/window.innerHeight-0.5)*0.3 }
    document.addEventListener('mousemove', onMove)

    let t = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate); t += 0.008
      meshes.forEach(m => {
        const { basePos: bp, baseRot: br, phase: ph } = m.userData
        m.position.x = bp[0]+Math.sin(t+ph)*0.12; m.position.y = bp[1]+Math.cos(t*0.7+ph)*0.1
        m.rotation.x = br[0]+Math.sin(t*0.5+ph)*0.03; m.rotation.y = br[1]+Math.cos(t*0.4+ph)*0.04
      })
      camera.position.x = 4+mx*1.5; camera.position.y = my*1.0; camera.lookAt(5, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => { const w=canvas.clientWidth,h=canvas.clientHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix() }
    window.addEventListener('resize', onResize)
    cleanup = () => { cancelAnimationFrame(animationId); document.removeEventListener('mousemove', onMove); window.removeEventListener('resize', onResize); renderer.dispose() }

    return () => { if (cleanup) cleanup() }
  }, [reduced])

  if (reduced) return null
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-light-bg-primary/60 dark:bg-transparent" />
      <div className="absolute inset-0" style={{ background: isDark ? 'radial-gradient(ellipse 80% 60% at 20% 50%, transparent 30%, #1A1614 75%), radial-gradient(ellipse 50% 80% at 100% 100%, rgba(196,101,74,0.06) 0%, transparent 60%)' : 'radial-gradient(ellipse 80% 60% at 20% 50%, transparent 30%, #FAF6F1 75%), radial-gradient(ellipse 50% 80% at 100% 100%, rgba(196,101,74,0.06) 0%, transparent 60%)' }} />
    </div>
  )
}

/* ─── Hero ─── */
const Hero = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
    <HeroCanvas />
    <div className="relative z-10 max-w-5xl mx-auto px-6">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
        <motion.div variants={fadeUp(0)} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-primary/35 bg-accent-primary/8 text-xs font-medium text-accent-primary mb-7 tracking-wider uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
          Now with AI sprint planning
        </motion.div>
        <motion.h1 variants={fadeUp(0.1)} className="font-serif text-5xl md:text-7xl lg:text-[86px] font-bold leading-[1.02] tracking-tight text-light-text-primary dark:text-dark-text-primary mb-6">
          Projects that<br /><em className="italic text-accent-primary block">actually ship.</em>
        </motion.h1>
        <motion.p variants={fadeUp(0.2)} className="text-lg md:text-xl leading-relaxed text-light-text-secondary dark:text-dark-text-secondary max-w-xl mb-10 font-light">
          TaskFlow connects sprints, kanban boards, and team collaboration in one workspace. Stop juggling tabs — start closing tickets.
        </motion.p>
        <motion.div variants={fadeUp(0.3)} className="flex flex-wrap gap-3.5 mb-14">
          <Link to="/register" className="group px-7 py-3.5 rounded-xl bg-white text-accent-primary dark:bg-accent-primary dark:text-white text-sm font-bold shadow-glow hover:bg-white/90 dark:hover:bg-accent-primary-dark hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] dark:hover:shadow-[0_12px_40px_rgba(196,101,74,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Sparkles size={16} strokeWidth={2.5} /> Start Free — 14 Days <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#showcase" className="px-7 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white dark:text-dark-text-secondary text-sm font-medium hover:bg-white hover:text-accent-primary dark:hover:bg-white/20 dark:hover:text-white transition-all flex items-center gap-2">
            Watch demo <ChevronRight size={14} />
          </a>
        </motion.div>
        <motion.div variants={fadeUp(0.4)} className="flex flex-wrap gap-10 pt-9 border-t border-light-border dark:border-dark-border">
          {[['10K+', 'Active teams'], ['50K+', 'Tasks completed'], ['99.9%', 'Uptime SLA']].map(([v, l]) => (
            <div key={l}><div className="font-serif text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary leading-none">{v}</div><div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">{l}</div></div>
          ))}
        </motion.div>
      </motion.div>
    </div>
    <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <ArrowDown className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
    </motion.div>
  </section>
)

/* ─── Ticker ─── */
const Ticker = () => {
  const items = ['Kanban Boards','Sprint Planning','Timeline View','Team Collaboration','Role-Based Access','Gantt Charts','Calendar View','Dark Mode','AI Summaries','Real-Time Sync','Custom Workflows','Table View']
  return (
    <div className="overflow-hidden border-y border-light-border dark:border-dark-border bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 py-3.5">
      <motion.div className="flex whitespace-nowrap gap-16" animate={{ x: [0, -1200] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        {[...items, ...items].map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary tracking-wider uppercase">
            <Zap size={14} className="text-accent-primary" /> {t}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Features ─── */
const Features = () => {
  const features = [
    { icon: Layout, title: 'Unified Workspace', desc: 'Every project, every task, every team member — consolidated. No more context-switching.' },
    { icon: Zap, title: 'Kanban & Sprints', desc: 'Drag-and-drop cards across custom columns. Visualise velocity. Close the sprint with confidence.' },
    { icon: Calendar, title: 'Timeline & Gantt', desc: 'Map dependencies and milestones at a glance. Spot blockers before they become incidents.' },
    { icon: Table, title: 'Table View', desc: 'Spreadsheet-style power for ops-heavy teams. Sort, filter, and bulk-edit without missing a beat.' },
    { icon: Users, title: 'Role-Based Access', desc: 'Granular RBAC — admins, members, guests. Keep the right people in the right context.' },
    { icon: Moon, title: 'Dark Mode Native', desc: 'Seamless theme switching, built from day one. Not an afterthought — a design principle.' },
  ]
  return (
    <section id="features" className="px-6 py-24 md:py-32 bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-16">
          <div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-accent-primary mb-4">
              <div className="w-6 h-px bg-accent-primary" /> Features
            </motion.div>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)} className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-light-text-primary dark:text-dark-text-primary max-w-xl">
              Everything your team needs. Nothing it doesn't.
            </motion.h2>
          </div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)} className="text-base text-light-text-secondary dark:text-dark-text-secondary max-w-sm leading-relaxed">
            Purpose-built for product and engineering teams who care about momentum, not status meetings.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-light-border dark:bg-dark-border border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(i * 0.08)} className="bg-light-bg-secondary dark:bg-dark-bg-tertiary p-8 hover:bg-light-bg-hover dark:hover:bg-dark-hover transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10.5 h-10.5 rounded-[10px] bg-accent-primary/12 border border-accent-primary/20 flex items-center justify-center mb-5 text-accent-primary">
                <f.icon size={18} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2.5">{f.title}</h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Showcase ─── */
const Showcase = () => {
  const checks = [
    'Real-time updates — no refresh, no lag',
    'Sub-tasks, threads, and file attachments on every card',
    'AI-generated sprint summaries and blockers digest',
    'One-click import from Jira, Asana, or Trello',
  ]
  return (
    <section id="showcase" className="px-6 py-24 md:py-32 bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-accent-primary mb-4">
            <div className="w-6 h-px bg-accent-primary" /> Product
          </motion.div>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)} className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-light-text-primary dark:text-dark-text-primary max-w-md">
            Your entire sprint in one frame.
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)} className="text-base text-light-text-secondary dark:text-dark-text-secondary max-w-md leading-relaxed mt-4">
            No more jumping between Jira, Notion, and spreadsheets. TaskFlow gives every team a single source of truth that actually stays current.
          </motion.p>
          <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.3)} className="mt-8 space-y-4">
            {checks.map((c) => (
              <li key={c} className="flex items-start gap-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <div className="w-5 h-5 rounded-full bg-accent-success/15 border border-accent-success/35 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-accent-success" />
                </div>
                {c}
              </li>
            ))}
          </motion.ul>
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)} className="relative">
          <div className="perspective-[900px]">
            <div className="transform rotate-y-[-18deg] rotate-x-[8deg] rounded-[14px] overflow-hidden shadow-card-hover dark:shadow-card-dark-hover border border-light-border dark:border-dark-border transition-transform duration-500 hover:rotate-y-[-8deg] hover:rotate-x-[4deg]">
              <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary h-7 flex items-center px-3 gap-1.5 border-b border-light-border dark:border-dark-border">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-danger" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-warning" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-success" />
              </div>
              <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { name: 'To Do', color: '#8B8178', cards: [{ t: 'Design onboarding', tag: 'Design', tc: '#6888A0', av: '#6888A0', a: 'A' }, { t: 'Update API docs', tag: 'Docs', tc: '#7A9A6D', av: '#7A9A6D', a: 'U' }] },
                  { name: 'In Progress', color: '#C4654A', cards: [{ t: 'Sprint dashboard', tag: 'Urgent', tc: '#C4654A', av: '#C4654A', a: 'U' }, { t: 'Fix SSE bug', tag: 'Bug', tc: '#C44A4A', av: '#6888A0', a: 'A' }] },
                  { name: 'Review', color: '#D4A548', cards: [{ t: 'RBAC audit', tag: 'Review', tc: '#D4A548', av: '#7A9A6D', a: 'U' }] },
                  { name: 'Done', color: '#7A9A6D', cards: [{ t: 'Redis rate limit', tag: 'Done', tc: '#7A9A6D' }, { t: 'Docker pipeline', tag: 'Done', tc: '#7A9A6D' }] },
                ].map((col) => (
                  <div key={col.name}>
                    <div className="text-[10px] font-medium tracking-wider uppercase text-light-text-tertiary dark:text-dark-text-tertiary pb-2.5 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: col.color }} /> {col.name}
                    </div>
                    {col.cards.map((c, ci) => (
                      <div key={ci} className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg p-2.5 mb-2 border border-light-border dark:border-dark-border">
                        <div className="text-[11px] text-light-text-primary dark:text-dark-text-primary mb-2 leading-snug">{c.t}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${c.tc}22`, color: c.tc }}>{c.tag}</span>
                          {c.av && <div className="w-4 h-4 rounded-full text-[8px] font-medium text-white flex items-center justify-center" style={{ background: c.av }}>{c.a}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Testimonials ─── */
const Testimonials = () => {
  const data = [
    { name: 'Sarah K.', role: 'Product Lead, FinTech startup', text: 'TaskFlow replaced three tools overnight. Our sprint velocity went up 40% in the first month — and we stopped having daily standups just to track status.', color: '#C4654A', initial: 'S' },
    { name: 'Mike R.', role: 'Agency Owner, Creative studio', text: 'The visual design is gorgeous but the workflow is what keeps us here. Jira felt like filing expense reports. TaskFlow feels like actually building things.', color: '#6888A0', initial: 'M' },
    { name: 'Lisa M.', role: 'Startup Founder, Launch stage', text: "Finally a task manager that doesn't feel like it was built in 2005. The RBAC alone saved us hours of onboarding new contractors every month.", color: '#7A9A6D', initial: 'L' },
  ]
  return (
    <section className="px-6 py-24 md:py-32 bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-accent-primary mb-4">
          <div className="w-6 h-px bg-accent-primary" /> Testimonials
        </motion.div>
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)} className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-light-text-primary dark:text-dark-text-primary max-w-2xl mb-14">
          Teams that shipped more switched to TaskFlow.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((t, i) => (
            <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(i * 0.1)} className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-[14px] p-7 hover:border-accent-primary/30 hover:-translate-y-1 transition-all">
              <div className="text-accent-warning text-sm mb-4 tracking-wider">★★★★★</div>
              <p className="text-sm leading-relaxed text-light-text-secondary dark:text-dark-text-secondary italic mb-6 font-serif text-base">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9.5 h-9.5 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: t.color }}>{t.initial}</div>
                <div><div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{t.name}</div><div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{t.role}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
const Pricing = () => {
  const plans = [
    { name: 'Free Trial', price: '$0', period: '14 days · No card needed', features: ['Up to 3 members', 'All core views', '5 active projects', 'Community support'], cta: 'Start Free Trial', featured: false },
    { name: 'Pro', price: '$12', period: 'per member / month', features: ['Unlimited projects', 'Unlimited team members', 'Advanced sprint management', 'Timeline & Gantt views', 'Priority support', 'Custom branding'], cta: 'Get Started', featured: true },
    { name: 'Enterprise', price: 'Custom', period: 'Contact for pricing', features: ['Everything in Pro', 'SSO & advanced security', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'Custom contracts'], cta: 'Contact Sales', featured: false },
  ]
  return (
    <section id="pricing" className="px-6 py-24 md:py-32 bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="flex items-center justify-center gap-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-accent-primary mb-4">
            <div className="w-6 h-px bg-accent-primary" /> Pricing
          </motion.div>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)} className="font-serif text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-light-text-primary dark:text-dark-text-primary">
            Simple. Transparent. No surprises.
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)} className="text-base text-light-text-secondary dark:text-dark-text-secondary mt-4">
            Start free for 14 days. No credit card. Cancel whenever.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(i * 0.1)} className={`relative rounded-[14px] p-8 border transition-all ${p.featured ? 'bg-accent-primary border-accent-primary scale-[1.03] shadow-glow' : 'bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border hover:border-light-border-strong dark:hover:border-dark-border-strong'}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-primary-dark text-white text-[11px] font-medium px-3 py-1 rounded-full tracking-wider uppercase">Most Popular</div>}
              <div className={`text-xs font-medium tracking-wider uppercase mb-3 ${p.featured ? 'text-white/70' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>{p.name}</div>
              <div className={`font-serif text-[52px] font-bold leading-none tracking-tight mb-1 ${p.featured ? 'text-white' : 'text-light-text-primary dark:text-dark-text-primary'}`}>{p.price}</div>
              <div className={`text-sm mb-6 ${p.featured ? 'text-white/65' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>{p.period}</div>
              <div className={`h-px mb-6 ${p.featured ? 'bg-white/20' : 'bg-light-border dark:bg-dark-border'}`} />
              <ul className="space-y-3 mb-7">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${p.featured ? 'text-white/80' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                    <Check size={14} className={`shrink-0 mt-0.5 ${p.featured ? 'text-white/90' : 'text-accent-success'}`} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`block w-full py-3.5 rounded-[9px] text-center text-sm font-semibold transition-all bg-white text-accent-primary dark:bg-accent-primary dark:text-white hover:bg-white/90 dark:hover:bg-accent-primary-dark hover:-translate-y-0.5 hover:shadow-lg ${!p.featured ? 'border border-accent-primary/20 dark:border-white/10' : ''}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Band ─── */
const CTABand = () => (
  <section className="px-6 py-24 md:py-32 bg-light-bg-primary dark:bg-dark-bg-primary text-center relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(196,101,74,0.12)_0%,transparent_70%)] pointer-events-none" />
    <div className="relative z-10 max-w-3xl mx-auto">
      <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="font-serif text-4xl md:text-6xl lg:text-[72px] font-bold leading-[1.05] tracking-tight text-light-text-primary dark:text-dark-text-primary mb-5">
        Ready to <em className="italic text-accent-primary">actually ship?</em>
      </motion.h2>
      <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)} className="text-base text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto mb-10 leading-relaxed">
        Join 10,000+ teams who stopped managing their tools and started managing their work.
      </motion.p>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)} className="flex flex-wrap justify-center gap-3.5">
        <Link to="/register" className="group px-7 py-3.5 rounded-xl bg-white text-accent-primary dark:bg-accent-primary dark:text-white text-sm font-bold shadow-glow hover:bg-white/90 dark:hover:bg-accent-primary-dark hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] dark:hover:shadow-[0_12px_40px_rgba(196,101,74,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
          Start Free — No Card <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/login" className="px-7 py-3.5 rounded-xl border border-accent-primary/10 dark:border-white/10 bg-white text-accent-primary dark:bg-white/5 dark:text-white text-sm font-semibold hover:bg-white/90 dark:hover:bg-white/15 hover:shadow-md transition-all">
          Talk to Sales
        </Link>
      </motion.div>
    </div>
  </section>
)

/* ─── Footer ─── */
const Footer = () => (
  <footer className="bg-light-bg-secondary dark:bg-dark-bg-secondary border-t border-light-border dark:border-dark-border px-6 pt-14 pb-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-14">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 font-serif text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            <div className="w-7 h-7 rounded-lg bg-accent-primary flex items-center justify-center text-xs font-medium text-white">T</div>
            TaskFlow
          </Link>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mt-4 max-w-[240px]">The project management tool built for teams that move fast and ship faster.</p>
        </div>
        {[
          { title: 'Product', links: ['Features', 'Changelog', 'Pricing', 'Roadmap'] },
          { title: 'Resources', links: ['Documentation', 'Guides', 'API Reference', 'Status'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-medium tracking-wider uppercase text-light-text-primary dark:text-dark-text-primary mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-light-border dark:border-dark-border pt-7 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">&copy; {new Date().getFullYear()} TaskFlow, Inc. All rights reserved.</p>
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">Made with precision &middot; Shipped with care</p>
      </div>
    </div>
  </footer>
)

/* ─── Main Export ─── */
export const HomeMasterpiece = () => (
  <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary font-sans selection:bg-accent-primary/30 selection:text-light-text-primary dark:selection:text-dark-text-primary">
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-accent-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-bold">Skip to main content</a>
    <Navbar />
    <main id="main">
      <Hero />
      <Ticker />
      <Features />
      <Showcase />
      <Testimonials />
      <Pricing />
      <CTABand />
    </main>
    <Footer />
  </div>
)

export default HomeMasterpiece