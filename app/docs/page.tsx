"use client";

import {
  ChevronLeft,
  ChevronRight,
  Globe,
  LogIn,
  Play,
  ArrowRight,
  Zap,
  Puzzle,
  Layers,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

/* ── Data ── */

const navLinks = [
  { label: "NEWS", active: true },
  { label: "SKILLS", active: false },
  { label: "TOOLS", active: false },
  { label: "PLUGINS", active: false },
  { label: "MCP", active: false },
  { label: "ECOSYSTEM", active: false },
];

const newsCards = [
  {
    badge: "VERSION 2.4.0",
    date: "Mar 27, 2026",
    title: "NEURAL OVERDRIVE ACTIVATED",
    description:
      "New MCP integrations for enhanced context window management and multi-agent orchestration now live.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA4l9TsIJQZDtHai0GJ82sO6JTfP4koPO3z3AeXBEzvJNNQjpj9N6dYv8Bo1cbr1pb2SBO5ZlaVcpySN2iW6Vh-RMwzXCanVQRND9WUopAQy_tWwqAqiUQdn74YK77_ebfSKrsB3DDRgm9EBhA_oUswPNEBM--KNZ7KpBrdDxdi1uK6Q24E0o-SAn8NSvK0TNyOPQ6nVTsX30kQE9XwM-dH1Q1nrbjsBjCddjLz_n7xH27Lbx9IN1WNPVuqKt79GZbeUjEywH8fk0c",
  },
  {
    badge: "HACKATHON",
    date: "Mar 20, 2026",
    title: "GLOBAL SEED ROUND OPEN",
    description:
      "The quest for the world's most efficient prompt engineer begins. $50,000 prize pool announced.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcHNWfjvEu6S4Nhuhlndnr593KvENwmb3iWZvzrjQsOX0hu9yx-_RhgEyu2UeG6xzS0pur0tt8qjttklinw2Mpa10AQ276Q6uI3V2QWg9RtZpx9FZj_keDqkPB7L6OR3NHqLfdRtjb7TdSDGAKmjVdRRARJL_sCA0JWn4W5Wkljs-Yxxb6DwEHOlgddSLgDUo13XCRgzyR_46llgl7gm5LS7SJWZq4aFflWrSh0i2apxS5Hh6saND9DudSnnVZMBDdfOjgpKtP2f4",
  },
  {
    badge: "TOOLKIT",
    date: "Mar 15, 2026",
    title: "STITCH-MCP PROTOCOL",
    description:
      "Connect your local development environment directly to the PromptWar arena with zero latency.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsKUxS7KH680XIxvJUyAwiNdmu9e5pvgauNrK0CjDFIOuvJzdQrW9ESs5eniwlikYdEFslRENGULM3a_QOgkXEMXyjxDtQhkwmHNkcXs8WGaQsmj_uAOPy-tOUR7R__7wYJwTnhy4HjvXki5k-4L8R6hKrIF-TKSfOR-RY8oMyXmSRJNPPgyVUQxD2sQ6Fal2R6fr3EIjvQ0yUdcjrZNS0793e6eO4exg7tq8rUeQrozNq_k9AjSbiVXiwwjxTGO_lfWYGdxSX3YQ",
  },
  {
    badge: "SECURITY",
    date: "Mar 10, 2026",
    title: "THREAT MODEL HARDENING",
    description:
      "Advanced security skills now scan for OWASP Top 10 vulnerabilities in real-time during hackathon builds.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP7-qpE70NyOnVMYfQ2HQX0GMs_1G9_FZBj9Z0CbwzmgsImiqXeLskOAh4J1q2KsFB8epnkIxKEI_1LzHifz2WCsZfSiRBGizaxikCTPQHptr6DrnQYmg5jYwKhK_VTiA9o4uuOifZWZi7s190Gq8MqxNF7m7Tw-JCebDAQq8v0zwtke4aSKf3dB_o3spN8NIe8sBoqV_XTJ_i7jkqOqn0MIfGPNoIZEPqcCEWJfl14zkZXMGfweaZ_fxbpZjID83o9G3O-6aC0_E",
  },
];

const ecosystemStats = [
  { icon: Zap, value: "20+", label: "Skills" },
  { icon: Layers, value: "6", label: "MCP Tools" },
  { icon: Puzzle, value: "3", label: "Plugins" },
  { icon: Trophy, value: "READY", label: "Hackathon" },
];

const toolCards = [
  { name: "shadcn", subtitle: "UI Component Forge" },
  { name: "Image-MCP", subtitle: "Visual Synthesis" },
  { name: "StitchMCP", subtitle: "Design Bridging" },
  { name: "GitKraken", subtitle: "Version Control Arena" },
];

const socialIcons = [
  { alt: "X", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB5dJ0fct1acGdSAaAGTd9xB7anC12PcTvaJY0DNCkecku5GeD1p7Bt_SUxIPlx8Xbrn-pcg_MUJYFACEb939X3HEOsB1IuqL9Di392YIccPEHKZf4dwPUOjL-VxR4mln-fbcvZWv8tKgMfzOOd6wz0vM6juSdt3zQDKg9vJanvjqSsXXTQAQLRBUHWPz3UwRDDGiLQhEkkrioE8OCAX4_uMvnHgmqvMzjGYv0U1ndRTW8MSkQiuA8Jrva2qJOrsEvLxQmf84ysWM" },
  { alt: "YouTube", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwZuDnmxl3xWxmzE_rCv9fZGe75LC90DIB1D2k7uSwR_jqOzJ9HpB-u3reteJRC7sYoj4v8eo6mtZNUnaIGYW-OOQzC7bzuJbfs0CWy-fd0IcLsfEMQglTmXZtdDpf1olZxOhGovPLzMgXJQJQEzHxgiNcF3WZBWaOUwIVbP6luNJy-uGeX0vSx0z9Qgz2IlBJ7kDm7ybsDML2za1PUKdWC96KLsnNUvP5TgwAJUIEwb4djq9egeu169dnBdEu3Ems8Xb_DLOQU74" },
  { alt: "Discord", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtFS4MfbR4mhG_54fKk_5biAxv2tELrXjjJhbwRnpA9lhgHARbxZrhHvvoO4FklRH_mjYEGIX-9v97tZQbr4KT7w3MdZJIL4ZE8kFebsrayxrppqOusPvaPz-Gy0ywXCK-7QjtTOknaSAKIEFvPlIqIjbiJSBaJibEoM8B2lXjbXjF23i6Zh4pM5CDgQansfLMJUAbP1syhF-pIII8A0ONB7Dn0rVc7nYzDi_sMDf-TZJOQfntzLrOU-JRgScS9d_hghvy1RjPkzM" },
  { alt: "Instagram", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjwHiyDB--BeIdlEpGQaI3xS1BTRGyvIZSo6kbsm6HyeRd1hcQhTzzDbKKJz3wrv3F1dMN1GXfFfUHvzexZIyeC4zXuMsNLsxqBkVjq0a8JuPtWDXtFEK2oSUPkGHDPL77fsczIRtsV3MjsQgBPynvufa3Gmw1plwG9RmcczmF21EXlO_DiQjwELxGedy0Xrb61XriB20Nw4C7p-0caJR0yi6tbfeLi8JccVjH2M0Hjb_3wd0KX2T3Chn8hrknpBiQIUxfhALzfzI" },
  { alt: "TikTok", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2cVBEaDBCB7OfMojtIkgLW1yyeu0ZZbX8g7t3ycs65eFq6DFNDMdFaQ-xF0YecCs1r3twVdXk__1nRD7Iwo71MvXc2vcqqaoBdp_kHmEyKJxEsaDqqgCSiSoUpwsTjUiGkrCrxA8ws9A3laCI5acW-LV7L2-y-fFJWZA4AOTjHA8fIoFhAr-C3P4Ko6Ypj9QFezCwgXknRUNQzp6qOczjkNOgAxRTiZHN7Xx4PXWvxHXDDwVGchZwU0PUr_2vdTNMoGreLjNOhEo" },
];

/* ── Component ── */

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollNews = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 440;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ─── STICKY NAV ─── */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-4 bg-[var(--mr-base)] z-50 border-b border-[var(--mr-gold)]/10">
        <div className="flex items-center gap-12">
          <span
            className="text-2xl font-black italic text-white tracking-widest"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            PROMPTWAR
          </span>
          <div className="hidden md:flex gap-8 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.label.toLowerCase()}`}
                className={`font-bold italic tracking-wider transition-colors duration-100 ${
                  link.active
                    ? "text-[var(--mr-gold)] border-b-[3px] border-[var(--mr-gold)] pb-1"
                    : "text-white hover:text-[var(--mr-gold)]"
                }`}
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex gap-4">
            <Globe className="size-5 text-white cursor-pointer hover:text-[var(--mr-gold)] transition-colors" />
            <LogIn className="size-5 text-white cursor-pointer hover:text-[var(--mr-gold)] transition-colors" />
          </div>
          <button
            className="bg-[var(--mr-gold)] text-[var(--mr-on-gold)] px-8 py-2 font-black italic tracking-widest active:scale-95 transition-all duration-100"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            DOWNLOAD
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section
        id="news"
        className="relative h-screen w-full overflow-hidden flex items-end pb-32 px-6 md:px-12"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6RsKLYy0-SSAMqcQv6QLqFc6d8VdjDmJn_nhctw1j6t-qDEUWtL3biFJCMX2rs_jwW7U2WIVqf_qZdeCSo7gMvtcalmrNVuJ4i7qhxQE6wc1isZ0nlj2_z1d3Lm3tl-XM0nLijU5TtIWhId83qjVAbRWVvO492IuMsiU0usFu7NP_F6PRCIqTdFxtKFTiMf9oFColsRPapglx7v2cdlWKtJR58TB1ka1D2PkcAgVQJ9kos_DB1B565ZksSvYbfrWRyeTDYwZEMmA"
            alt="Abstract cinematic neural network with blue and purple energy"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--mr-base)] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--mr-base)]/80 via-transparent to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic text-white leading-none tracking-tighter hero-glow mb-6"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            IGNITE YOUR{" "}
            <span className="text-[var(--mr-gold)]">PROMPTS</span>
          </h1>
          <p
            className="text-lg md:text-xl italic text-[var(--mr-text-muted)] mb-10 max-w-xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            The AI battle begins. 20+ skills, 6 MCP tools, 3 plugins. Deploy
            your arsenal in the most high-stakes hackathon environment ever
            built.
          </p>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-4 bg-[var(--mr-gold)] text-[var(--mr-on-gold)] px-8 md:px-10 py-4 md:py-5 font-black italic text-xl md:text-2xl tracking-widest active:scale-95 transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              <span>PLAY NOW</span>
              <span className="flex items-center justify-center border-l border-[var(--mr-on-gold)]/20 pl-4">
                <Play className="size-5 fill-current" />
              </span>
            </Link>
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-[var(--mr-gold)] rounded-full" />
              <div className="w-3 h-3 bg-[var(--mr-surface-highest)] rounded-full" />
              <div className="w-3 h-3 bg-[var(--mr-surface-highest)] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIAGONAL YELLOW DIVIDER ─── */}
      <div className="relative z-20 -mt-16 h-20 bg-[var(--mr-gold)] -skew-y-2 border-y-4 border-[var(--mr-on-gold)]/10 shadow-[0_0_50px_rgba(255,215,0,0.2)]" />

      {/* ─── NEWS / UPDATES ─── */}
      <section
        id="skills"
        className="relative bg-[var(--mr-void)] pt-24 pb-32 px-6 md:px-12 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div className="border-l-[6px] border-[var(--mr-gold)] pl-6">
              <h2
                className="text-4xl md:text-5xl font-black italic text-white tracking-tighter"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                LATEST INTEL
              </h2>
              <p
                className="text-[var(--mr-gold)] tracking-[0.3em] mt-2 uppercase text-xs font-bold"
                style={{ fontFamily: "var(--font-label)" }}
              >
                System Updates & Patch Notes
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => scrollNews("left")}
                className="w-12 h-12 flex items-center justify-center border-2 border-[var(--mr-surface-highest)] hover:border-[var(--mr-gold)] text-white transition-all"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => scrollNews("right")}
                className="w-12 h-12 flex items-center justify-center border-2 border-[var(--mr-surface-highest)] hover:border-[var(--mr-gold)] text-white transition-all"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-8 no-scrollbar"
          >
            {newsCards.map((card) => (
              <div
                key={card.title}
                className="min-w-[340px] md:min-w-[400px] group cursor-pointer bg-[var(--mr-surface)] hover:bg-[var(--mr-surface-high)] transition-all duration-300"
              >
                <div className="h-56 overflow-hidden relative">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="400px"
                  />
                  <div
                    className="absolute bottom-0 left-0 bg-[var(--mr-gold)] text-[var(--mr-on-gold)] px-4 py-1 text-sm font-black italic"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {card.badge}
                  </div>
                </div>
                <div className="p-6 border-b-4 border-transparent group-hover:border-[var(--mr-gold)] transition-all">
                  <p
                    className="text-xs text-[var(--mr-gold)] mb-2 uppercase tracking-[0.3em] font-bold"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {card.date}
                  </p>
                  <h3
                    className="text-xl md:text-2xl font-bold text-white mb-3 italic"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-[var(--mr-text-muted)] text-sm line-clamp-2">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM ECOSYSTEM STATS ─── */}
      <section
        id="tools"
        className="relative min-h-screen flex items-center justify-center bg-[var(--mr-base)] py-32 overflow-hidden"
      >
        {/* Background art */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP7-qpE70NyOnVMYfQ2HQX0GMs_1G9_FZBj9Z0CbwzmgsImiqXeLskOAh4J1q2KsFB8epnkIxKEI_1LzHifz2WCsZfSiRBGizaxikCTPQHptr6DrnQYmg5jYwKhK_VTiA9o4uuOifZWZi7s190Gq8MqxNF7m7Tw-JCebDAQq8v0zwtke4aSKf3dB_o3spN8NIe8sBoqV_XTJ_i7jkqOqn0MIfGPNoIZEPqcCEWJfl14zkZXMGfweaZ_fxbpZjID83o9G3O-6aC0_E"
            alt="Digital planet background"
            fill
            className="object-cover grayscale"
            sizes="100vw"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
          {/* Ghost watermark */}
          <div className="text-center mb-24 relative">
            <span
              className="hidden lg:block absolute -top-16 left-1/2 -translate-x-1/2 font-black italic text-white/[0.03] text-[10rem] tracking-[2rem] select-none pointer-events-none"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              PW
            </span>
            <h2
              className="text-5xl md:text-6xl font-black italic text-white mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              PLATFORM ECOSYSTEM
            </h2>
            <div className="w-32 h-1 bg-[var(--mr-gold)] mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {ecosystemStats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-6 md:p-8 bg-[var(--mr-surface-low)] border-t-4 border-[var(--mr-gold)] glow-border-hover transition-all cursor-default"
              >
                <Icon className="size-12 md:size-14 text-[var(--mr-gold)] mb-6" />
                <span
                  className="text-4xl md:text-5xl font-black italic text-white mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {value}
                </span>
                <span
                  className="text-[var(--mr-gold)] uppercase tracking-[0.3em] font-bold text-xs md:text-sm"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOOLS CAROUSEL ─── */}
      <section
        id="plugins"
        className="bg-[var(--mr-void)] py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Featured tool showcase */}
          <div className="relative overflow-hidden group">
            <div className="aspect-[21/9] w-full relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfn9Mtzs9-i9z2k3kmT7lnLTv7ie1WiYBiqF4zvNEvVmD-ueN-P6jEFd0gFIu7C0qmuKB01wo_op53J3CSE79bv0iomJ6ELPRknYYF7L-vwB18by8T2JAl3dGCkoyDjQ75nm-e_JZpyXsGLKyazJ921tct93w42YqEYWBypEtP4vguJo2fPO_tv9noWtNrCgfVKWngYNlnFV5em-75uzwZovXk6WcSitj-O2S2Ckj1ZmQ9L-z5suyasR_jGBWTgthK5eoNMzr1gac"
                alt="Futuristic control room with holographic displays"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--mr-base)] via-transparent to-transparent" />

              {/* Feature info overlay */}
              <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 max-w-lg">
                <div
                  className="inline-block bg-[var(--mr-gold)] text-[var(--mr-on-gold)] px-4 py-1 mb-6 text-sm font-black italic"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  FEATURED TOOL
                </div>
                <h3
                  className="text-4xl md:text-6xl font-black italic text-white mb-6 leading-none"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  BRAINSTORMING
                  <br />
                  NODE
                </h3>
                <p className="text-[var(--mr-text-muted)] text-base md:text-lg leading-relaxed mb-8 hidden sm:block">
                  Unleash collaborative creativity with real-time neural
                  mapping. Connect multiple agents to solve complex logic
                  puzzles in the arena.
                </p>
                <button
                  className="bg-white text-[var(--mr-base)] px-8 py-3 font-black italic text-lg tracking-widest flex items-center gap-3 hover:bg-[var(--mr-gold)] hover:text-[var(--mr-on-gold)] transition-all"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  EXPLORE TOOL <ArrowRight className="size-5" />
                </button>
              </div>

              {/* Carousel arrows */}
              <div className="absolute bottom-8 right-8 md:right-16 flex gap-4">
                <button className="w-12 h-12 md:w-14 md:h-14 glass-panel flex items-center justify-center hover:bg-[var(--mr-gold)] hover:text-[var(--mr-on-gold)] transition-all text-white">
                  <ChevronLeft className="size-5" />
                </button>
                <button className="w-12 h-12 md:w-14 md:h-14 glass-panel flex items-center justify-center hover:bg-[var(--mr-gold)] hover:text-[var(--mr-on-gold)] transition-all text-white">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-4 mt-8">
              <div className="w-12 h-1 bg-[var(--mr-gold)]" />
              <div className="w-12 h-1 bg-[var(--mr-surface-highest)]" />
              <div className="w-12 h-1 bg-[var(--mr-surface-highest)]" />
              <div className="w-12 h-1 bg-[var(--mr-surface-highest)]" />
            </div>
          </div>

          {/* Mini tool cards */}
          <div
            id="mcp"
            className="grid grid-cols-2 md:grid-cols-4 mt-12 gap-4 md:gap-6"
          >
            {toolCards.map((tool) => (
              <div
                key={tool.name}
                className="p-6 bg-[var(--mr-surface)] hover:bg-[var(--mr-surface-high)] cursor-pointer transition-all border-b-2 border-transparent hover:border-[var(--mr-gold)] glow-border-hover"
              >
                <p
                  className="italic text-lg md:text-xl text-white font-bold"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {tool.name}
                </p>
                <p
                  className="text-xs text-[var(--mr-text-muted)] mt-1 uppercase tracking-[0.15em]"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {tool.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        id="ecosystem"
        className="bg-[#050510] pt-24 pb-12 border-t-4 border-[var(--mr-gold)] -skew-y-1"
      >
        <div className="skew-y-1 max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex flex-col items-center md:items-start">
              <span
                className="text-3xl md:text-4xl font-black italic text-white mb-2"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                PROMPTWAR
              </span>
              <p
                className="text-xs text-[var(--mr-gold)] tracking-[0.3em] uppercase font-bold"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Forging the next generation of AI Architects
              </p>
            </div>
            <div className="flex gap-8">
              {socialIcons.map((social) => (
                <a
                  key={social.alt}
                  href="#"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Image
                    src={social.src}
                    alt={social.alt}
                    width={24}
                    height={24}
                  />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
            <span
              className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500"
              style={{ fontFamily: "var(--font-label)" }}
            >
              ©2026 PROMPTWAR
            </span>
            <div className="flex gap-8 md:gap-12">
              {["Terms of Use", "Privacy Policy", "Support"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
