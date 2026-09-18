import { Link, useNavigate } from "react-router-dom"
import { useEffect, useRef } from "react"
import { isLoggedIn } from "../config/api"

export default function HomeView() {
    const navigate = useNavigate()
    const counter1Ref = useRef<HTMLDivElement>(null)
    const counter2Ref = useRef<HTMLDivElement>(null)
    const counter3Ref = useRef<HTMLDivElement>(null)

    // Animar los contadores al cargar
    useEffect(() => {
        function animateCounter(el: HTMLElement, target: number, suffix = "", duration = 2000) {
            const start = performance.now()
            const update = (time: number) => {
                const progress = Math.min((time - start) / duration, 1)
                const ease = 1 - Math.pow(1 - progress, 3)
                const val = Math.floor(ease * target)
                el.textContent = val + suffix
                if (progress < 1) requestAnimationFrame(update)
            }
            requestAnimationFrame(update)
        }
        setTimeout(() => {
            if (counter1Ref.current) animateCounter(counter1Ref.current, 328)
            if (counter2Ref.current) animateCounter(counter2Ref.current, 19, "%")
            if (counter3Ref.current) animateCounter(counter3Ref.current, 47)
        }, 600)
    }, [])

    // "Ver mi plan de acción" — si está logueado va a /pag/plan-accion, si no va al login
    const handleVerPlan = () => {
        if (isLoggedIn()) {
            navigate("/pag/plan-accion")
        } else {
            navigate("/auth/login")
        }
    }

    return (
        <>
            {/* ─── HERO ─────────────────────────────────────────────────────── */}
            <section
                style={{
                    minHeight: "calc(100vh - 72px)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    overflow: "hidden",
                }}
            >
                {/* Columna izquierda */}
                <div
                    style={{
                        padding: "5rem 3rem 5rem 4rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        background: "var(--crema, #F4EDE4)",
                    }}
                >
                    <div className="hero-badge">
                        🏪 Pymes de Colombia · Proyecto piloto
                    </div>

                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                        fontWeight: 900,
                        lineHeight: 1.05,
                        letterSpacing: "-0.03em",
                        color: "#2C2C2C",
                        marginBottom: "1.5rem",
                    }}>
                        ¿Qué pasaría si mañana pierdes el{" "}
                        <em style={{ fontStyle: "italic", color: "#C4622D" }}>WhatsApp</em>{" "}
                        de tu pyme?
                    </h1>

                    <p style={{
                        fontSize: "1.1rem",
                        lineHeight: 1.7,
                        color: "#444",
                        maxWidth: 480,
                        marginBottom: "2.5rem",
                    }}>
                        Miles de pymes colombianas manejan su negocio desde el celular
                        sin saber que en 10 minutos pueden reducir sus riesgos más graves — y gratis.
                    </p>

                    {/* ── BOTONES REQUERIDOS ── */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
                        {/* Ver mi plan de acción → redirige al login si no está logueado */}
                        <button
                            onClick={handleVerPlan}
                            className="btn-primary-hero"
                        >
                            🗺️ Ver mi plan de acción
                        </button>

                        {/* Saber más de nosotros → landing page (home) */}
                        <Link to="/pag/home" className="btn-secondary-hero">
                            Saber más de nosotros →
                        </Link>

                        {/* Crear cuenta */}
                        <Link to="/auth/register" className="btn-register-hero">
                            Crear cuenta
                        </Link>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: "flex",
                        gap: "2.5rem",
                        paddingTop: "2rem",
                        borderTop: "1px solid rgba(196,98,45,0.2)",
                    }}>
                        <div>
                            <div ref={counter1Ref} style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", color: "#C4622D", lineHeight: 1 }}>0</div>
                            <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem" }}>pymes diagnosticadas de todos los sectores</div>
                        </div>
                        <div>
                            <div ref={counter2Ref} style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", color: "#C4622D", lineHeight: 1 }}>0%</div>
                            <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem" }}>tenía verificación activa en WhatsApp</div>
                        </div>
                        <div>
                            <div ref={counter3Ref} style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", color: "#C4622D", lineHeight: 1 }}>0</div>
                            <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem" }}>incidentes reportados este trimestre</div>
                        </div>
                    </div>
                </div>

                {/* Columna derecha — visual */}
                <div style={{
                    background: "#2D6A4F",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 80px)",
                    }} />
                    <div className="barrio-card-react">
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5rem" }}>
                            📍 Pyme Score — Feb 2025
                        </div>
                        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 1rem" }}>
                                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                                    <circle fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" cx="60" cy="60" r="45" />
                                    <circle fill="none" stroke="#E9C46A" strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray="283" strokeDashoffset="170" cx="60" cy="60" r="45" />
                                </svg>
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'DM Mono', monospace", fontSize: "1.75rem", color: "#E9C46A" }}>39</div>
                            </div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", color: "white", fontWeight: 600 }}>Riesgo Alto promedio</div>
                            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>de las pymes diagnosticadas</div>
                        </div>
                        {[
                            { label: "Sin respaldo de datos", pct: "78%", color: "#D62828" },
                            { label: "WiFi compartida", pct: "65%", color: "#E76F51" },
                            { label: "Sin 2FA en WhatsApp", pct: "81%", color: "#F4A261" },
                            { label: "Con política escrita", pct: "8%", color: "#52B788" },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", flex: 1 }}>{item.label}</div>
                                <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: item.pct, background: item.color, borderRadius: 2 }} />
                                </div>
                            </div>
                        ))}
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "1rem" }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1rem", color: "#52B788" }}>328</span>{" "}
                            diagnósticos completados · Actualizado hoy
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SECCIÓN DE QUÉ APRENDERÁS ───────────────────────────────── */}
            <section style={{ padding: "5rem 4rem", background: "#fff" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4622D", marginBottom: "0.75rem" }}>
                        // Lo que aprenderás
                    </p>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 900, color: "#2C2C2C", letterSpacing: "-0.02em" }}>
                        Seguridad digital <em style={{ color: "#C4622D", fontStyle: "italic" }}>para tu negocio</em>
                    </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
                    {[
                        { icon: "🛡️", title: "Seguridad Web", desc: "Protección contra ataques digitales y fraudes en línea" },
                        { icon: "🔍", title: "Hacking Ético", desc: "Entiende cómo piensan los atacantes para defenderte mejor" },
                        { icon: "🔒", title: "Protección de Datos", desc: "Cumplimiento de la Ley 1581 y seguridad empresarial" },
                    ].map((item) => (
                        <div key={item.title} style={{
                            background: "#F4EDE4", borderRadius: 16, padding: "2rem 1.5rem",
                            textAlign: "center", border: "1px solid transparent",
                            transition: "all 0.2s",
                        }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{item.icon}</div>
                            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2C", marginBottom: "0.5rem" }}>{item.title}</p>
                            <p style={{ fontSize: "0.875rem", color: "#444", lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA FINAL ────────────────────────────────────────────────── */}
            <section style={{ padding: "4rem", background: "#2D6A4F", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 900, color: "white", marginBottom: "1rem" }}>
                    ¿Listo para proteger tu pyme?
                </h2>
                <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "2rem", fontSize: "1rem" }}>
                    Únete a cientos de pymes colombianas que ya están más seguras.
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/auth/register" style={{
                        background: "#E9C46A", color: "#2C2C2C", padding: "0.9rem 2.25rem",
                        borderRadius: 100, fontWeight: 700, fontSize: "1rem", textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    }}>
                        Crear cuenta gratis
                    </Link>
                    <button onClick={handleVerPlan} style={{
                        background: "rgba(255,255,255,0.15)", color: "white", padding: "0.9rem 2.25rem",
                        borderRadius: 100, fontWeight: 600, fontSize: "1rem", border: "1px solid rgba(255,255,255,0.3)",
                        cursor: "pointer",
                    }}>
                        Ver mi plan de acción
                    </button>
                </div>
            </section>
                 <a 
                        href="https://wa.me/573001234567?text=Estoy%20interesado%20en%20adquirir%20más%20información%20sobre%20PymesSeguras%20y%20sus%20servicios%20de%20ciberseguridad"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chatear por WhatsApp"
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            right: "20px",
                            zIndex: 1000
                        }}
                        >
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "12px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <img 
                            src="https://cdn-icons-png.flaticon.com/512/733/733585.png" 
                            alt="WhatsApp"
                            style={{ width: "30px", height: "30px" }}
                            />
                        </div>
                        </a>
            <style>{`
                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(196,98,45,0.1);
                    border: 1px solid rgba(196,98,45,0.3);
                    color: #C4622D;
                    padding: 0.35rem 0.875rem;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    margin-bottom: 1.75rem;
                    width: fit-content;
                }
                .btn-primary-hero {
                    background: #C4622D;
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 100px;
                    font-size: 1rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(196,98,45,0.3);
                    font-family: inherit;
                }
                .btn-primary-hero:hover {
                    background: #9e4e23;
                    transform: translateY(-2px);
                }
                .btn-secondary-hero {
                    color: #2C2C2C;
                    font-weight: 500;
                    font-size: 0.95rem;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.875rem 1.5rem;
                    border-radius: 100px;
                    border: 2px solid rgba(44,44,44,0.2);
                    transition: all 0.2s;
                }
                .btn-secondary-hero:hover { color: #C4622D; border-color: #C4622D; }
                .btn-register-hero {
                    background: #2D6A4F;
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 100px;
                    font-size: 1rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    transition: all 0.2s;
                }
                .btn-register-hero:hover { background: #1e4d38; transform: translateY(-2px); }
                .barrio-card-react {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 20px;
                    padding: 2rem;
                    width: 340px;
                    backdrop-filter: blur(10px);
                    position: relative;
                    z-index: 2;
                }
                @media (max-width: 900px) {
                    section:first-of-type { grid-template-columns: 1fr !important; }
                    .barrio-card-react { display: none; }
                    section:first-of-type > div:first-child { padding: 3rem 1.5rem !important; }
                }
            `}</style>
        </>
    )
}
