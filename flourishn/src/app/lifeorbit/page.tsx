"use client"

import Link from "next/link"
import Navbar from "@/components/layout/navbar"
import { cinzel, plexMono } from "@/styles/fonts"
import LifeOrbitPhone from "@/components/ui/LifeOrbitPhone"

const systems = [
    {
        name: "Vedic",
        text: "Kundli, divisional charts, dasha timelines, and planetary strengths, the traditional system of calculation.",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" width="28" height="28">
                <circle cx="20" cy="20" r="16" stroke="#a8832f" strokeWidth="1.6" />
                <circle cx="20" cy="20" r="16" stroke="#a8832f" strokeWidth="1.6" transform="rotate(45 20 20)" />
                <circle cx="20" cy="20" r="4" fill="#a8832f" />
            </svg>
        ),
    },
    {
        name: "Western",
        text: "Natal, synastry, solar and lunar returns, and progressed charts, read alongside the Vedic view.",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" width="28" height="28">
                <circle cx="20" cy="20" r="16" stroke="#a8832f" strokeWidth="1.6" />
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180
                    const x1 = 20 + 12 * Math.sin(angle)
                    const y1 = 20 - 12 * Math.cos(angle)
                    const x2 = 20 + 16 * Math.sin(angle)
                    const y2 = 20 - 16 * Math.cos(angle)
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a8832f" strokeWidth="1.3" />
                })}
            </svg>
        ),
    },
    {
        name: "Numerology",
        text: "Your name and birth numbers, used as a full-confidence fallback when birth time isn't known.",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" width="28" height="28">
                <rect x="6" y="6" width="11" height="11" rx="2" stroke="#a8832f" strokeWidth="1.6" />
                <rect x="23" y="6" width="11" height="11" rx="2" stroke="#a8832f" strokeWidth="1.6" />
                <rect x="6" y="23" width="11" height="11" rx="2" stroke="#a8832f" strokeWidth="1.6" />
                <rect x="23" y="23" width="11" height="11" rx="2" fill="#a8832f" />
            </svg>
        ),
    },
]

const features = [
    {
        name: "LifeHoroscope",
        // tag: "Free", — pricing tiers not necessary at this moment
        text: "Your daily dashboard: Panchang, transits, and a personalized guidance card every morning.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <circle cx="12" cy="12" r="5" stroke="#a8832f" strokeWidth="1.8" />
                <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: "LifePrediction",
        tag: "AI Guide",
        text: "Ask anything. Every answer shows its reasoning and never states something your chart doesn't support.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1Z" stroke="#a8832f" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8 10h8M8 13h5" stroke="#a8832f" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: "LifeSimulation",
        // tag: "Plus", — pricing tiers not necessary at this moment
        text: "See two futures side by side, act or wait, mapped out quarter by quarter.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M4 20V12a4 4 0 014-4h2M4 20l4-4M4 20l4 4" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 4v8a4 4 0 01-4 4h-2M20 4l-4 4M20 4l4 4" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        name: "LifePartner",
        // tag: "Plus", — pricing tiers not necessary at this moment
        text: "A cosmic compatibility score plus a real conversation about how you actually relate.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <circle cx="9" cy="12" r="6" stroke="#a8832f" strokeWidth="1.8" />
                <circle cx="15" cy="12" r="6" stroke="#a8832f" strokeWidth="1.8" />
            </svg>
        ),
    },
    {
        name: "LifeHealth",
        // tag: "Premium", — pricing tiers not necessary at this moment
        text: "General wellness themes grounded in Yoga and Ayurveda. Not medical advice, just guidance.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12c-2.5 4.65-9.5 9-9.5 9Z" stroke="#a8832f" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        name: "Life Overview",
        // tag: "Premium", — pricing tiers not necessary at this moment
        text: "A lifetime report in chapters, following your dasha periods, as a timeline and a PDF.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M4 5.5A2.5 2.5 0 016.5 3H19a1 1 0 011 1v15a1 1 0 01-1 1H6.5A2.5 2.5 0 014 17.5v-12Z" stroke="#a8832f" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M4 17.5A2.5 2.5 0 016.5 15H20" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
]

