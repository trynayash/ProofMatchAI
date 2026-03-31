import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "@/components/icons";

export function BlurIn({ children, delay = 0, duration = 0.6, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SplitText({ text, delayOffset = 0, className }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block mr-2 last:mr-0 lg:mr-3 overflow-hidden pb-1">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delayOffset + i * 0.08, duration: 0.6 }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

const FigmaBlueprintBg = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#050505]">
      {/* Precision Grid Layer */}
      <svg className="absolute w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="microGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
            <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.05)" />
          </pattern>
          <pattern id="macroGrid" width="160" height="160" patternUnits="userSpaceOnUse">
            <rect width="160" height="160" fill="url(#microGrid)"/>
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <circle cx="0" cy="0" r="3" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#macroGrid)" />
      </svg>

      {/* Orbiting UI Elements mapped to the right */}
      <div className="absolute top-1/2 right-[10%] lg:right-[15%] -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px]">
        {/* Core Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#050505] border border-white/20 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/60 rounded-full" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white/10 rounded-full" />
        </motion.div>

        {/* Dashed Secondary Ring */}
        <motion.div
          className="absolute -inset-16 rounded-full border border-white/5"
          style={{ borderStyle: "dashed", borderWidth: "1px", borderDasharray: "8 16" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />

        {/* Intersection Lines */}
        <motion.div
           className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10"
           animate={{ rotate: [0, 180] }}
           transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
           className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10"
           animate={{ rotate: [0, -180] }}
           transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        />

        {/* Accent Plus signs */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 flex items-center justify-center text-white/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute w-[1px] h-full bg-current" />
            <div className="absolute w-full h-[1px] bg-current" />
          </motion.div>
        ))}
      </div>

      {/* Subtle sweeping scanner line */}
      <motion.div
        className="absolute top-0 bottom-0 w-[1px] bg-white/10"
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export function VideoHero({ onLogin, disabled }) {
  return (
    <div className="relative min-h-[100dvh] lg:h-screen w-full overflow-hidden bg-[#050505] selection:bg-white/20">
      <FigmaBlueprintBg />

      {/* Content Container */}
      <div className="relative z-20 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-start text-left max-w-3xl">
            {/* Badge */}
            <BlurIn delay={0} duration={0.6}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-white/80" />
                <span className="text-sm font-medium text-white/80">
                  Advanced UPI Fraud Detection
                </span>
              </div>
            </BlurIn>

            {/* Main Heading */}
            <h1 className="mb-6 text-4xl font-medium leading-tight text-white md:text-5xl lg:text-6xl lg:leading-[1.2]">
              <span className="block mb-2">
                <SplitText text="Detect UPI Fraud" delayOffset={0.1} />
              </span>
              <span className="inline-block mr-3">
                <SplitText text="Instantly with" delayOffset={0.5} />
              </span>
              <span className="inline-block font-serif italic text-white/90">
                <SplitText text="Forensic AI." delayOffset={0.8} />
              </span>
            </h1>

            {/* Subtitle */}
            <BlurIn delay={0.4} duration={0.6} className="mb-12 max-w-xl">
              <p className="text-lg font-normal leading-relaxed text-white/80">
                Upload payment screenshots or transaction IDs. Our enterprise-grade AI engine extracts data, verifies integrity, and delivers confidence-scored authenticity reports in seconds.
              </p>
            </BlurIn>

            {/* CTA Buttons */}
            <BlurIn delay={0.6} duration={0.6} className="flex flex-wrap items-center gap-4">
              <button
                onClick={onLogin}
                disabled={disabled}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-white px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-105 disabled:opacity-50"
              >
                Book A Free Call
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <a
                href="#features"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white/20 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 border border-white/10"
              >
                Learn now
              </a>
            </BlurIn>
          </div>
        </div>
      </div>
    </div>
  );
}
