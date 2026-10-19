import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE, ADMIN_TOKEN_KEY } from "../config/api"
import ErrorMessage from "../components/ErrorMessage"
import CommunityModerationPanel from "./CommunityModerationPanel"

type CourseVideo = {
    id: number
    courseId: number
    url: string
    title: string | null
    sortOrder: number
}

type CourseFile = {
    id: number
    courseId: number
    name: string
    url: string
    sortOrder: number
}

type Course = {
    id: number
    title: string
    description: string | null
    sortOrder: number
    videos: CourseVideo[]
    files: CourseFile[]
}

function authHeaders(): HeadersInit {
    const t = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
    }
}

function authHeadersMultipart(): HeadersInit {
    const t = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    return { Authorization: `Bearer ${t}` }
}

export default function CpanelDashboardView() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState<Course[]>([])
    const [loadError, setLoadError] = useState<string | null>(null)
    const [newTitle, setNewTitle] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [creating, setCreating] = useState(false)
    const [tab, setTab] = useState<"courses" | "audit" | "community">("courses")
    const [logs, setLogs] = useState<Array<{
        id: number
        email: string | null
        action: string
        ip: string | null
        details: string | null
        createdAt: string
    }>>([])

    const loadCourses = useCallback(async () => {
        setLoadError(null)
        const res = await fetch(`${API_BASE}/admin/courses`, { headers: authHeaders() })
        if (res.status === 401 || res.status === 403) {
            sessionStorage.removeItem(ADMIN_TOKEN_KEY)
            navigate("/cpanel", { replace: true })
            return
        }
        if (!res.ok) {
            setLoadError("No se pudieron cargar los cursos")
            return
        }
        const data = await res.json()
        setCourses(Array.isArray(data) ? data : [])
    }, [navigate])

    useEffect(() => {
        const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
        if (!token) {
            navigate("/cpanel", { replace: true })
            return
        }
        loadCourses()
        fetch(`${API_BASE}/admin/audit-logs`, { headers: authHeaders() })
            .then(async (res) => {
                if (!res.ok) return
                const data = await res.json()
                setLogs(Array.isArray(data.logs) ? data.logs : [])
            })
            .catch(() => undefined)
    }, [navigate, loadCourses])

    const logout = () => {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY)
        navigate("/cpanel", { replace: true })
    }

    const createCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle.trim()) return
        setCreating(true)
        try {
            const res = await fetch(`${API_BASE}/admin/courses`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    title: newTitle.trim(),
                    description: newDesc.trim() || null,
                }),
            })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                setLoadError(typeof d.message === "string" ? d.message : "Error al crear curso")
                return
            }
            setNewTitle("")
            setNewDesc("")
            await loadCourses()
        } finally {
            setCreating(false)
        }
    }

    const deleteCourse = async (id: number) => {
        if (!confirm("¿Eliminar este curso y todo su contenido?")) return
        const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        })
        if (res.ok) await loadCourses()
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-gray-100 px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
                        <p className="text-sm text-gray-400">
                            Contenido formativo y registro de seguridad de las pymes registradas
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/pag/home")}
                            className="px-4 py-2 rounded-lg text-sm bg-[#3d3d3d] hover:bg-[#4d4d4d]"
                        >
                            Ver sitio
                        </button>
                        <button
                            type="button"
                            onClick={logout}
                            className="px-4 py-2 rounded-lg text-sm bg-red-900/60 hover:bg-red-800/80"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </header>

                <div className="flex gap-2 mb-8">
                    <button
                        type="button"
                        onClick={() => setTab("courses")}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{ background: tab === "courses" ? "#C4622D" : "#3d3d3d" }}
                    >
                        Cursos
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("audit")}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{ background: tab === "audit" ? "#C4622D" : "#3d3d3d" }}
                    >
                        Registro de seguridad
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("community")}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{ background: tab === "community" ? "#C4622D" : "#3d3d3d" }}
                    >
                        Comunidad
                    </button>
                </div>

                {tab === "community" && <CommunityModerationPanel />}

                {loadError && (
                    <div className="mb-6">
                        <ErrorMessage>{loadError}</ErrorMessage>
                    </div>
                )}

                {tab === "audit" && (
                    <div className="rounded-xl bg-[#2C2C2C] border border-gray-700 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-700">
                                    <th className="p-3">Fecha</th>
                                    <th className="p-3">Acción</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">IP</th>
                                    <th className="p-3">Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 && (
                                    <tr>
                                        <td className="p-3 text-gray-500" colSpan={5}>
                                            Aún no hay eventos.
                                        </td>
                                    </tr>
                                )}
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-800">
                                        <td className="p-3 whitespace-nowrap text-gray-300">
                                            {new Date(log.createdAt).toLocaleString("es-CO")}
                                        </td>
                                        <td className="p-3 font-semibold text-white">{log.action}</td>
                                        <td className="p-3 text-gray-300">{log.email || "—"}</td>
                                        <td className="p-3 text-gray-400">{log.ip || "—"}</td>
                                        <td className="p-3 text-gray-400">{log.details || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === "courses" && (
                <>
                <form
                    onSubmit={createCourse}
                    className="mb-10 p-6 rounded-xl bg-[#2C2C2C] border border-gray-700"
                >
                    <h2 className="text-lg font-semibold mb-4 text-[#C4622D]">Nuevo curso</h2>
                    <div className="flex flex-col gap-3">
                        <input
                            placeholder="Título del curso"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-[#3d3d3d] border border-gray-600 text-white text-sm"
                        />
                        <textarea
                            placeholder="Descripción (opcional)"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            rows={2}
                            className="px-4 py-2 rounded-lg bg-[#3d3d3d] border border-gray-600 text-white text-sm resize-none"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newTitle.trim()}
                            className="self-start px-4 py-2 rounded-lg bg-[#C4622D] text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {creating ? "Creando…" : "Crear curso"}
                        </button>
                    </div>
                </form>

                <div className="flex flex-col gap-8">
                    {courses.map((course) => (
                        <CourseAdminCard
                            key={course.id}
                            course={course}
                            onChanged={loadCourses}
                            onDelete={() => deleteCourse(course.id)}
                        />
                    ))}
                </div>

                {courses.length === 0 && !loadError && (
                    <p className="text-center text-gray-500 py-12">No hay cursos todavía.</p>
                )}
                </>
                )}
            </div>
        </div>
    )
}