export default function LifeOrbitPage() {
    return (
        <>
            {/* scrollThreshold=-1 forces the solid navbar state immediately — this
                page's hero is dark from y=0, so the default transparent/dark-text
                navbar would be invisible against it. */}
            <Navbar scrollThreshold={-1} />

            {/* Hero */}
            <section className="relative w-full overflow-hidden lo-hero">
                <div className="absolute inset-0 lo-hero__bg" />
                <div className="absolute inset-0 lo-hero__stars" />
                <div className="absolute bottom-0 left-0 w-full h-40 lo-hero__fade-bottom" />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-12 pt-44 pb-28 lg:pt-52 lg:pb-36 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="lo-emblem relative w-24 h-24 mb-8">
                            <div className="lo-emblem__core absolute inset-0 rounded-full" />
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96">
                                <circle className="lo-orbit-dot" cx="0" cy="0" r="4" fill="#e8cd84" />
                                <circle className="lo-orbit-dot lo-orbit-dot--2" cx="0" cy="0" r="3" fill="#d6b25a" />
                                <circle className="lo-orbit-dot lo-orbit-dot--3" cx="0" cy="0" r="2.5" fill="#f4ecd8" />
                            </svg>
                        </div>

                        <p className={`${plexMono.className} text-[11px] tracking-[0.25em] uppercase text-[#d6b25a] mb-5`}>
                            A Flourish Board Product
                        </p>
                        <h1 className={`${cinzel.className} text-5xl md:text-6xl lg:text-7xl tracking-wide uppercase font-semibold text-[#f4ecd8] mb-7`}>
                            LifeOrbit
                        </h1>
                        <p className="text-lg md:text-xl text-[#d6b25a] font-medium mb-6 max-w-xl">
                            Vedic astrology, Western astrology, and numerology, computed together, not guessed.
                        </p>
                        <p className="text-sm md:text-base leading-relaxed text-[rgba(244,236,216,0.72)] max-w-xl mb-10">
                            An AI life-guidance app built for people who want real answers. Every reading traces back to your actual chart data, so you always know where it came from.
                        </p>
                        <Link href="/contactUs" className="lo-cta">
                            Get Early Access
                        </Link>
                        <p className="text-xs text-[rgba(244,236,216,0.45)] mt-5">Launching soon. Join the list to hear first.</p>
                    </div>

                    <div className="flex-shrink-0 hidden md:block">
                        <LifeOrbitPhone />
                    </div>
                </div>
            </section>

            {/* Three systems */}
            <section className="w-full bg-[#f8f6f0] py-28 lg:py-36 px-8 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className={`${plexMono.className} text-[11px] tracking-[0.25em] uppercase text-[#a8832f] mb-4`}>
                            How It Works
                        </p>
                        <h2 className={`${cinzel.className} text-3xl md:text-4xl font-semibold text-[#17161a]`}>
                            Three systems, one chart
                        </h2>
                        <p className="text-[#6a6659] text-base md:text-lg max-w-2xl mx-auto mt-5 leading-relaxed">
                            Each system is computed once from your birth details and cached. Where they agree, confidence is higher. Where they differ, you see each view instead of one blended guess.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {systems.map((s) => (
                            <div key={s.name} className="lo-card">
                                <div className="lo-card__icon">{s.icon}</div>
                                <h3 className={`${cinzel.className} text-lg font-semibold text-[#17161a] mb-2`}>{s.name}</h3>
                                <p className="text-sm text-[#6a6659] leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="w-full bg-white py-28 lg:py-36 px-8 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className={`${plexMono.className} text-[11px] tracking-[0.25em] uppercase text-[#a8832f] mb-4`}>
                            What You Get
                        </p>
                        <h2 className={`${cinzel.className} text-3xl md:text-4xl font-semibold text-[#17161a]`}>
                            Six ways to find your way
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f) => (
                            <div key={f.name} className="lo-card lo-card--feature">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="lo-card__icon lo-card__icon--sm">{f.icon}</div>
                                    {/* Plus/Premium tags hidden for now — no pricing tiers yet */}
                                    {f.tag && <span className="lo-tag">{f.tag}</span>}
                                </div>
                                <h3 className={`${cinzel.className} text-base font-semibold text-[#17161a] mb-2`}>{f.name}</h3>
                                <p className="text-sm text-[#6a6659] leading-relaxed">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why it's different */}
            <section className="relative w-full overflow-hidden lo-trust">
                <div className="absolute inset-0 lo-trust__bg" />
                <div className="absolute top-0 left-0 w-full h-32 lo-trust__fade-top" />
                <div className="absolute bottom-0 left-0 w-full h-32 lo-trust__fade-bottom" />
                <div className="relative z-10 max-w-3xl mx-auto px-8 py-28 lg:py-32 text-center">
                    <p className={`${plexMono.className} text-[11px] tracking-[0.25em] uppercase text-[#d6b25a] mb-5`}>
                        Why LifeOrbit
                    </p>
                    <h2 className={`${cinzel.className} text-3xl md:text-4xl font-semibold text-[#f4ecd8] mb-6`}>
                        Every reading shows its work
                    </h2>
                    <p className="text-sm md:text-base leading-relaxed text-[rgba(244,236,216,0.72)] max-w-xl mx-auto">
                        No free-floating AI guesses. LifeOrbit&apos;s guide never states a chart value the calculation engine didn&apos;t produce, and it steers clear of medical claims, death predictions, or guaranteed outcomes. Anything uncertain gets flagged for expert review instead of an invented answer.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="w-full bg-[#f8f6f0] py-24 px-8 text-center">
                <h2 className={`${cinzel.className} text-2xl md:text-3xl font-semibold text-[#17161a] mb-4`}>
                    Be the first to try LifeOrbit
                </h2>
                <p className="text-[#6a6659] text-base max-w-xl mx-auto mb-8">
                    We&apos;re building this one chart at a time. Reach out and we&apos;ll let you know the moment it&apos;s ready.
                </p>
                <Link href="/contactUs" className="lo-cta lo-cta--dark">
                    Get Early Access
                </Link>
            </section>

            <style jsx global>{`
                .lo-hero__bg, .lo-trust__bg {
                    background: linear-gradient(160deg, #1d1b17 0%, #0c0b09 100%);
                }

                .lo-hero__fade-bottom {
                    background: linear-gradient(to top, #f8f6f0, transparent);
                }

                .lo-trust__fade-top {
                    background: linear-gradient(to bottom, #ffffff, transparent);
                }

                .lo-trust__fade-bottom {
                    background: linear-gradient(to top, #f8f6f0, transparent);
                }

                .lo-hero__stars {
                    background-image:
                        radial-gradient(1px 1px at 10% 20%, rgba(244,236,216,0.5), transparent),
                        radial-gradient(1px 1px at 80% 15%, rgba(244,236,216,0.4), transparent),
                        radial-gradient(1.5px 1.5px at 60% 70%, rgba(214,178,90,0.5), transparent),
                        radial-gradient(1px 1px at 25% 80%, rgba(244,236,216,0.35), transparent),
                        radial-gradient(1px 1px at 90% 60%, rgba(244,236,216,0.4), transparent),
                        radial-gradient(1.5px 1.5px at 45% 35%, rgba(214,178,90,0.4), transparent),
                        radial-gradient(1px 1px at 70% 90%, rgba(244,236,216,0.3), transparent),
                        radial-gradient(1px 1px at 15% 55%, rgba(244,236,216,0.3), transparent);
                    opacity: 0.85;
                }

                .lo-emblem__core {
                    background: radial-gradient(circle at 35% 30%, #e8cd84, #a8832f 70%);
                    box-shadow: 0 0 0 7px rgba(214,178,90,0.16), 0 0 42px rgba(214,178,90,0.35);
                }

                .lo-orbit-dot {
                    offset-path: path("M 48 10 A 38 13 0 1 1 48 86 A 38 13 0 1 1 48 10");
                    animation: lo-orbit 12s linear infinite;
                }
                .lo-orbit-dot--2 {
                    offset-path: path("M 10 48 A 13 38 0 1 1 86 48 A 13 38 0 1 1 10 48");
                    animation-duration: 12s;
                    animation-delay: -4s;
                }
                .lo-orbit-dot--3 {
                    offset-path: path("M 48 10 A 38 13 0 1 1 48 86 A 38 13 0 1 1 48 10");
                    animation-duration: 12s;
                    animation-delay: -8s;
                }
                @keyframes lo-orbit {
                    from { offset-distance: 0%; }
                    to { offset-distance: 100%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .lo-orbit-dot, .lo-orbit-dot--2, .lo-orbit-dot--3 { animation: none; }
                }

                .lo-cta {
                    display: inline-block;
                    background: linear-gradient(180deg, #e0bd66, #a8832f);
                    color: #241a05;
                    font-weight: 700;
                    font-size: 0.95rem;
                    border-radius: 999px;
                    padding: 15px 38px;
                    text-decoration: none;
                    box-shadow: 0 14px 30px -12px rgba(214,178,90,0.55);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .lo-cta:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 18px 36px -12px rgba(214,178,90,0.65);
                }
                .lo-cta--dark {
                    box-shadow: 0 14px 30px -14px rgba(168,131,47,0.45);
                }

                .lo-card {
                    background: #ffffff;
                    border: 1px solid #e8e3d4;
                    border-radius: 18px;
                    padding: 28px 24px;
                    box-shadow: 0 1px 2px rgba(60,50,20,0.06), 0 8px 20px -10px rgba(60,50,20,0.15);
                    text-align: left;
                }
                .lo-card--feature {
                    padding: 24px;
                }
                .lo-card__icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    background: #fbf5e4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }
                .lo-card__icon--sm {
                    width: 44px;
                    height: 44px;
                    margin-bottom: 0;
                }
                .lo-tag {
                    font-size: 0.6rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #8a6a22;
                    background: rgba(214,178,90,0.18);
                    border-radius: 999px;
                    padding: 4px 10px;
                }
            `}</style>
        </>
    )
}
