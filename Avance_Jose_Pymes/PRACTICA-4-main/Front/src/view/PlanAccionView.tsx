import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { API_BASE, getUserToken, isLoggedIn, removeUserToken } from "../config/api"

// ── Tipos ───────────────────────────────────────────────────────────────────
type RespuestaDiag = "si" | "no" | "parcial"

type DiagnosticoRow = {
    id: number
    companyName: string | null
    answers: Record<string, RespuestaDiag>
    securityScore: number
    riskScore: number
    weakestPoint: string
    createdAt: string
}

type NivelPlan = "bajo" | "medio" | "alto"

type FasePlan = {
    nombre: string
    plazo: string
    acciones: string[]
}

type PlanDefinicion = {
    nivel: NivelPlan
    titulo: string
    emoji: string
    color: string
    bg: string
    resumen: string
    fases: FasePlan[]
    marcos: string[]
}

// ── Definición de los 3 planes de acción ────────────────────────────────────
// Fundamentados en: NIST Cybersecurity Framework 2.0, CIS Critical Security
// Controls v8 (Implementation Group 1 - higiene cibernética básica para
// pequeñas organizaciones), ISO/IEC 27001:2022 y la normativa colombiana
// (Ley 1273 de 2009, Ley 1581 de 2012, CONPES 3854 de 2016).
const PLANES: Record<NivelPlan, PlanDefinicion> = {
    bajo: {
        nivel: "bajo",
        titulo: "Plan de mantenimiento y mejora continua",
        emoji: "✅",
        color: "#2D6A4F",
        bg: "#d1fae5",
        resumen:
            "Tu negocio ya tiene una base sólida de ciberseguridad. El objetivo ahora es mantener el nivel logrado, formalizar por escrito lo que ya haces bien y prepararte para crecer sin perder el control de tus riesgos.",
        fases: [
            {
                nombre: "Consolidar",
                plazo: "0 – 15 días",
                acciones: [
                    "Documenta por escrito las prácticas de seguridad que ya aplicas de forma informal (contraseñas, backups, uso de WiFi).",
                    "Haz una prueba real de restauración de tu copia de seguridad más reciente para confirmar que sí funciona.",
                    "Revisa quién tiene acceso a las cuentas administrativas del negocio y elimina accesos que ya no se usan.",
                ],
            },
            {
                nombre: "Formalizar",
                plazo: "1 – 3 meses",
                acciones: [
                    "Establece un calendario de revisiones de seguridad cada trimestre.",
                    "Capacita a todo el personal nuevo en las políticas de seguridad desde su primer día.",
                    "Evalúa adoptar un gestor de contraseñas empresarial para todo el equipo.",
                    "Revisa las prácticas de seguridad de tus proveedores externos (plataforma de pagos, POS, contabilidad en la nube).",
                ],
            },
            {
                nombre: "Madurar",
                plazo: "3 – 6 meses",
                acciones: [
                    "Realiza una autoevaluación básica frente al Anexo A de ISO/IEC 27001:2022 para identificar controles adicionales.",
                    "Define un plan de continuidad de negocio ante incidentes mayores (robo de equipos, incendio, ransomware).",
                    "Repite el diagnóstico cada 6 meses para verificar que tu puntaje se mantenga o mejore.",
                ],
            },
        ],
        marcos: ["NIST CSF 2.0", "ISO/IEC 27001:2022", "CIS Controls v8 (IG1)"],
    },
    medio: {
        nivel: "medio",
        titulo: "Plan de cierre de brechas",
        emoji: "⚠️",
        color: "#b45309",
        bg: "#fef9c3",
        resumen:
            "Tu negocio tiene algunas medidas de seguridad, pero existen brechas reales que un ciberdelincuente podría aprovechar. Este plan prioriza cerrarlas en un periodo corto y con bajo costo.",
        fases: [
            {
                nombre: "Contención inmediata",
                plazo: "0 – 15 días",
                acciones: [
                    "Activa la verificación en dos pasos (2FA) hoy mismo en correo, WhatsApp Business, redes sociales y banca en línea.",
                    "Cambia cualquier contraseña compartida o reutilizada por contraseñas únicas de al menos 12 caracteres.",
                    "Confirma que exista al menos una copia de seguridad reciente de tu información crítica (clientes, inventario, facturación).",
                ],
            },
            {
                nombre: "Fortalecimiento",
                plazo: "1 – 3 meses",
                acciones: [
                    "Instala antivirus/antimalware en todos los equipos y activa sus actualizaciones automáticas.",
                    "Separa la red WiFi del negocio de la red que usan clientes o visitantes.",
                    "Activa las actualizaciones automáticas del sistema operativo y de las aplicaciones que usas.",
                    "Realiza al menos una capacitación con tu equipo sobre cómo identificar correos o mensajes de phishing.",
                    "Elabora el inventario de datos personales de tus clientes y la autorización de tratamiento exigida por la Ley 1581 de 2012.",
                ],
            },
            {
                nombre: "Consolidación",
                plazo: "3 – 6 meses",
                acciones: [
                    "Redacta un protocolo básico de respuesta a incidentes: a quién avisar, cómo aislar un equipo comprometido y cómo restaurar backups.",
                    "Define un presupuesto mensual mínimo para herramientas de seguridad digital.",
                    "Repite el diagnóstico para medir tu avance y ajustar el plan según los resultados.",
                ],
            },
        ],
        marcos: ["CIS Controls v8 (IG1)", "NIST CSF 2.0", "Ley 1581 de 2012", "Ley 1273 de 2009"],
    },
    alto: {
        nivel: "alto",
        titulo: "Plan de emergencia y recuperación",
        emoji: "🚨",
        color: "#D62828",
        bg: "#fee2e2",
        resumen:
            "Tu negocio está altamente expuesto a un ciberataque. Actuar en los próximos días puede evitar la pérdida total de tu información o la interrupción completa del negocio.",
        fases: [
            {
                nombre: "Emergencia",
                plazo: "0 – 15 días",
                acciones: [
                    "Haz HOY una copia de seguridad completa de tu información crítica en un medio externo o en la nube, separado de la red principal.",
                    "Activa la verificación en dos pasos (2FA) en absolutamente todas las cuentas del negocio.",
                    "Cambia todas las contraseñas del negocio, en especial las compartidas entre empleados o reutilizadas en varias cuentas.",
                    "Instala un antivirus/antimalware confiable en todos los dispositivos, aunque sea una versión gratuita mientras defines presupuesto.",
                    "Si sospechas que ya hubo un incidente (virus, acceso no autorizado, mensajes extraños enviados desde tus cuentas), desconecta el equipo afectado de internet y busca asesoría técnica especializada de inmediato.",
                ],
            },
            {
                nombre: "Estabilización",
                plazo: "1 – 3 meses",
                acciones: [
                    "Separa la red WiFi del negocio de la que usan tus clientes o visitantes.",
                    "Actualiza los sistemas operativos y aplicaciones desactualizadas; elimina software que ya no tiene soporte del fabricante.",
                    "Capacita con urgencia a tu personal en phishing, contraseñas seguras y manejo básico de incidentes.",
                    "Elabora el inventario de datos personales y la autorización de tratamiento exigida por la Ley 1581 de 2012, para evitar sanciones de la Superintendencia de Industria y Comercio.",
                    "Documenta un protocolo de respuesta a incidentes, aunque sea muy básico.",
                ],
            },
            {
                nombre: "Reconstrucción",
                plazo: "3 – 6 meses",
                acciones: [
                    "Destina un presupuesto fijo mensual, por pequeño que sea, a seguridad digital.",
                    "Automatiza tus copias de seguridad siguiendo la regla 3-2-1 (3 copias, 2 medios distintos, 1 fuera del sitio).",
                    "Repite el diagnóstico cada mes hasta salir del rango de riesgo alto; luego hazlo cada trimestre.",
                    "Evalúa contratar una asesoría externa puntual en ciberseguridad para pymes.",
                ],
            },
        ],
        marcos: ["CIS Controls v8 (IG1)", "NIST CSF 2.0", "Ley 1273 de 2009", "Ley 1581 de 2012", "CONPES 3854 de 2016"],
    },
}

