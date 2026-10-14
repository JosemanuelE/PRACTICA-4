import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_BASE, getUserToken, isLoggedIn, removeUserToken } from "../config/api"
import { generateChecklist, type DiagnosticAnswer, type RecommendationGroup } from "../data/recommendations"

type DiagnosticoRow = {
    id: number
    companyName: string | null
    answers: Record<string, DiagnosticAnswer>
    securityScore: number
    riskScore: number
    createdAt: string
}

function formatDate(iso: string) {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso
    return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

function progressStorageKey(diagnosticId: number) {
    return `plan_accion_recomendaciones_${diagnosticId}`
}

function loadProgress(diagnosticId: number): Set<string> {
    try {
        const raw = localStorage.getItem(progressStorageKey(diagnosticId))
        if (!raw) return new Set()
        const parsed: unknown = JSON.parse(raw)
        return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [])
    } catch {
        return new Set()
    }
}

function saveProgress(diagnosticId: number, completed: Set<string>) {
    try {
        localStorage.setItem(progressStorageKey(diagnosticId), JSON.stringify([...completed]))
    } catch {
        // El checklist sigue disponible aunque el navegador no permita guardar el progreso.
    }
}

const answerLabel: Record<DiagnosticAnswer, string> = {
    no: "Por implementar",
    parcial: "Por reforzar",
    si: "Mantener",
}

const answerColor: Record<DiagnosticAnswer, { text: string; background: string; border: string }> = {
    no: { text: "#a5281b", background: "#fff0ed", border: "#efb1a8" },
    parcial: { text: "#8b5b00", background: "#fff7df", border: "#e9d18c" },
    si: { text: "#236346", background: "#edf8f1", border: "#b7dfc5" },
}

