import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE, getUserToken, isLoggedIn } from "../config/api"

// ── Preguntas del diagnóstico ──────────────────────────────────────────────
const preguntas = [
    {
        id: "antivirus",
        pregunta: "¿Tu empresa tiene antivirus instalado y actualizado en todos sus dispositivos?",
        peso: 10,
        categoria: "Protección básica",
        icono: "🛡️",
    },
    {
        id: "backup",
        pregunta: "¿Realizas copias de seguridad (backups) de tus datos importantes al menos una vez por semana?",
        peso: 10,
        categoria: "Continuidad del negocio",
        icono: "💾",
    },
    {
        id: "contrasenas",
        pregunta: "¿Usas contraseñas diferentes y fuertes (más de 8 caracteres, con números y símbolos) en tus cuentas del negocio?",
        peso: 10,
        categoria: "Contraseñas",
        icono: "🔑",
    },
    {
        id: "wifi",
        pregunta: "¿Tu red WiFi del negocio está separada de la red que usan los clientes o visitantes?",
        peso: 8,
        categoria: "Seguridad de redes",
        icono: "📡",
    },
    {
        id: "dobleFA",
        pregunta: "¿Tienes activada la verificación en dos pasos (2FA) en WhatsApp Business y correo electrónico?",
        peso: 10,
        categoria: "Autenticación",
        icono: "📱",
    },
    {
        id: "capacitacion",
        pregunta: "¿Tus empleados han recibido alguna capacitación sobre ciberseguridad en el último año?",
        peso: 8,
        categoria: "Formación",
        icono: "📚",
    },
    {
        id: "actualizaciones",
        pregunta: "¿Mantienes actualizados los sistemas operativos y aplicaciones de los dispositivos del negocio?",
        peso: 8,
        categoria: "Actualizaciones",
        icono: "🔄",
    },
    {
        id: "phishing",
        pregunta: "¿Sabes identificar un correo o mensaje fraudulento (phishing) antes de hacer clic en un enlace?",
        peso: 8,
        categoria: "Conciencia digital",
        icono: "🎣",
    },
    {
        id: "plan",
        pregunta: "¿Tu empresa tiene un plan o protocolo definido para actuar si sufre un ciberataque?",
        peso: 10,
        categoria: "Plan de respuesta",
        icono: "📋",
    },
    {
        id: "datos",
        pregunta: "¿Tienes un registro de qué datos personales de clientes guardas y pides autorización para tratarlos (Ley 1581)?",
        peso: 10,
        categoria: "Cumplimiento legal",
        icono: "⚖️",
    },
    {
        id: "presupuesto",
        pregunta: "¿Tu empresa destina algún presupuesto, por pequeño que sea, a herramientas de seguridad digital?",
        peso: 8,
        categoria: "Inversión en seguridad",
        icono: "💰",
    },
]

type Respuesta = "si" | "no" | "parcial" | null
type EstadoGuardado = "idle" | "guardando" | "ok" | "error" | "invitado"

function getPuntoMasDebil(respuestas: Record<string, Respuesta>): string {
    const porGravedad = (valor: Respuesta) =>
        preguntas
            .filter((p) => respuestas[p.id] === valor)
            .sort((a, b) => b.peso - a.peso)

    const criticos = porGravedad("no")
    if (criticos[0]) return criticos[0].categoria

    const parciales = porGravedad("parcial")
    if (parciales[0]) return `${parciales[0].categoria} (parcial)`

    return "Ninguno (buen nivel general)"
}

function getRiesgoInfo(porcentajeSeguridad: number) {
    if (porcentajeSeguridad >= 80) {
        return {
            nivel: "Riesgo Bajo",
            color: "#2D6A4F",
            bg: "#d1fae5",
            emoji: "✅",
            descripcion:
                "¡Excelente! Tu zapatería tiene buenas prácticas de ciberseguridad. Continúa capacitándote para mantener este nivel.",
        }
    } else if (porcentajeSeguridad >= 55) {
        return {
            nivel: "Riesgo Moderado",
            color: "#E9C46A",
            bg: "#fef9c3",
            emoji: "⚠️",
            descripcion:
                "Tu negocio tiene algunas medidas de seguridad, pero hay brechas importantes que podrían ser explotadas por ciberdelincuentes.",
        }
    } else if (porcentajeSeguridad >= 30) {
        return {
            nivel: "Riesgo Alto",
            color: "#E76F51",
            bg: "#ffedd5",
            emoji: "🔴",
            descripcion:
                "Tu zapatería está expuesta a ciberataques. Las estadísticas muestran que el 78% de las pymes con este perfil han sufrido algún incidente.",
        }
    } else {
        return {
            nivel: "Riesgo Crítico",
            color: "#D62828",
            bg: "#fee2e2",
            emoji: "🚨",
            descripcion:
                "Tu negocio está en situación crítica. Sin medidas de seguridad, un ciberataque podría significar la pérdida total de datos e incluso el cierre de tu zapatería.",
        }
    }
}

