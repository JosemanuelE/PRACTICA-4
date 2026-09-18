import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_BASE, getUserToken, isLoggedIn } from "../config/api"

type DiagRow = {
    id: number
    companyName: string | null
    securityScore: number
    riskScore: number
    weakestPoint: string
    createdAt: string
}

function formatDate(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function RiskChart({ items }: { items: DiagRow[] }) {
    const width = 720
    const height = 280
    const pad = { top: 24, right: 24, bottom: 44, left: 44 }
    const innerW = width - pad.left - pad.right
    const innerH = height - pad.top - pad.bottom

    const points = items.map((item, i) => {
        const x =
            items.length === 1
                ? pad.left + innerW / 2
                : pad.left + (i / (items.length - 1)) * innerW
        const y = pad.top + innerH - (item.riskScore / 100) * innerH
        return { x, y, item }
    })

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ")
    const yTicks = [0, 25, 50, 75, 100]

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            role="img"
            aria-label="Gráfica de puntaje de riesgo a lo largo del tiempo"
            style={{ display: "block" }}
        >
            {yTicks.map((tick) => {
                const y = pad.top + innerH - (tick / 100) * innerH
                return (
                    <g key={tick}>
                        <line
                            x1={pad.left}
                            x2={width - pad.right}
                            y1={y}
                            y2={y}
                            stroke="#eee4d8"
                            strokeWidth="1"
                        />
                        <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize="11">
                            {tick}
                        </text>
                    </g>
                )
            })}
            <polyline
                fill="none"
                stroke="#C4622D"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={polyline}
            />
            {points.map((p) => (
                <g key={p.item.id}>
                    <circle cx={p.x} cy={p.y} r="6" fill="#C4622D" />
                    <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        fill="#2C2C2C"
                        fontSize="11"
                        fontWeight="700"
                    >
                        {p.item.riskScore}%
                    </text>
                    <text
                        x={p.x}
                        y={height - 14}
                        textAnchor="middle"
                        fill="#888"
                        fontSize="11"
                    >
                        {formatDate(p.item.createdAt)}
                    </text>
                </g>
            ))}
        </svg>
    )
}

export default function EvolucionView() {
    const navigate = useNavigate()
    const [items, setItems] = useState<DiagRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/auth/login", { replace: true })
            return
        }

        const token = getUserToken()
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/diagnostics`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.status === 401) {
                    navigate("/auth/login", { replace: true })
                    return
                }
                if (!res.ok) {
                    setError("No se pudo cargar tu historial de diagnósticos.")
                    return
                }
                const data = await res.json()
                setItems(Array.isArray(data.diagnostics) ? data.diagnostics : [])
            } catch {
                setError("No hay conexión con el servidor. ¿El backend está en marcha?")
            } finally {
                setLoading(false)
            }
        }
        void load()
    }, [navigate])

    const last = items[items.length - 1]
    const first = items[0]
    const delta = useMemo(() => {
        if (!first || !last || items.length < 2) return null
        return last.riskScore - first.riskScore
    }, [first, last, items.length])

    return (
        <>
            <section
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    padding: "4rem 4rem 3rem",
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
                    // Historial de riesgo
                </p>
                <h1
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                        fontWeight: 900,
                        color: "white",
                    }}
                >
                    Cómo ha cambiado tu puntaje de riesgo
                </h1>
            </section>

            <section style={{ padding: "3rem 4rem 4rem", background: "#F4EDE4" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    {loading && (
                        <p style={{ color: "#666", textAlign: "center" }}>Cargando tu evolución…</p>
                    )}
                    {error && (
                        <p style={{ color: "#D62828", textAlign: "center" }}>{error}</p>
                    )}
                    {!loading && !error && items.length === 0 && (
                        <div
                            style={{
                                background: "white",
                                borderRadius: 20,
                                padding: "2.5rem 2rem",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ color: "#555", marginBottom: "1.25rem" }}>
                                Aún no tienes diagnósticos guardados. Completa uno con la sesión iniciada
                                para empezar a ver tu gráfica.
                            </p>
                            <Link
                                to="/pag/diagnostico"
                                style={{
                                    display: "inline-block",
                                    background: "#C4622D",
                                    color: "white",
                                    textDecoration: "none",
                                    padding: "0.8rem 1.6rem",
                                    borderRadius: 100,
                                    fontWeight: 700,
                                }}
                            >
                                Hacer diagnóstico
                            </Link>
                        </div>
                    )}
                    {!loading && items.length > 0 && (
                        <>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "1rem",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                <div style={{ background: "white", borderRadius: 16, padding: "1.2rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "#888" }}>Último riesgo</div>
                                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#C4622D" }}>
                                        {last?.riskScore}%
                                    </div>
                                </div>
                                <div style={{ background: "white", borderRadius: 16, padding: "1.2rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "#888" }}>Punto más débil</div>
                                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2C2C2C" }}>
                                        {last?.weakestPoint}
                                    </div>
                                </div>
                                <div style={{ background: "white", borderRadius: 16, padding: "1.2rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "#888" }}>Cambio desde el primero</div>
                                    <div
                                        style={{
                                            fontSize: "1.8rem",
                                            fontWeight: 800,
                                            color: delta === null ? "#888" : delta < 0 ? "#2D6A4F" : "#D62828",
                                        }}
                                    >
                                        {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta} pts`}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: "white",
                                    borderRadius: 20,
                                    padding: "1.5rem",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                <h2
                                    style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: "1.2rem",
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    Puntaje de riesgo en el tiempo
                                </h2>
                                <p style={{ color: "#777", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                    Mientras más bajo, mejor. Cada punto es un diagnóstico que completaste.
                                </p>
                                <RiskChart items={items} />
                            </div>

                            <div style={{ background: "white", borderRadius: 20, padding: "1.5rem" }}>
                                <h2
                                    style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: "1.2rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    Historial
                                </h2>
                                <div style={{ display: "grid", gap: "0.75rem" }}>
                                    {[...items].reverse().map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "140px 90px 1fr",
                                                gap: "0.75rem",
                                                alignItems: "center",
                                                borderBottom: "1px solid #f0e7dc",
                                                paddingBottom: "0.75rem",
                                            }}
                                        >
                                            <span style={{ color: "#666", fontSize: "0.85rem" }}>
                                                {formatDate(item.createdAt)}
                                            </span>
                                            <span style={{ fontWeight: 800, color: "#C4622D" }}>
                                                {item.riskScore}%
                                            </span>
                                            <span style={{ color: "#444", fontSize: "0.88rem" }}>
                                                {item.weakestPoint}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    )
}
