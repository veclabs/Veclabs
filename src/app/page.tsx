import SplineScene from "@/components/SplineScene";

export default function Home() {
  return (
    <main className="bg-black">
      {/* Hero — full viewport with Spline background */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <SplineScene />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <nav className="animate-fade-in pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6">
            <span className="text-sm font-bold tracking-widest uppercase text-white">
              VecLabs
            </span>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/veclabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-wide text-white/50 transition-colors hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://x.com/veclabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-wide text-white/50 transition-colors hover:text-white"
              >
                Twitter
              </a>
            </div>
          </nav>

          <div className="absolute bottom-20 left-8 max-w-lg">
            <h1 className="animate-fade-in-d1 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Decentralized Vector Memory
            </h1>
            <p className="animate-fade-in-d2 mt-3 text-sm leading-relaxed text-white/40">
              Cryptographically verifiable AI agent memory.
              <br />
              Built on Rust. Proven on Solana.
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-in-d2 absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/25">
              Scroll
            </span>
            <div className="h-8 w-px animate-pulse bg-white/20" />
          </div>
        </div>
      </section>

      {/* Stats — minimal numbers */}
      <section className="relative w-full px-8 py-32">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-16 gap-x-8 lg:grid-cols-4">
          {[
            { stat: "< 2ms", label: "p50 query latency" },
            { stat: "32 bytes", label: "per on-chain proof" },
            { stat: "~$20/mo", label: "for 1M vectors" },
            { stat: "3 lines", label: "to migrate from Pinecone" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {item.stat}
              </div>
              <div className="mt-2 text-sm text-white/30">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-[11px] tracking-wider text-white/20">
            &copy; {new Date().getFullYear()} VecLabs
          </span>
          <div className="flex gap-6">
            <a
              href="https://github.com/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-wider text-white/20 transition-colors hover:text-white/50"
            >
              GitHub
            </a>
            <a
              href="https://x.com/veclabs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-wider text-white/20 transition-colors hover:text-white/50"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
