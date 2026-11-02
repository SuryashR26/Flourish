import Link from "next/link"
import { cinzel, plexMono } from "@/styles/fonts"

const features = [
    {
        name: "Daily Horoscope",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <circle cx="12" cy="12" r="5" stroke="#a8832f" strokeWidth="1.8" />
                <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: "AI Guidance",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1Z" stroke="#a8832f" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        name: "Life Simulation",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M4 20V12a4 4 0 014-4h2M4 20l4-4M4 20l4 4" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 4v8a4 4 0 01-4 4h-2M20 4l-4 4M20 4l4 4" stroke="#a8832f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        name: "Compatibility",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <circle cx="9" cy="12" r="6" stroke="#a8832f" strokeWidth="1.8" />
                <circle cx="15" cy="12" r="6" stroke="#a8832f" strokeWidth="1.8" />
            </svg>
        ),
    },
]

export default function LifeOrbitTeaser() {
    return (
        <section className="relative w-full overflow-hidden lifeorbit-teaser">
            <div className="absolute inset-0 lifeorbit-teaser__base" />
            <div className="absolute inset-0 overflow-hidden lifeorbit-teaser__bloom">
                <div className="lifeorbit-teaser__blob lifeorbit-teaser__blob--gold absolute rounded-full" />
                <div className="lifeorbit-teaser__blob lifeorbit-teaser__blob--rose absolute rounded-full" />
            </div>
            <div className="absolute top-0 left-0 w-full h-40 lifeorbit-teaser__fade-top" />
            <div className="absolute bottom-0 left-0 w-full h-40 lifeorbit-teaser__fade-bottom" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-16 items-center">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="lifeorbit-emblem relative w-16 h-16 mb-7">
                        <div className="lifeorbit-emblem__core absolute inset-0 rounded-full" />
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                            <circle className="lifeorbit-orbit-dot" cx="0" cy="0" r="3" fill="#c79a3a" />
                            <circle className="lifeorbit-orbit-dot lifeorbit-orbit-dot--2" cx="0" cy="0" r="2.2" fill="#a8832f" />
                        </svg>
                    </div>

                    <p className={`${plexMono.className} text-sm md:text-base tracking-[0.2em] uppercase text-[#a8832f] mb-4 font-semibold`}>
                        Flourish Board&apos;s Flagship Product
                    </p>

                    <h2 className={`${cinzel.className} text-4xl md:text-5xl lg:text-6xl tracking-wide uppercase font-semibold text-[#1f1c15] mb-5`}>
                        LifeOrbit
                    </h2>

                    <p className="text-base md:text-lg text-[#8a6a22] font-semibold mb-5 max-w-xl">
                        Vedic astrology, Western astrology, and numerology, computed together, not guessed.
                    </p>

                    <p className="text-sm md:text-base leading-relaxed text-[#625c4f] max-w-xl mb-9">
                        LifeOrbit is an AI-powered life-guidance app built for people who want real answers, not horoscope-column guesswork. Every reading traces back to your actual chart, and when the systems disagree, you see why instead of one blended answer.
                    </p>

                    <Link href="/lifeorbit" className="lifeorbit-cta">
                        Explore LifeOrbit
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto lg:max-w-none">
                    {features.map((f) => (
                        <div key={f.name} className="lifeorbit-feature-card">
                            <div className="lifeorbit-feature-card__icon">{f.icon}</div>
                            <span>{f.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .lifeorbit-teaser__base {
                    /* A true vertical fade (not diagonal) so the full-width top and
                       bottom edges are pure white and blend into the sections above
                       and below with no visible seam — only the middle band tints. */
                    background: linear-gradient(180deg, #ffffff 0%, #f3f8fe 30%, #eef6f2 50%, #f3f8fe 70%, #ffffff 100%);
                }

                .lifeorbit-teaser__fade-top {
                    background: linear-gradient(to bottom, #ffffff, transparent);
                }

                .lifeorbit-teaser__fade-bottom {
                    background: linear-gradient(to top, #ffffff, transparent);
                }

                .lifeorbit-teaser__blob {
                    filter: blur(80px);
                    opacity: 0.6;
                    will-change: transform;
                }

                .lifeorbit-teaser__blob--gold {
                    width: 38vw;
                    height: 38vw;
                    max-width: 560px;
                    max-height: 560px;
                    top: -12%;
                    right: -6%;
                    background: radial-gradient(circle, #bfe0fc 0%, rgba(191, 224, 252, 0) 70%);
                    animation: lifeorbit-bloom-drift-1 24s ease-in-out infinite;
                }

                .lifeorbit-teaser__blob--rose {
                    width: 28vw;
                    height: 28vw;
                    max-width: 420px;
                    max-height: 420px;
                    bottom: -10%;
                    left: -4%;
                    background: radial-gradient(circle, #cdeee2 0%, rgba(205, 238, 226, 0) 70%);
                    animation: lifeorbit-bloom-drift-2 28s ease-in-out infinite;
                }

                @keyframes lifeorbit-bloom-drift-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-4%, 5%) scale(1.08); }
                }

                @keyframes lifeorbit-bloom-drift-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(4%, -4%) scale(1.1); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .lifeorbit-teaser__blob { animation: none !important; }
                }

                .lifeorbit-emblem__core {
                    background: radial-gradient(circle at 35% 30%, #e8cd84, #a8832f 70%);
                    box-shadow: 0 0 0 6px rgba(168,131,47,0.12), 0 0 28px rgba(168,131,47,0.22);
                }

                .lifeorbit-orbit-dot {
                    offset-path: path("M 32 7 A 25 9 0 1 1 32 57 A 25 9 0 1 1 32 7");
                    animation: lifeorbit-orbit 10s linear infinite;
                }

                .lifeorbit-orbit-dot--2 {
                    animation-duration: 10s;
                    animation-delay: -5s;
                    offset-path: path("M 7 32 A 9 25 0 1 1 57 32 A 9 25 0 1 1 7 32");
                }

                @keyframes lifeorbit-orbit {
                    from { offset-distance: 0%; }
                    to { offset-distance: 100%; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .lifeorbit-orbit-dot, .lifeorbit-orbit-dot--2 {
                        animation: none;
                    }
                }

                .lifeorbit-feature-card {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                    background: #ffffff;
                    border: 1px solid #e8e0c8;
                    border-radius: 16px;
                    padding: 18px 16px;
                    box-shadow: 0 1px 2px rgba(60,50,20,0.04), 0 10px 24px -14px rgba(60,50,20,0.18);
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #3f3a2e;
                }

                .lifeorbit-feature-card__icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 11px;
                    background: #fbf5e4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .lifeorbit-cta {
                    display: inline-block;
                    background: linear-gradient(180deg, #e0bd66, #a8832f);
                    color: #241a05;
                    font-weight: 700;
                    font-size: 0.95rem;
                    border-radius: 999px;
                    padding: 14px 36px;
                    text-decoration: none;
                    box-shadow: 0 14px 30px -14px rgba(168,131,47,0.45);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .lifeorbit-cta:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 18px 36px -14px rgba(168,131,47,0.55);
                }
            `}</style>
        </section>
    )
}
