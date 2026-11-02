type LifeOrbitPhoneProps = {
    className?: string
}

export default function LifeOrbitPhone({ className = "" }: LifeOrbitPhoneProps) {
    return (
        <div className={`lo-phone ${className}`}>
            <div className="lo-phone__glow" />
            <svg viewBox="0 0 220 440" fill="none" className="lo-phone__svg">
                <rect x="4" y="4" width="212" height="432" rx="34" className="lo-phone__frame" />
                <rect x="14" y="14" width="192" height="412" rx="26" className="lo-phone__screen" />
                <rect x="84" y="20" width="52" height="7" rx="3.5" fill="#625c4f" opacity="0.4" />

                <text x="28" y="56" className="lo-phone__label">LIFEORBIT</text>

                <circle cx="110" cy="150" r="58" className="lo-phone__ring" />
                <circle cx="110" cy="150" r="58" className="lo-phone__ring" transform="rotate(55 110 150)" />
                <circle cx="110" cy="150" r="10" className="lo-phone__sun" />

                <circle className="lo-phone-orbit-dot" cx="0" cy="0" r="3.4" fill="#e8cd84" />
                <circle className="lo-phone-orbit-dot lo-phone-orbit-dot--2" cx="0" cy="0" r="2.6" fill="#d6b25a" />

                <rect x="26" y="232" width="168" height="46" rx="12" className="lo-phone__card" />
                <rect x="40" y="245" width="90" height="7" rx="3.5" fill="#d6b25a" opacity="0.6" />
                <rect x="40" y="259" width="60" height="6" rx="3" fill="#625c4f" opacity="0.35" />

                <rect x="26" y="288" width="78" height="68" rx="12" className="lo-phone__card" />
                <rect x="118" y="288" width="78" height="68" rx="12" className="lo-phone__card" />
                <rect x="38" y="300" width="18" height="18" rx="5" fill="#d6b25a" opacity="0.55" />
                <rect x="130" y="300" width="18" height="18" rx="5" fill="#d6b25a" opacity="0.55" />
                <rect x="38" y="326" width="48" height="6" rx="3" fill="#625c4f" opacity="0.3" />
                <rect x="130" y="326" width="48" height="6" rx="3" fill="#625c4f" opacity="0.3" />

                <rect x="26" y="368" width="168" height="38" rx="19" className="lo-phone__cta" />
            </svg>

            <style jsx global>{`
                .lo-phone {
                    position: relative;
                    width: 220px;
                    filter: drop-shadow(0 30px 50px rgba(12, 11, 9, 0.35));
                }

                .lo-phone__glow {
                    position: absolute;
                    inset: -40px;
                    background: radial-gradient(circle, rgba(214, 178, 90, 0.25), transparent 70%);
                    filter: blur(10px);
                    pointer-events: none;
                }

                .lo-phone__svg {
                    position: relative;
                    width: 100%;
                    height: auto;
                }

                .lo-phone__frame {
                    fill: #16151a;
                    stroke: #a8832f;
                    stroke-width: 2;
                }

                .lo-phone__screen {
                    fill: #f8f6f0;
                }

                .lo-phone__label {
                    font-family: var(--font-plex-mono), monospace;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    fill: #a8832f;
                }

                .lo-phone__ring {
                    fill: none;
                    stroke: #d6b25a;
                    stroke-width: 1.2;
                    opacity: 0.55;
                }

                .lo-phone__sun {
                    fill: #a8832f;
                }

                .lo-phone-orbit-dot {
                    offset-path: path("M 52 150 A 58 58 0 1 1 168 150 A 58 58 0 1 1 52 150");
                    animation: lo-phone-orbit 9s linear infinite;
                }
                .lo-phone-orbit-dot--2 {
                    offset-path: path("M 52 150 A 58 58 0 1 1 168 150 A 58 58 0 1 1 52 150");
                    animation-duration: 9s;
                    animation-delay: -4.5s;
                }
                @keyframes lo-phone-orbit {
                    from { offset-distance: 0%; }
                    to { offset-distance: 100%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .lo-phone-orbit-dot, .lo-phone-orbit-dot--2 { animation: none; }
                }

                .lo-phone__card {
                    fill: #ffffff;
                    stroke: #e8e3d4;
                    stroke-width: 1;
                }

                .lo-phone__cta {
                    fill: url(#lo-phone-cta-gradient);
                }
            `}</style>

            <svg width="0" height="0">
                <defs>
                    <linearGradient id="lo-phone-cta-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e0bd66" />
                        <stop offset="100%" stopColor="#a8832f" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}