// ── Recomendaciones puntuales por categoría del diagnóstico ────────────────
const CATEGORIAS: Record<
    string,
    {
        categoria: string
        icono: string
        marco: string
        no: string
        parcial: string
    }
> = {
    antivirus: {
        categoria: "Protección básica",
        icono: "🛡️",
        marco: "CIS Control 10 – Defensas contra malware",
        no: "Instala una solución antivirus/antimalware en todos los dispositivos del negocio y activa sus actualizaciones automáticas.",
        parcial: "Revisa que el antivirus esté actualizado en todos los equipos, no solo en algunos.",
    },
    backup: {
        categoria: "Continuidad del negocio",
        icono: "💾",
        marco: "CIS Control 11 – Recuperación de datos / NIST CSF (Recuperar)",
        no: "Implementa copias de seguridad automáticas siguiendo la regla 3-2-1 y pruébalas periódicamente.",
        parcial: "Aumenta la frecuencia de tus copias de seguridad y verifica que realmente puedan restaurarse.",
    },
    contrasenas: {
        categoria: "Contraseñas",
        icono: "🔑",
        marco: "CIS Control 5 – Gestión de cuentas / NIST SP 800-63B",
        no: "Adopta contraseñas únicas de al menos 12 caracteres por cuenta y considera un gestor de contraseñas.",
        parcial: "Refuerza las contraseñas más débiles y evita reutilizarlas entre distintas cuentas.",
    },
    wifi: {
        categoria: "Seguridad de redes",
        icono: "📡",
        marco: "CIS Control 12 – Gestión de infraestructura de red",
        no: "Separa la red WiFi del negocio (caja, administración) de la red para clientes o visitantes.",
        parcial: "Confirma que la separación entre red del negocio y red de invitados esté bien configurada.",
    },
    dobleFA: {
        categoria: "Autenticación",
        icono: "📱",
        marco: "CIS Control 6 – Gestión de control de acceso",
        no: "Activa la verificación en dos pasos (2FA) en WhatsApp Business, correo y redes sociales del negocio.",
        parcial: "Activa el 2FA también en las cuentas que aún te falten, no solo en las principales.",
    },
    capacitacion: {
        categoria: "Formación",
        icono: "📚",
        marco: "CIS Control 14 – Concientización y formación en seguridad",
        no: "Programa al menos una capacitación anual en ciberseguridad para todo tu equipo.",
        parcial: "Refuerza la capacitación existente e inclúyela como parte del proceso de inducción de nuevo personal.",
    },
    actualizaciones: {
        categoria: "Actualizaciones",
        icono: "🔄",
        marco: "CIS Control 7 – Gestión continua de vulnerabilidades",
        no: "Activa las actualizaciones automáticas de sistemas operativos y aplicaciones, y retira el software sin soporte.",
        parcial: "Revisa qué equipos aún tienen actualizaciones pendientes y agenda su actualización.",
    },
    phishing: {
        categoria: "Conciencia digital",
        icono: "🎣",
        marco: "NIST CSF (Detectar) / Buenas prácticas CISA Cyber Essentials",
        no: "Aprende (y enseña a tu equipo) a verificar remitente, enlaces y adjuntos antes de interactuar con un mensaje.",
        parcial: "Practica con ejemplos reales de phishing para reconocerlo con más seguridad.",
    },
    plan: {
        categoria: "Plan de respuesta",
        icono: "📋",
        marco: "NIST CSF (Responder) / ISO/IEC 27001:2022 Anexo A.5.24-5.28",
        no: "Documenta un protocolo básico: a quién avisar, cómo aislar un equipo comprometido y cómo restaurar tus backups.",
        parcial: "Formaliza por escrito el protocolo que ya manejas de manera informal.",
    },
    datos: {
        categoria: "Cumplimiento legal",
        icono: "⚖️",
        marco: "Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia)",
        no: "Elabora un inventario de los datos personales que manejas y solicita autorización de tratamiento a tus clientes.",
        parcial: "Revisa que tu autorización de tratamiento de datos esté completa y actualizada.",
    },
    presupuesto: {
        categoria: "Inversión en seguridad",
        icono: "💰",
        marco: "ISO/IEC 27001:2022 – Cláusula 7.1 (Recursos)",
        no: "Destina un presupuesto mínimo mensual, aunque sea pequeño, a herramientas de seguridad digital.",
        parcial: "Evalúa si el presupuesto actual cubre backups, antivirus y capacitación de forma sostenida.",
    },
}

