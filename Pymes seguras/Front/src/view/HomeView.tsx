import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { API_BASE, isLoggedIn } from "../config/api"

type PublicStats = {
    diagnostics: number
    promedioSeguridad: number | null
    conVerificacion: number | null
    sinCopia: number | null
    wifiCompartida: number | null
    sinVerificacion: number | null
    conPlanEscrito: number | null
}

export default function HomeView() {
    const navigate = useNavigate()
    const [stats, setStats] = useState<PublicStats | null>(null)

    useEffect(() => {
        let cancelled = false
        fetch(`${API_BASE}/api/public/stats`)
            .then((response) => (response.ok ? response.json() : null))
            .then((data: PublicStats | null) => {
                if (!cancelled && data && typeof data.diagnostics === "number") setStats(data)
            })
            .catch(() => {
                if (!cancelled) setStats(null)
            })
        return () => {
            cancelled = true
        }
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
                        <Link to="/pag/diagnostico" className="btn-primary-hero">
                            Hacer el diagnóstico de 5 minutos
                        </Link>
                        <a href="#nosotros" className="btn-secondary-hero">
                            Saber más de nosotros
                        </a>
                        {isLoggedIn() ? (
                            <button onClick={handleVerPlan} className="btn-register-hero">
                                Ver mi tarea de esta semana
                            </button>
                        ) : (
                            <Link to="/auth/register" className="btn-register-hero">
                                Crear cuenta
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: "flex",
                        gap: "2.5rem",
                        paddingTop: "2rem",
                        borderTop: "1px solid rgba(196,98,45,0.2)",
                        flexWrap: "wrap",
                    }}>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", color: "#C4622D", lineHeight: 1 }}>{stats ? stats.diagnostics : "—"}</div>
                            <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem" }}>diagnósticos guardados de verdad</div>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", color: "#C4622D", lineHeight: 1 }}>{stats?.conVerificacion == null ? "—" : `${stats.conVerificacion}%`}</div>
                            <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem" }}>ya tiene verificación en WhatsApp y correo</div>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", color: "#C4622D", lineHeight: 1 }}>{stats?.promedioSeguridad == null ? "—" : stats.promedioSeguridad}</div>
                            <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem" }}>puntaje promedio de seguridad</div>
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
                            Lo que dicen los diagnósticos
                        </div>
                        {!stats || stats.diagnostics === 0 ? (
                            <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>
                                Aquí van a aparecer los porcentajes reales. Todavía no hay diagnósticos guardados, así que no inventamos cifras.
                            </p>
                        ) : (
                            <>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", color: "white", fontWeight: 600, marginBottom: "1rem" }}>
                                    Puntaje promedio: {stats.promedioSeguridad}
                                </div>
                                {[
                                    { label: "Sin copia de seguridad", pct: stats.sinCopia ?? 0, color: "#D62828" },
                                    { label: "Wi‑Fi no separada", pct: stats.wifiCompartida ?? 0, color: "#E76F51" },
                                    { label: "Sin verificación en WhatsApp", pct: stats.sinVerificacion ?? 0, color: "#F4A261" },
                                    { label: "Con plan escrito", pct: stats.conPlanEscrito ?? 0, color: "#52B788" },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", flex: 1 }}>{item.label}</div>
                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "white" }}>{item.pct}%</div>
                                    </div>
                                ))}
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "1rem" }}>
                                    {stats.diagnostics} diagnósticos guardados
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section id="nosotros" style={{ padding: "4.5rem 1.5rem", background: "#fff" }}>
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4622D" }}>
                        Quiénes somos
                    </p>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, color: "#2C2C2C" }}>
                        Una tarea clara para el negocio, no una lista para archivar
                    </h2>
                    <p style={{ color: "#444", lineHeight: 1.7, fontSize: "1.05rem" }}>
                        Pymes Seguras es un proyecto del barrio El Restrepo, en Bogotá. El diagnóstico dura unos minutos y, con tus respuestas, arma una sola tarea para esta semana: la que más te puede doler mañana, explicada con las pantallas del celular. La siguiente aparece cuando cuentas qué hiciste. No guardamos capturas ni códigos.
                    </p>
                </div>
            </section>

            {/* ─── SECCIÓN DE QUÉ APRENDERÁS ───────────────────────────────── */}
            <section style={{ padding: "5rem 4rem", background: "#F4EDE4" }}>
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
                            background: "#fff", borderRadius: 16, padding: "2rem 1.5rem",
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
                    Empieza por el diagnóstico. El plan aparece cuando ya sabemos qué te falta.
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/pag/diagnostico" style={{
                        background: "#E9C46A", color: "#2C2C2C", padding: "0.9rem 2.25rem",
                        borderRadius: 100, fontWeight: 700, fontSize: "1rem", textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    }}>
                        Hacer el diagnóstico
                    </Link>
                    {isLoggedIn() && (
                        <button onClick={handleVerPlan} style={{
                            background: "rgba(255,255,255,0.15)", color: "white", padding: "0.9rem 2.25rem",
                            borderRadius: 100, fontWeight: 600, fontSize: "1rem", border: "1px solid rgba(255,255,255,0.3)",
                            cursor: "pointer",
                        }}>
                            Ver mi tarea de esta semana
                        </button>
                    )}
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