function CourseAdminCard({
    course,
    onChanged,
    onDelete,
}: {
    course: Course
    onChanged: () => Promise<void>
    onDelete: () => void
}) {
    const [videoUrl, setVideoUrl] = useState("")
    const [videoTitle, setVideoTitle] = useState("")
    const [docDisplayName, setDocDisplayName] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [busy, setBusy] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)

    const addVideo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!videoUrl.trim()) return
        setBusy(true)
        setLocalError(null)
        try {
            const res = await fetch(`${API_BASE}/admin/courses/${course.id}/videos`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    url: videoUrl.trim(),
                    title: videoTitle.trim() || null,
                }),
            })
            const d = await res.json().catch(() => ({}))
            if (!res.ok) {
                setLocalError(typeof d.message === "string" ? d.message : "Error al añadir video")
                return
            }
            setVideoUrl("")
            setVideoTitle("")
            await onChanged()
        } finally {
            setBusy(false)
        }
    }

    const removeVideo = async (videoId: number) => {
        setBusy(true)
        try {
            await fetch(`${API_BASE}/admin/courses/${course.id}/videos/${videoId}`, {
                method: "DELETE",
                headers: authHeaders(),
            })
            await onChanged()
        } finally {
            setBusy(false)
        }
    }

    const addFile = async (e: React.FormEvent) => {
        e.preventDefault()
        const input = fileInputRef.current
        const file = input?.files?.[0]
        if (!file) {
            setLocalError("Selecciona un archivo")
            return
        }
        setBusy(true)
        setLocalError(null)
        try {
            const fd = new FormData()
            fd.append("file", file)
            if (docDisplayName.trim()) {
                fd.append("displayName", docDisplayName.trim())
            }
            const res = await fetch(`${API_BASE}/admin/courses/${course.id}/files`, {
                method: "POST",
                headers: authHeadersMultipart(),
                body: fd,
            })
            const d = await res.json().catch(() => ({}))
            if (!res.ok) {
                setLocalError(typeof d.message === "string" ? d.message : "Error al subir archivo")
                return
            }
            setDocDisplayName("")
            if (input) input.value = ""
            await onChanged()
        } finally {
            setBusy(false)
        }
    }

    const removeFile = async (fileId: number) => {
        setBusy(true)
        try {
            await fetch(`${API_BASE}/admin/courses/${course.id}/files/${fileId}`, {
                method: "DELETE",
                headers: authHeaders(),
            })
            await onChanged()
        } finally {
            setBusy(false)
        }
    }

    return (
        <article className="p-6 rounded-xl bg-[#2C2C2C] border border-gray-700">
            <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">{course.title}</h2>
                    {course.description && (
                        <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={busy}
                    className="text-xs text-red-400 hover:text-red-300 shrink-0"
                >
                    Eliminar curso
                </button>
            </div>

            {localError && (
                <p className="text-sm text-red-400 mb-4 bg-red-950/40 p-2 rounded">{localError}</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-[#C4622D] mb-2">Videos (YouTube)</h3>
                    <ul className="space-y-2 mb-4">
                        {course.videos?.length ? (
                            course.videos.map((v) => (
                                <li
                                    key={v.id}
                                    className="flex justify-between items-center gap-2 text-xs bg-[#3d3d3d] p-2 rounded"
                                >
                                    <span className="truncate text-gray-300" title={v.url}>
                                        {v.title || v.url}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeVideo(v.id)}
                                        disabled={busy}
                                        className="text-red-400 shrink-0"
                                    >
                                        Quitar
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500 text-sm">Sin videos</li>
                        )}
                    </ul>
                    <form onSubmit={addVideo} className="flex flex-col gap-2">
                        <input
                            placeholder="URL (youtube.com o youtu.be)"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="px-3 py-2 rounded text-sm bg-[#3d3d3d] border border-gray-600 text-white"
                        />
                        <input
                            placeholder="Título opcional"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            className="px-3 py-2 rounded text-sm bg-[#3d3d3d] border border-gray-600 text-white"
                        />
                        <button
                            type="submit"
                            disabled={busy || !videoUrl.trim()}
                            className="py-2 rounded text-sm bg-[#2D6A4F] text-white font-medium disabled:opacity-50"
                        >
                            Añadir video
                        </button>
                    </form>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-[#C4622D] mb-2">Documentos</h3>
                    <p className="text-xs text-gray-500 mb-2">
                        Sube un PDF o Word desde tu equipo (máx. 15 MB). El nombre en lista es opcional; si lo dejas vacío se usa el del archivo.
                    </p>
                    <ul className="space-y-2 mb-4">
                        {course.files?.length ? (
                            course.files.map((f) => (
                                <li
                                    key={f.id}
                                    className="flex justify-between items-center gap-2 text-xs bg-[#3d3d3d] p-2 rounded"
                                >
                                    <span className="truncate text-gray-300">{f.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(f.id)}
                                        disabled={busy}
                                        className="text-red-400 shrink-0"
                                    >
                                        Quitar
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500 text-sm">Sin archivos</li>
                        )}
                    </ul>
                    <form onSubmit={addFile} className="flex flex-col gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#C4622D] file:text-white file:cursor-pointer"
                        />
                        <input
                            placeholder="Nombre visible (opcional)"
                            value={docDisplayName}
                            onChange={(e) => setDocDisplayName(e.target.value)}
                            className="px-3 py-2 rounded text-sm bg-[#3d3d3d] border border-gray-600 text-white"
                        />
                        <button
                            type="submit"
                            disabled={busy}
                            className="py-2 rounded text-sm bg-[#2D6A4F] text-white font-medium disabled:opacity-50"
                        >
                            Subir archivo
                        </button>
                    </form>
                </div>
            </div>
        </article>
    )
}
