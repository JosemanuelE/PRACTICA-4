import { useCallback, useEffect, useState } from "react"
import { API_BASE, ADMIN_TOKEN_KEY } from "../config/api"

type CommunityReport = {
    id: number
    targetType: "topic" | "comment"
    targetId: number
    reason: string
    details: string | null
    createdAt: string
    reporter: { id: number; name: string } | null
    target: { id: number; title?: string; content?: string; status: string; topic?: { id: number; title: string } } | null
}
type HiddenItem = {
    id: number
    title?: string
    content?: string
    topic?: { id: number; title: string }
    author: { id: number; name: string } | null
}

const adminHeaders = (): HeadersInit => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem(ADMIN_TOKEN_KEY)}`,
})

export default function CommunityModerationPanel() {
    const [reports, setReports] = useState<CommunityReport[]>([])
    const [hiddenTopics, setHiddenTopics] = useState<HiddenItem[]>([])
    const [hiddenComments, setHiddenComments] = useState<HiddenItem[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState<number | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const [reportResponse, hiddenResponse] = await Promise.all([
                fetch(`${API_BASE}/admin/community/reports`, { headers: adminHeaders() }),
                fetch(`${API_BASE}/admin/community/hidden`, { headers: adminHeaders() }),
            ])
            if (!reportResponse.ok || !hiddenResponse.ok) throw new Error("No se pudo cargar la moderación comunitaria")
            const [reportData, hiddenData] = await Promise.all([reportResponse.json(), hiddenResponse.json()])
            setReports(Array.isArray(reportData.reports) ? reportData.reports : [])
            setHiddenTopics(Array.isArray(hiddenData.topics) ? hiddenData.topics : [])
            setHiddenComments(Array.isArray(hiddenData.comments) ? hiddenData.comments : [])
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo cargar la moderación comunitaria")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { void load() }, [load])

    const updateReport = async (report: CommunityReport, action: "hide" | "dismiss") => {
        setBusyId(report.id)
        try {
            const response = await fetch(`${API_BASE}/admin/community/reports/${report.id}`, {
                method: "PATCH", headers: adminHeaders(), body: JSON.stringify({ action }),
            })
            if (!response.ok) throw new Error("No se pudo actualizar el reporte")
            await load()
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo actualizar el reporte")
        } finally { setBusyId(null) }
    }

    const restore = async (type: "topics" | "comments", id: number) => {
        setBusyId(id)
        try {
            const response = await fetch(`${API_BASE}/admin/community/${type}/${id}`, {
                method: "PATCH", headers: adminHeaders(), body: JSON.stringify({ status: "visible" }),
            })
            if (!response.ok) throw new Error("No se pudo restaurar el contenido")
            await load()
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo restaurar el contenido")
        } finally { setBusyId(null) }
    }

    return <section className="space-y-8">
        {error && <p className="rounded bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
        {loading ? <p className="py-8 text-center text-sm text-gray-400">Cargando moderación…</p> : <>
            <div>
                <div className="mb-4 flex items-baseline justify-between gap-3"><h2 className="text-lg font-semibold text-white">Reportes pendientes</h2><span className="text-xs text-gray-400">{reports.length} abiertos</span></div>
                {reports.length === 0 ? <p className="border-y border-gray-700 py-6 text-sm text-gray-400">No hay reportes pendientes.</p> : <div className="divide-y divide-gray-700 border-y border-gray-700">
                    {reports.map((report) => <article key={report.id} className="py-5">
                        <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs text-gray-400"><span>{report.targetType === "topic" ? "Tema" : "Comentario"} · {report.reason} · reportado por {report.reporter?.name ?? "Usuario eliminado"}</span><time>{new Date(report.createdAt).toLocaleDateString("es-CO")}</time></div>
                        {report.targetType === "comment" && report.target?.topic && <p className="mb-1 text-xs text-emerald-300">En: {report.target.topic.title}</p>}
                        <p className="whitespace-pre-wrap break-words text-sm font-semibold text-gray-100">{report.target?.title ?? report.target?.content ?? "El contenido ya no está disponible"}</p>
                        {report.details && <p className="mt-2 text-sm text-gray-400">Detalle: {report.details}</p>}
                        <div className="mt-3 flex gap-3">
                            <button type="button" disabled={busyId === report.id} onClick={() => void updateReport(report, "hide")} className="text-xs font-semibold text-orange-300 hover:text-orange-200">Ocultar contenido</button>
                            <button type="button" disabled={busyId === report.id} onClick={() => void updateReport(report, "dismiss")} className="text-xs font-semibold text-gray-300 hover:text-white">Descartar reporte</button>
                        </div>
                    </article>)}
                </div>}
            </div>
            <div>
                <div className="mb-4 flex items-baseline justify-between gap-3"><h2 className="text-lg font-semibold text-white">Contenido oculto</h2><span className="text-xs text-gray-400">{hiddenTopics.length + hiddenComments.length} ocultos</span></div>
                {hiddenTopics.length + hiddenComments.length === 0 ? <p className="border-y border-gray-700 py-6 text-sm text-gray-400">No hay contenido oculto.</p> : <div className="divide-y divide-gray-700 border-y border-gray-700">
                    {[...hiddenTopics.map((item) => ({ ...item, kind: "topics" as const })), ...hiddenComments.map((item) => ({ ...item, kind: "comments" as const }))].map((item) => <article key={`${item.kind}-${item.id}`} className="flex flex-wrap items-start justify-between gap-3 py-4">
                        <div className="min-w-0 flex-1"><span className="text-[0.68rem] uppercase text-gray-500">{item.kind === "topics" ? "Tema" : `Comentario · ${item.topic?.title ?? "tema eliminado"}`}</span><p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-200">{item.title ?? item.content}</p><span className="mt-1 block text-xs text-gray-500">{item.author?.name ?? "Usuario eliminado"}</span></div>
                        <button type="button" disabled={busyId === item.id} onClick={() => void restore(item.kind, item.id)} className="text-xs font-semibold text-emerald-300 hover:text-emerald-200">Restaurar</button>
                    </article>)}
                </div>}
            </div>
        </>}
    </section>
}