function getNivel(securityScore: number): NivelPlan {
    if (securityScore >= 75) return "bajo"
    if (securityScore >= 40) return "medio"
    return "alto"
}

function formatDate(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

export default function PlanAccionView() {
    const navigate = useNavigate()
    const [diagnostico, setDiagnostico] = useState<DiagnosticoRow | null>(null)
    const [tieneDiagnosticos, setTieneDiagnosticos] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = getUserToken()
        if (!token || !isLoggedIn()) {
            navigate("/auth/login", { replace: true })
            return
        }

        let cancelled = false
        ;(async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${API_BASE}/api/diagnostics`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (res.status === 401 || res.status === 403) {
                    removeUserToken()
                    navigate("/auth/login", { replace: true })
                    return
                }

                if (!res.ok) {
                    if (!cancelled) setError("No se pudo cargar tu diagnóstico para generar el plan de acción.")
                    return
                }

                const data = await res.json()
                const lista: DiagnosticoRow[] = Array.isArray(data.diagnostics) ? data.diagnostics : []
                if (!cancelled) {
                    if (lista.length === 0) {
                        setTieneDiagnosticos(false)
                    } else {
                        setDiagnostico(lista[lista.length - 1])
                    }
                }
            } catch {
                if (!cancelled) setError("Comprueba que el servidor esté en marcha.")
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [navigate])

    const handleLogout = () => {
        removeUserToken()
        navigate("/pag/home", { replace: true })
    }

    // ── Estados de carga / error / sin diagnóstico ─────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
                <p className="text-[#444]">Generando tu plan de acción…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4] px-6">
                <p className="text-red-600 font-medium text-center">{error}</p>
            </div>
        )
    }

    if (!tieneDiagnosticos || !diagnostico) {
        return (
            <div className="min-h-screen bg-[#F4EDE4] px-6 py-16">
                <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-10 text-center">
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🗺️</div>
                    <h1 className="text-2xl font-black text-[#2C2C2C] mb-3">Aún no tienes un plan de acción</h1>
                    <p className="text-[#555] mb-8 leading-relaxed">
                        Tu plan de acción se genera a partir de los resultados de tu diagnóstico de ciberseguridad.
                        Complétalo con tu sesión iniciada para recibir un plan personalizado según tu nivel de riesgo.
                    </p>
                    <Link
                        to="/pag/diagnostico"
                        style={{
                            display: "inline-block",
                            background: "#C4622D",
                            color: "white",
                            textDecoration: "none",
                            padding: "0.9rem 2rem",
                            borderRadius: 100,
                            fontWeight: 700,
                        }}
                    >
                        🔍 Hacer el diagnóstico
                    </Link>
                </div>
            </div>
        )
    }

    const nivel = getNivel(diagnostico.securityScore)
    const plan = PLANES[nivel]

    // Acciones prioritarias personalizadas: primero las "no", luego las "parcial"
    const criticas = Object.entries(diagnostico.answers || {})
        .filter(([, v]) => v === "no")
        .map(([id]) => id)
        .filter((id) => CATEGORIAS[id])
    const parciales = Object.entries(diagnostico.answers || {})
        .filter(([, v]) => v === "parcial")
        .map(([id]) => id)
        .filter((id) => CATEGORIAS[id])

    return (
        <div className="min-h-screen bg-[#F4EDE4]">
            {/* Header */}
            <section
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    padding: "3.5rem 4rem 3rem",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.75rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#f4a261",
                        marginBottom: "0.5rem",
                    }}
                >
                    // Mi plan de acción
                </p>
                <h1
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                        fontWeight: 900,
                        color: "white",
                    }}
                >
                    {diagnostico.companyName
                        ? `Plan de acción para ${diagnostico.companyName}`
                        : "Tu plan de acción en ciberseguridad"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                    Basado en tu último diagnóstico del {formatDate(diagnostico.createdAt)}
                </p>
                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: "1.5rem",
                        background: "rgba(255,255,255,0.12)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 100,
                        padding: "0.45rem 1.1rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Cerrar sesión
                </button>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Resumen del nivel asignado */}
                <div
                    style={{
                        background: "white",
                        borderRadius: 24,
                        padding: "2.5rem 2rem",
                        textAlign: "center",
                        boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
                        marginBottom: "2rem",
                        border: `2px solid ${plan.color}30`,
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: plan.bg,
                            border: `1px solid ${plan.color}40`,
                            color: plan.color,
                            padding: "0.4rem 1.25rem",
                            borderRadius: 100,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            marginBottom: "1rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}
                    >
                        {plan.emoji} Plan de nivel {nivel}
                    </div>
                    <h2
                        style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: "1.6rem",
                            fontWeight: 900,
                            color: "#2C2C2C",
                            marginBottom: "0.75rem",
                        }}
                    >
                        {plan.titulo}
                    </h2>
                    <p style={{ color: "#555", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 1.5rem" }}>
                        {plan.resumen}
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: "#C4622D" }}>
                                {diagnostico.securityScore}%
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>Puntaje de seguridad</div>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: plan.color }}>
                                {diagnostico.riskScore}%
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>Puntaje de riesgo</div>
                        </div>
                    </div>
                </div>

                {/* Acciones prioritarias personalizadas */}
                {(criticas.length > 0 || parciales.length > 0) && (
                    <div
                        style={{
                            background: "white",
                            borderRadius: 20,
                            padding: "2rem",
                            marginBottom: "2rem",
                            border: "1px solid #e8ddd2",
                        }}
                    >
                        <h3
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: "1.25rem",
                                fontWeight: 900,
                                color: "#2C2C2C",
                                marginBottom: "1.25rem",
                            }}
                        >
                            🎯 Acciones prioritarias según tu diagnóstico
                        </h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {criticas.map((id) => {
                                const c = CATEGORIAS[id]
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            display: "flex",
                                            gap: "0.9rem",
                                            padding: "1rem 1.1rem",
                                            borderRadius: 14,
                                            background: "#fee2e2",
                                            border: "1px solid #fca5a5",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{c.icono}</span>
                                        <div>
                                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#D62828", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                {c.categoria} · Crítico
                                            </div>
                                            <p style={{ color: "#2C2C2C", fontSize: "0.88rem", margin: "0.3rem 0 0.4rem", lineHeight: 1.5 }}>
                                                {c.no}
                                            </p>
                                            <span style={{ fontSize: "0.72rem", color: "#888" }}>📖 {c.marco}</span>
                                        </div>
                                    </div>
                                )
                            })}
                            {parciales.map((id) => {
                                const c = CATEGORIAS[id]
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            display: "flex",
                                            gap: "0.9rem",
                                            padding: "1rem 1.1rem",
                                            borderRadius: 14,
                                            background: "#fef9c3",
                                            border: "1px solid #fde68a",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{c.icono}</span>
                                        <div>
                                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                {c.categoria} · Por reforzar
                                            </div>
                                            <p style={{ color: "#2C2C2C", fontSize: "0.88rem", margin: "0.3rem 0 0.4rem", lineHeight: 1.5 }}>
                                                {c.parcial}
                                            </p>
                                            <span style={{ fontSize: "0.72rem", color: "#888" }}>📖 {c.marco}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Fases del plan */}
                <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
                    {plan.fases.map((fase, idx) => (
                        <div
                            key={fase.nombre}
                            style={{
                                background: "white",
                                borderRadius: 20,
                                padding: "1.75rem 2rem",
                                border: "1px solid #e8ddd2",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                                <span
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: plan.color,
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: "0.9rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    {idx + 1}
                                </span>
                                <div>
                                    <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 800, color: "#2C2C2C" }}>
                                        {fase.nombre}
                                    </h4>
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: plan.color, fontWeight: 700 }}>
                                        {fase.plazo}
                                    </span>
                                </div>
                            </div>
                            <ul style={{ display: "grid", gap: "0.6rem", paddingLeft: "1.1rem", margin: 0 }}>
                                {fase.acciones.map((accion, i) => (
                                    <li key={i} style={{ color: "#444", fontSize: "0.88rem", lineHeight: 1.6 }}>
                                        {accion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Marcos de referencia */}
                <div
                    style={{
                        background: "#1a1a2e",
                        borderRadius: 20,
                        padding: "1.75rem 2rem",
                        marginBottom: "2rem",
                    }}
                >
                    <h4 style={{ color: "white", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.9rem" }}>
                        📖 Este plan está fundamentado en:
                    </h4>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        {plan.marcos.map((m) => (
                            <span
                                key={m}
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    color: "#f4a261",
                                    padding: "0.35rem 0.9rem",
                                    borderRadius: 100,
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    border: "1px solid rgba(244,162,97,0.3)",
                                }}
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CTA final */}
                <div
                    style={{
                        background: "#2D6A4F",
                        borderRadius: 20,
                        padding: "2.25rem 2rem",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.3rem", fontWeight: 900, color: "white", marginBottom: "0.6rem" }}>
                        ¿Ya aplicaste algunas acciones?
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                        Vuelve a hacer el diagnóstico para actualizar tu plan y ver tu evolución.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            onClick={() => navigate("/pag/diagnostico")}
                            style={{
                                background: "#E9C46A",
                                color: "#2C2C2C",
                                padding: "0.8rem 1.8rem",
                                borderRadius: 100,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            🔍 Repetir diagnóstico
                        </button>
                        <button
                            onClick={() => navigate("/pag/evolucion")}
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                                padding: "0.8rem 1.8rem",
                                borderRadius: 100,
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                border: "1px solid rgba(255,255,255,0.3)",
                                cursor: "pointer",
                            }}
                        >
                            📈 Ver mi evolución
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