export default function PlanAccionChecklistView() {
    const navigate = useNavigate()
    const [diagnostico, setDiagnostico] = useState<DiagnosticoRow | null>(null)
    const [tieneDiagnosticos, setTieneDiagnosticos] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [completados, setCompletados] = useState<Set<string>>(new Set())
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

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
                const response = await fetch(`${API_BASE}/api/diagnostics`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (response.status === 401 || response.status === 403) {
                    removeUserToken()
                    navigate("/auth/login", { replace: true })
                    return
                }
                if (!response.ok) {
                    if (!cancelled) setError("No se pudo cargar tu diagnóstico para generar la checklist.")
                    return
                }

                const data = await response.json()
                const diagnostics: DiagnosticoRow[] = Array.isArray(data.diagnostics) ? data.diagnostics : []
                if (cancelled) return
                if (diagnostics.length === 0) {
                    setTieneDiagnosticos(false)
                    return
                }

                const latest = diagnostics[diagnostics.length - 1]
                setDiagnostico(latest)
                setCompletados(loadProgress(latest.id))
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

    const checklist: RecommendationGroup[] = diagnostico ? generateChecklist(diagnostico.answers) : []
    const tasks = checklist.flatMap((group) => group.tasks)
    const totalCompleted = tasks.filter((task) => completados.has(task.id)).length
    const progress = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0
    const checklistCompleted = tasks.length > 0 && totalCompleted === tasks.length

    const toggleTask = (taskId: string) => {
        if (!diagnostico) return
        setCompletados((previous) => {
            const next = new Set(previous)
            if (next.has(taskId)) next.delete(taskId)
            else next.add(taskId)
            saveProgress(diagnostico.id, next)
            return next
        })
    }

    const toggleDetails = (taskId: string) => {
        setExpandidos((previous) => {
            const next = new Set(previous)
            if (next.has(taskId)) next.delete(taskId)
            else next.add(taskId)
            return next
        })
    }

    const resetProgress = () => {
        if (!diagnostico) return
        const empty = new Set<string>()
        setCompletados(empty)
        saveProgress(diagnostico.id, empty)
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]"><p className="text-[#444]">Generando tu checklist…</p></div>
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4] px-6"><p className="text-red-600 font-medium text-center">{error}</p></div>
    }

    if (!tieneDiagnosticos || !diagnostico) {
        return (
            <div className="min-h-screen bg-[#F4EDE4] px-6 py-16">
                <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-10 text-center">
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>☑️</div>
                    <h1 className="text-2xl font-black text-[#2C2C2C] mb-3">Aún no tienes recomendaciones</h1>
                    <p className="text-[#555] mb-8 leading-relaxed">Completa el diagnóstico con tu sesión iniciada para generar una checklist personalizada.</p>
                    <Link to="/pag/diagnostico" style={{ display: "inline-block", background: "#C4622D", color: "white", textDecoration: "none", padding: "0.9rem 2rem", borderRadius: 100, fontWeight: 700 }}>
                        Hacer el diagnóstico
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F4EDE4]">
            <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "3.5rem 1.5rem 3rem", textAlign: "center" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f4a261", marginBottom: "0.5rem" }}>
                    // Checklist personalizada
                </p>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 900, color: "white" }}>
                    {diagnostico.companyName ? `Recomendaciones para ${diagnostico.companyName}` : "Tus prácticas de ciberseguridad"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.95rem", marginTop: "0.6rem" }}>
                    Generada según tus respuestas del {formatDate(diagnostico.createdAt)}
                </p>
                <button onClick={handleLogout} style={{ marginTop: "1.4rem", background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 100, padding: "0.45rem 1.1rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                    Cerrar sesión
                </button>
            </section>

            <main className="max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
                <section style={{ background: "white", borderRadius: 16, padding: "1.5rem", marginBottom: "1.25rem", border: "1px solid #e8ddd2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", flexWrap: "wrap", marginBottom: "0.65rem" }}>
                        <strong style={{ color: "#2C2C2C", fontSize: "0.95rem" }}>Avance de la checklist</strong>
                        <span style={{ color: "#2D6A4F", fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "0.9rem" }}>
                            {totalCompleted}/{tasks.length} tareas · {progress}%
                        </span>
                    </div>
                    <div style={{ background: "#f1e9dd", borderRadius: 100, height: 9, overflow: "hidden" }}>
                        <div style={{ width: `${progress}%`, background: "#2D6A4F", height: "100%", borderRadius: 100, transition: "width 0.25s ease" }} />
                    </div>
                    <p style={{ color: "#666", fontSize: "0.82rem", lineHeight: 1.55, margin: "0.75rem 0 0" }}>
                        Las tareas se generan por pregunta: una para respuestas “sí”, dos para “parcial” y tres para “no”. Puedes completarlas en el orden que prefieras.
                    </p>
                    {totalCompleted > 0 && (
                        <button onClick={resetProgress} style={{ marginTop: "0.8rem", border: 0, padding: 0, background: "none", color: "#8b5b00", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                            Reiniciar progreso
                        </button>
                    )}
                </section>

                {checklistCompleted && (
                    <div role="status" style={{ background: "#edf8f1", border: "1px solid #b7dfc5", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", color: "#236346", fontWeight: 700 }}>
                        Completaste todas las tareas de este diagnóstico. Repite la evaluación cuando quieras revisar tu avance.
                    </div>
                )}

                {checklist.length === 0 ? (
                    <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", color: "#555" }}>
                        No se encontraron respuestas reconocidas en este diagnóstico. Completa uno nuevo para generar recomendaciones.
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "1.4rem" }}>
                        {checklist.map((group) => {
                            const color = answerColor[group.answer]
                            return (
                                <section key={group.questionId} aria-labelledby={`question-${group.questionId}`}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.65rem" }}>
                                        <span aria-hidden="true" style={{ fontSize: "1.25rem", lineHeight: 1.2 }}>{group.icono}</span>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <h2 id={`question-${group.questionId}`} style={{ margin: 0, color: "#2C2C2C", fontSize: "1rem", fontWeight: 800, lineHeight: 1.45 }}>
                                                {group.pregunta}
                                            </h2>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.3rem" }}>
                                                <span style={{ color: "#777", fontSize: "0.75rem" }}>{group.categoria}</span>
                                                <span style={{ color: color.text, background: color.background, border: `1px solid ${color.border}`, borderRadius: 999, padding: "0.2rem 0.55rem", fontSize: "0.7rem", fontWeight: 700 }}>
                                                    {answerLabel[group.answer]}
                                                </span>
                                                <span style={{ color: "#777", fontSize: "0.75rem" }}>Peso diagnóstico: {group.peso}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gap: "0.65rem" }}>
                                        {group.tasks.map((task) => {
                                            const done = completados.has(task.id)
                                            const expanded = expandidos.has(task.id)
                                            return (
                                                <article key={task.id} style={{ background: done ? "#f4fbf7" : "white", border: `1px solid ${done ? "#b7dfc5" : "#e8ddd2"}`, borderRadius: 10, padding: "0.9rem 1rem" }}>
                                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={done}
                                                            onChange={() => toggleTask(task.id)}
                                                            aria-label={`${done ? "Desmarcar" : "Marcar"}: ${task.titulo}`}
                                                            style={{ width: 19, height: 19, margin: "0.15rem 0 0", accentColor: "#2D6A4F", flexShrink: 0, cursor: "pointer" }}
                                                        />
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <h3 style={{ margin: 0, color: done ? "#47745e" : "#2C2C2C", fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.5, textDecoration: done ? "line-through" : "none" }}>
                                                                {task.titulo}
                                                            </h3>
                                                            <button type="button" onClick={() => toggleDetails(task.id)} aria-expanded={expanded} style={{ marginTop: "0.55rem", padding: 0, border: 0, background: "none", color: "#9a4f28", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                                                                {expanded ? "Ocultar pasos" : "Ver pasos y referencia"}
                                                            </button>
                                                            {expanded && (
                                                                <div style={{ marginTop: "0.7rem", paddingTop: "0.7rem", borderTop: "1px solid #eee2d3" }}>
                                                                    <ol style={{ color: "#444", fontSize: "0.82rem", lineHeight: 1.6, paddingLeft: "1.25rem", margin: "0 0 0.6rem" }}>
                                                                        {task.pasos.map((step) => <li key={step}>{step}</li>)}
                                                                    </ol>
                                                                    <p style={{ color: "#777", fontSize: "0.72rem", lineHeight: 1.5, margin: 0 }}>Referencia orientativa: {task.marco}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            )
                                        })}
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                )}

                <p style={{ color: "#777", fontSize: "0.75rem", lineHeight: 1.55, marginTop: "1.5rem" }}>
                    Las referencias normativas orientan estas prácticas; no sustituyen una evaluación de aplicabilidad legal, una auditoría ni una certificación.
                </p>
            </main>
        </div>
    )
}