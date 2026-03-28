import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ── Data ── */

const navLinks = [
  { label: "DOCS", href: "/docs", active: true },
  { label: "APP", href: "/", active: false },
];



/* ── Component ── */

export default async function Home() {
  let agentsMdContent = "Documentation not found.";
  let googleServicesContent = "Google services documentation not found.";
  try {
    const mainPath = path.join(process.cwd(), "agents.md");
    if (fs.existsSync(mainPath)) {
      agentsMdContent = fs.readFileSync(mainPath, "utf-8");
    }

    const googleServicesPath = path.join(process.cwd(), "GOOGLE_SERVICES.md");
    if (fs.existsSync(googleServicesPath)) {
      googleServicesContent = fs.readFileSync(googleServicesPath, "utf-8");
    }
  } catch (e) {
    console.error("Failed to read documentation markdown", e);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ─── STICKY NAV ─── */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-4 bg-(--mr-base) z-50 border-b border-(--mr-gold)/10">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <Image
              src="/rakshak_ai_logo.png"
              alt="rakshak ai logo"
              width={36}
              height={36}
              className="rounded-sm"
            />
            <span
              className="text-2xl font-black italic text-white tracking-widest"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              RAKSHAK AI
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-bold italic tracking-wider transition-colors duration-100 ${
                  link.active
                    ? "text-(--mr-gold) border-b-[3px] border-(--mr-gold) pb-1"
                    : "text-white hover:text-(--mr-gold)"
                }`}
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="bg-(--mr-gold) text-(--mr-on-gold) px-8 py-2 font-black italic tracking-widest active:scale-95 transition-all duration-100"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            LAUNCH APP
          </Link>
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
          <div className="absolute inset-0 bg-linear-to-t from-(--mr-base) via-transparent to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-(--mr-base)/80 via-transparent to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic text-white leading-none tracking-tighter hero-glow mb-6"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            DECODE THE{" "}
            <span className="text-(--mr-gold)">CHAOS</span>
          </h1>
          <p
            className="text-lg md:text-xl italic text-(--mr-text-muted) mb-10 max-w-xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            AI-powered emergency triage intelligence. Upload images, get
            nearby hospitals, real-time weather, and life-saving action
            cards — in seconds.
          </p>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-4 bg-(--mr-gold) text-(--mr-on-gold) px-8 md:px-10 py-4 md:py-5 font-black italic text-xl md:text-2xl tracking-widest active:scale-95 transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              <span>LAUNCH APP</span>
              <span className="flex items-center justify-center border-l border-(--mr-on-gold)/20 pl-4">
                <Play className="size-5 fill-current" />
              </span>
            </Link>
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-(--mr-gold) rounded-full" />
              <div className="w-3 h-3 bg-(--mr-surface-highest) rounded-full" />
              <div className="w-3 h-3 bg-(--mr-surface-highest) rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIAGONAL YELLOW DIVIDER ─── */}
      <div className="relative z-20 -mt-16 h-20 bg-(--mr-gold) -skew-y-2 border-y-4 border-(--mr-on-gold)/10 shadow-[0_0_50px_rgba(255,215,0,0.2)]" />

      {/* ─── DYNAMIC DOCUMENTATION (AGENTS.MD) ─── */}
      <section className="relative bg-[#0a0a10] py-24 px-6 md:px-12 z-30">
        <div className="max-w-4xl mx-auto bg-(--mr-surface-low) border border-white/5 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-4xl md:text-5xl font-black italic mt-8 mb-6 text-white tracking-widest" style={{ fontFamily: "var(--font-headline)" }} {...props} />,
              h2: ({ ...props }) => <h2 className="text-3xl md:text-4xl font-black italic mt-12 mb-4 text-(--mr-gold) border-b border-white/10 pb-2" style={{ fontFamily: "var(--font-headline)" }} {...props} />,
              h3: ({ ...props }) => <h3 className="text-2xl font-bold mt-8 mb-3 text-white italic" style={{ fontFamily: "var(--font-headline)" }} {...props} />,
              h4: ({ ...props }) => <h4 className="text-xl font-bold mt-6 mb-2 text-white" {...props} />,
              p: ({ ...props }) => <p className="mb-6 text-(--mr-text-muted) leading-relaxed text-lg" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc pl-8 mb-6 text-(--mr-text-muted) space-y-2 text-lg" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-8 mb-6 text-(--mr-text-muted) space-y-2 text-lg" {...props} />,
              li: ({ ...props }) => <li className="" {...props} />,
              code: ({ inline, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
                inline ? (
                  <code className="bg-black/40 px-1.5 py-0.5 rounded text-sm font-mono text-(--mr-cyan) border border-white/10" {...props} />
                ) : (
                  <div className="relative mb-6">
                    <pre className="bg-black/60 p-6 rounded-lg overflow-x-auto border border-white/10 shadow-inner">
                      <code className="font-mono text-sm text-(--mr-text-dim)" {...props} />
                    </pre>
                  </div>
                ),
              a: ({ ...props }) => <a className="text-(--mr-gold) hover:underline font-medium" {...props} />,
              strong: ({ ...props }) => <strong className="font-bold text-white tracking-wide" {...props} />,
              blockquote: ({ ...props }) => <blockquote className="border-l-4 border-(--mr-gold) pl-6 italic text-(--mr-text-dim) bg-white/5 p-4 rounded-r-lg mb-6" {...props} />,
              hr: ({ ...props }) => <hr className="my-12 border-white/10" {...props} />,
              table: ({ ...props }) => <div className="overflow-x-auto mb-6"><table className="w-full text-left border-collapse" {...props} /></div>,
              th: ({ ...props }) => <th className="border-b border-white/10 py-3 px-4 text-white font-bold" {...props} />,
              td: ({ ...props }) => <td className="border-b border-white/5 py-3 px-4 text-(--mr-text-muted)" {...props} />,
            }}
          >
            {agentsMdContent}
          </ReactMarkdown>
        </div>
      </section>

      <section className="relative bg-(--mr-base) py-24 px-6 md:px-12 z-30 border-t border-(--mr-gold)/10">
        <div className="max-w-4xl mx-auto mb-10">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] text-(--mr-gold) mb-3"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Google Ecosystem
          </p>
          <h2
            className="text-4xl md:text-5xl font-black italic text-white"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            GOOGLE SERVICES FOOTPRINT
          </h2>
          <p className="mt-4 text-(--mr-text-muted) text-lg leading-relaxed max-w-3xl">
            This section separates the Google and Firebase services used directly by the app code
            from the wider project-level services visible in the Google or Firebase console.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-(--mr-surface-low) border border-white/5 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-4xl md:text-5xl font-black italic mt-8 mb-6 text-white tracking-widest" style={{ fontFamily: "var(--font-headline)" }} {...props} />,
              h2: ({ ...props }) => <h2 className="text-3xl md:text-4xl font-black italic mt-12 mb-4 text-(--mr-gold) border-b border-white/10 pb-2" style={{ fontFamily: "var(--font-headline)" }} {...props} />,
              h3: ({ ...props }) => <h3 className="text-2xl font-bold mt-8 mb-3 text-white italic" style={{ fontFamily: "var(--font-headline)" }} {...props} />,
              h4: ({ ...props }) => <h4 className="text-xl font-bold mt-6 mb-2 text-white" {...props} />,
              p: ({ ...props }) => <p className="mb-6 text-(--mr-text-muted) leading-relaxed text-lg" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc pl-8 mb-6 text-(--mr-text-muted) space-y-2 text-lg" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-8 mb-6 text-(--mr-text-muted) space-y-2 text-lg" {...props} />,
              li: ({ ...props }) => <li {...props} />,
              code: ({ inline, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
                inline ? (
                  <code className="bg-black/40 px-1.5 py-0.5 rounded text-sm font-mono text-(--mr-cyan) border border-white/10" {...props} />
                ) : (
                  <div className="relative mb-6">
                    <pre className="bg-black/60 p-6 rounded-lg overflow-x-auto border border-white/10 shadow-inner">
                      <code className="font-mono text-sm text-(--mr-text-dim)" {...props} />
                    </pre>
                  </div>
                ),
              a: ({ ...props }) => <a className="text-(--mr-gold) hover:underline font-medium" {...props} />,
              strong: ({ ...props }) => <strong className="font-bold text-white tracking-wide" {...props} />,
              blockquote: ({ ...props }) => <blockquote className="border-l-4 border-[var(--mr-gold)] pl-6 italic text-(--mr-text-dim) bg-white/5 p-4 rounded-r-lg mb-6" {...props} />,
              hr: ({ ...props }) => <hr className="my-12 border-white/10" {...props} />,
              table: ({ ...props }) => <div className="overflow-x-auto mb-6"><table className="w-full text-left border-collapse" {...props} /></div>,
              th: ({ ...props }) => <th className="border-b border-white/10 py-3 px-4 text-white font-bold" {...props} />,
              td: ({ ...props }) => <td className="border-b border-white/5 py-3 px-4 text-(--mr-text-muted)" {...props} />,
            }}
          >
            {googleServicesContent}
          </ReactMarkdown>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="bg-[#050510] pt-24 pb-12 border-t-4 border-[var(--mr-gold)] -skew-y-1"
      >
        <div className="skew-y-1 max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/rakshak_ai_logo.png"
                  alt="rakshak ai logo"
                  width={40}
                  height={40}
                  className="rounded-sm"
                />
                <span
                  className="text-3xl md:text-4xl font-black italic text-white"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  RAKSHAK AI
                </span>
              </div>
              <p
                className="text-xs text-(--mr-gold) tracking-[0.3em] uppercase font-bold"
                style={{ fontFamily: "var(--font-label)" }}
              >
                AI Emergency Intelligence Platform
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
            <span
              className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500"
              style={{ fontFamily: "var(--font-label)" }}
            >
              ©2026 RAKSHAK AI
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
