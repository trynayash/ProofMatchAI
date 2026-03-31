"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@/components/icons";

function FloatingPaths({ position }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.02 + i * 0.01})`,
        width: 1,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.02 + path.id * 0.005}
                        initial={{ pathLength: 0.3, opacity: 0.3 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.1, 0.3, 0.1],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 25 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "Background Paths",
    subtitle = "",
    buttonText = "Discover Excellence",
    onButtonClick,
    disabled = false,
}) {
    const words = title.split(" ");

    return (
        <div className="relative w-full flex flex-col items-center justify-center overflow-hidden py-32">
            <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 px-4 py-1.5 backdrop-blur-md">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Powered by Google Gemini & ADK
                      </span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 tracking-tighter text-slate-900">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-3 last:mr-0"
                            >
                                <motion.span
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: wordIndex * 0.1,
                                        duration: 0.5,
                                        ease: "easeOut",
                                    }}
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600"
                                >
                                    {word}
                                </motion.span>
                            </span>
                        ))}
                    </h1>

                    {subtitle && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="mx-auto mt-2 mb-10 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="inline-block group relative bg-slate-900 p-[2px] rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <Button
                            variant="ghost"
                            onClick={onButtonClick}
                            disabled={disabled}
                            className="relative w-full rounded-[10px] px-8 py-6 text-base font-semibold bg-white hover:bg-slate-50 text-slate-900 transition-all duration-300 border-none cursor-pointer group-hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5 mr-2.5 text-slate-900" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.7"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.5"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.8"/>
                            </svg>
                            <span className="opacity-100 mr-2">
                                {buttonText}
                            </span>
                            <span
                                className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