export default function DiagnosticoView() {
    const navigate = useNavigate()
    const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>({})
    const [enviado, setEnviado] = useState(false)
    const [nombreEmpresa, setNombreEmpresa] = useState("")
    const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>("idle")

    const handleVerCursos = () => {
        if (isLoggedIn()) navigate("/pag/cursos")
        else navigate("/auth/login")
    }

    const totalPreguntas = preguntas.length
    const respondidas = Object.values(respuestas).filter((r) => r !== null).length
    const progreso = Math.round((respondidas / totalPreguntas) * 100)

    // Calcular puntaje de seguridad (0-100)
    const calcularPuntaje = () => {
        let puntajeObtenido = 0
        let puntajeMaximo = 0
        preguntas.forEach((p) => {
            puntajeMaximo += p.peso
            const r = respuestas[p.id]
            if (r === "si") puntajeObtenido += p.peso
            else if (r === "parcial") puntajeObtenido += p.peso * 0.5
        })
        return Math.round((puntajeObtenido / puntajeMaximo) * 100)
    }

    const porcentajeSeguridad = calcularPuntaje()
    const porcentajeRiesgo = 100 - porcentajeSeguridad
    const riesgoInfo = getRiesgoInfo(porcentajeSeguridad)

    // Identificar puntos críticos (respondidos con "no")
    const puntosCriticos = preguntas.filter((p) => respuestas[p.id] === "no")
    const puntosOk = preguntas.filter((p) => respuestas[p.id] === "si")

    const handleEnviar = async () => {
        if (respondidas < totalPreguntas) return
        setEnviado(true)
        window.scrollTo({ top: 0, behavior: "smooth" })

        const token = getUserToken()
        if (!token || !isLoggedIn()) {
            setEstadoGuardado("invitado")
            return
        }

        setEstadoGuardado("guardando")
        try {
            const res = await fetch(`${API_BASE}/api/diagnostics`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    companyName: nombreEmpresa.trim() || undefined,
                    answers: respuestas,
                    securityScore: porcentajeSeguridad,
                    riskScore: porcentajeRiesgo,
                    weakestPoint: getPuntoMasDebil(respuestas),
                }),
            })
            setEstadoGuardado(res.ok ? "ok" : "error")
        } catch {
            setEstadoGuardado("error")
        }
    }

    const handleReiniciar = () => {
        setRespuestas({})
        setEnviado(false)
        setNombreEmpresa("")
        setEstadoGuardado("idle")
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // ── RESULTADOS ──────────────────────────────────────────────────────────
    if (enviado) {
        const circumference = 2 * Math.PI * 54
        const offset = circumference - (porcentajeRiesgo / 100) * circumference

        return (
            <>
                {/* Header resultados */}
                <section style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    padding: "4rem 4rem 3rem",
                    textAlign: "center",
                }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f4a261", marginBottom: "0.5rem" }}>
                        // Resultados del diagnóstico
                    </p>
                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
                        {nombreEmpresa ? `Diagnóstico de ${nombreEmpresa}` : "Tu diagnóstico de ciberseguridad"}
                    </h1>
                </section>

                <section style={{ padding: "4rem", background: "#F4EDE4" }}>
                    <div style={{ maxWidth: 800, margin: "0 auto" }}>

                        {/* Medidor principal */}
                        <div style={{
                            background: "white", borderRadius: 24,
                            padding: "3rem 2rem", textAlign: "center",
                            boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
                            marginBottom: "2rem", border: `2px solid ${riesgoInfo.color}30`,
                        }}>
                            <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                                Porcentaje de probabilidad de riesgo
                            </p>

                            {/* SVG Donut */}
                            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 1.5rem" }}>
                                <svg width="160" height="160" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                                    <circle fill="none" stroke="#f0f0f0" strokeWidth="10" cx="60" cy="60" r="54" />
                                    <circle
                                        fill="none"
                                        stroke={riesgoInfo.color}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        cx="60" cy="60" r="54"
                                        style={{ transition: "stroke-dashoffset 1s ease" }}
                                    />
                                </svg>
                                <div style={{
                                    position: "absolute", top: "50%", left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    textAlign: "center",
                                }}>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "2.2rem", fontWeight: 700, color: riesgoInfo.color, lineHeight: 1 }}>
                                        {porcentajeRiesgo}%
                                    </div>
                                    <div style={{ fontSize: "0.65rem", color: "#999", marginTop: "0.2rem" }}>de riesgo</div>
                                </div>
                            </div>

                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                background: riesgoInfo.bg, border: `1px solid ${riesgoInfo.color}40`,
                                color: riesgoInfo.color, padding: "0.4rem 1.25rem",
                                borderRadius: 100, fontWeight: 700, fontSize: "1rem",
                                marginBottom: "1rem",
                            }}>
                                {riesgoInfo.emoji} {riesgoInfo.nivel}
                            </div>

                            <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 2rem" }}>
                                {riesgoInfo.descripcion}
                            </p>

                            {/* Barra de seguridad */}
                            <div style={{ background: "#f0f0f0", borderRadius: 100, height: 10, maxWidth: 400, margin: "0 auto", overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", width: `${porcentajeSeguridad}%`,
                                    background: `linear-gradient(90deg, ${riesgoInfo.color}, ${riesgoInfo.color}aa)`,
                                    borderRadius: 100, transition: "width 1.5s ease",
                                }} />
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "#888", marginTop: "0.5rem" }}>
                                Nivel de seguridad: {porcentajeSeguridad}%
                            </p>
                        </div>

                        {/* Puntos críticos y fortalezas */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            {/* Brechas */}
                            <div style={{ background: "white", borderRadius: 20, padding: "1.75rem", border: "2px solid #fee2e2" }}>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", color: "#D62828", marginBottom: "1rem" }}>
                                    🚨 Brechas detectadas ({puntosCriticos.length})
                                </h3>
                                {puntosCriticos.length === 0 ? (
                                    <p style={{ color: "#888", fontSize: "0.85rem" }}>¡Ninguna! Muy bien.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: "0.6rem" }}>
                                        {puntosCriticos.map((p) => (
                                            <div key={p.id} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{p.icono}</span>
                                                <span style={{ fontSize: "0.8rem", color: "#555", lineHeight: 1.4 }}>{p.categoria}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fortalezas */}
                            <div style={{ background: "white", borderRadius: 20, padding: "1.75rem", border: "2px solid #d1fae5" }}>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", color: "#2D6A4F", marginBottom: "1rem" }}>
                                    ✅ Lo que ya tienes ({puntosOk.length})
                                </h3>
                                {puntosOk.length === 0 ? (
                                    <p style={{ color: "#888", fontSize: "0.85rem" }}>Aún sin fortalezas marcadas.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: "0.6rem" }}>
                                        {puntosOk.map((p) => (
                                            <div key={p.id} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{p.icono}</span>
                                                <span style={{ fontSize: "0.8rem", color: "#555", lineHeight: 1.4 }}>{p.categoria}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            background: "white",
                            borderRadius: 16,
                            padding: "1.1rem 1.4rem",
                            marginBottom: "1.5rem",
                            border: "1px solid #e8ddd2",
                            fontSize: "0.9rem",
                            color: "#444",
                            lineHeight: 1.6,
                        }}>
                            <strong>Punto más débil:</strong> {getPuntoMasDebil(respuestas)}
                            <div style={{ marginTop: "0.55rem" }}>
                                {estadoGuardado === "guardando" && "Guardando tu diagnóstico…"}
                                {estadoGuardado === "ok" && "Diagnóstico guardado. Ya puedes ver cómo cambia tu riesgo con el tiempo."}
                                {estadoGuardado === "error" && "No se pudo guardar. Revisa que el backend esté encendido y que tu sesión siga activa."}
                                {estadoGuardado === "invitado" && (
                                    <>
                                        Este resultado no se guardó porque no hay sesión.{" "}
                                        <button
                                            onClick={() => navigate("/auth/login")}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                padding: 0,
                                                color: "#C4622D",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            Inicia sesión
                                        </button>{" "}
                                        para guardar y ver tu evolución.
                                    </>
                                )}
                            </div>
                            {(estadoGuardado === "ok" || isLoggedIn()) && (
                                <button
                                    onClick={() => navigate("/pag/evolucion")}
                                    style={{
                                        marginTop: "0.85rem",
                                        background: "#1a1a2e",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 100,
                                        padding: "0.55rem 1.2rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Ver mi evolución
                                </button>
                            )}
                        </div>

                        {/* CTA — Ver cursos */}
                        <div style={{
                            background: "#2D6A4F", borderRadius: 20, padding: "2.5rem 2rem",
                            textAlign: "center",
                        }}>
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.5rem", fontWeight: 900, color: "white", marginBottom: "0.75rem" }}>
                                ¿Quieres mejorar tu nivel de seguridad?
                            </h3>
                            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginBottom: "1.75rem", maxWidth: 420, margin: "0 auto 1.75rem" }}>
                                Nuestros cursos cubren exactamente las brechas que detectamos en tu diagnóstico.
                            </p>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                                <button
                                    onClick={handleVerCursos}
                                    style={{
                                        background: "#E9C46A", color: "#2C2C2C",
                                        padding: "0.9rem 2rem", borderRadius: 100,
                                        fontWeight: 700, fontSize: "1rem",
                                        border: "none", cursor: "pointer", fontFamily: "inherit",
                                        display: "flex", alignItems: "center", gap: "0.5rem",
                                    }}
                                >
                                    📚 Ver cursos disponibles
                                </button>
                                <button
                                    onClick={handleReiniciar}
                                    style={{
                                        background: "rgba(255,255,255,0.15)", color: "white",
                                        padding: "0.9rem 2rem", borderRadius: 100,
                                        fontWeight: 600, fontSize: "1rem",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        cursor: "pointer", fontFamily: "inherit",
                                    }}
                                >
                                    🔄 Hacer de nuevo
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    }

    // ── FORMULARIO ──────────────────────────────────────────────────────────
    return (
        <>
            {/* Hero */}
            <section style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                padding: "5rem 4rem",
                textAlign: "center",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(255,255,255,0.02) 60px,rgba(255,255,255,0.02) 120px)",
                }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        background: "rgba(196,98,45,0.2)", border: "1px solid rgba(196,98,45,0.4)",
                        color: "#f4a261", padding: "0.4rem 1rem", borderRadius: 100,
                        fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em",
                        textTransform: "uppercase", marginBottom: "1.5rem",
                    }}>
                        🔍 Diagnóstico gratuito
                    </div>
                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                        fontWeight: 900, color: "white", lineHeight: 1.1,
                        letterSpacing: "-0.02em", marginBottom: "1rem",
                    }}>
                        ¿Qué tan segura está{" "}
                        <em style={{ color: "#f4a261", fontStyle: "italic" }}>tu zapatería?</em>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                        Responde {totalPreguntas} preguntas y en menos de 3 minutos sabrás tu porcentaje de riesgo
                        y qué debes mejorar. Si inicias sesión, el resultado se guarda y puedes ver tu evolución.
                    </p>
                </div>
            </section>

            {/* Formulario */}
            <section style={{ padding: "4rem", background: "#F4EDE4" }}>
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                    {!isLoggedIn() && (
                        <div style={{
                            background: "#fff7ed",
                            border: "1px solid #fdba74",
                            color: "#9a3412",
                            borderRadius: 14,
                            padding: "0.9rem 1.1rem",
                            marginBottom: "1.25rem",
                            fontSize: "0.88rem",
                            lineHeight: 1.5,
                        }}>
                            Estás como invitado: puedes hacer el diagnóstico, pero no se guardará.
                            Inicia sesión si quieres consultar tu historial después.
                        </div>
                    )}

                    {/* Nombre empresa (opcional) */}
                    <div style={{ background: "white", borderRadius: 16, padding: "1.5rem 2rem", marginBottom: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                        <label style={{ display: "block", fontWeight: 600, color: "#2C2C2C", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                            Nombre de tu zapatería (opcional)
                        </label>
                        <input
                            type="text"
                            value={nombreEmpresa}
                            onChange={(e) => setNombreEmpresa(e.target.value)}
                            placeholder="Ej: Calzado Martínez"
                            style={{
                                width: "100%", padding: "0.75rem 1rem",
                                borderRadius: 10, border: "1.5px solid #e0d6cc",
                                fontSize: "0.95rem", fontFamily: "inherit",
                                outline: "none", boxSizing: "border-box",
                                color: "#2C2C2C",
                            }}
                        />
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "#666" }}>Progreso del diagnóstico</span>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#C4622D", fontWeight: 700 }}>
                                {respondidas}/{totalPreguntas}
                            </span>
                        </div>
                        <div style={{ background: "rgba(196,98,45,0.15)", borderRadius: 100, height: 8, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: `${progreso}%`,
                                background: "#C4622D", borderRadius: 100,
                                transition: "width 0.3s ease",
                            }} />
                        </div>
                    </div>

                    {/* Preguntas */}
                    <div style={{ display: "grid", gap: "1.25rem" }}>
                        {preguntas.map((p, idx) => {
                            const r = respuestas[p.id] ?? null
                            return (
                                <div
                                    key={p.id}
                                    style={{
                                        background: "white",
                                        borderRadius: 16,
                                        padding: "1.5rem",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                                        border: r ? "2px solid #C4622D22" : "2px solid transparent",
                                        transition: "border-color 0.2s",
                                    }}
                                >
                                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "flex-start" }}>
                                        <span style={{
                                            background: "#F4EDE4", width: 32, height: 32, borderRadius: 8,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "1.1rem", flexShrink: 0,
                                        }}>
                                            {p.icono}
                                        </span>
                                        <div>
                                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#C4622D", fontWeight: 600, letterSpacing: "0.06em" }}>
                                                {idx + 1}. {p.categoria}
                                            </span>
                                            <p style={{ color: "#2C2C2C", fontSize: "0.9rem", lineHeight: 1.5, margin: "0.3rem 0 0", fontWeight: 500 }}>
                                                {p.pregunta}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botones de respuesta */}
                                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                        {[
                                            { val: "si" as Respuesta, label: "✅ Sí", activeColor: "#2D6A4F", activeBg: "#d1fae5" },
                                            { val: "parcial" as Respuesta, label: "⚠️ Parcialmente", activeColor: "#b45309", activeBg: "#fef9c3" },
                                            { val: "no" as Respuesta, label: "❌ No", activeColor: "#D62828", activeBg: "#fee2e2" },
                                        ].map((opcion) => {
                                            const isActive = r === opcion.val
                                            return (
                                                <button
                                                    key={opcion.val}
                                                    onClick={() => setRespuestas((prev) => ({ ...prev, [p.id]: opcion.val }))}
                                                    style={{
                                                        padding: "0.5rem 1.1rem",
                                                        borderRadius: 100,
                                                        fontSize: "0.82rem",
                                                        fontWeight: isActive ? 700 : 500,
                                                        border: isActive ? `2px solid ${opcion.activeColor}` : "2px solid #e0d6cc",
                                                        background: isActive ? opcion.activeBg : "transparent",
                                                        color: isActive ? opcion.activeColor : "#666",
                                                        cursor: "pointer",
                                                        fontFamily: "inherit",
                                                        transition: "all 0.15s",
                                                    }}
                                                >
                                                    {opcion.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Botón enviar */}
                    <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
                        {respondidas < totalPreguntas && (
                            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                Faltan {totalPreguntas - respondidas} pregunta{totalPreguntas - respondidas !== 1 ? "s" : ""} por responder
                            </p>
                        )}
                        <button
                            onClick={handleEnviar}
                            disabled={respondidas < totalPreguntas}
                            style={{
                                background: respondidas < totalPreguntas ? "#ccc" : "#C4622D",
                                color: "white",
                                padding: "1rem 2.5rem",
                                borderRadius: 100,
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                border: "none",
                                cursor: respondidas < totalPreguntas ? "not-allowed" : "pointer",
                                fontFamily: "inherit",
                                boxShadow: respondidas >= totalPreguntas ? "0 4px 20px rgba(196,98,45,0.3)" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            🔍 Ver mi diagnóstico completo
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}
