import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { API_BASE, getSessionUser, getUserToken, isLoggedIn } from "../config/api"
import "./community.css"

const categories = [
    { value: "phishing", label: "Phishing y fraude" },
    { value: "backups", label: "Copias de seguridad" },
    { value: "ransomware", label: "Ransomware" },
    { value: "access-control", label: "Control de acceso" },
    { value: "data-protection", label: "Protección de datos" },
    { value: "incident-response", label: "Respuesta a incidentes" },
]

type Author = { id: number; name: string } | null
type CommunityComment = {
    id: number
    userId: number | null
    content: string
    createdAt: string
    author: Author
    replies?: CommunityComment[]
}
type CommunityTopic = {
    id: number
    userId: number | null
    category: string
    title: string
    content: string
    createdAt: string
    author: Author
    comments?: CommunityComment[]
}
type ReportTarget = { type: "topic" | "comment"; id: number }

const dateLabel = (value: string) => new Date(value).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
})
const authorName = (author: Author) => author?.name || "Usuario eliminado"

async function responseMessage(response: Response, fallback: string) {
    const data = await response.json().catch(() => ({}))
    return typeof data.message === "string" ? data.message : fallback
}

export default function CommunityView() {
    const { topicId } = useParams()
    const navigate = useNavigate()
    const user = getSessionUser()
    const [topics, setTopics] = useState<CommunityTopic[]>([])
    const [topic, setTopic] = useState<CommunityTopic | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [refresh, setRefresh] = useState(0)
    const [composeOpen, setComposeOpen] = useState(false)
    const [newCategory, setNewCategory] = useState(categories[0].value)
    const [newTitle, setNewTitle] = useState("")
    const [newContent, setNewContent] = useState("")
    const [commentDraft, setCommentDraft] = useState("")
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [editingTopic, setEditingTopic] = useState(false)
    const [topicDraft, setTopicDraft] = useState({ title: "", content: "" })
    const [editingComment, setEditingComment] = useState<number | null>(null)
    const [commentEditDraft, setCommentEditDraft] = useState("")
    const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null)
    const [reportReason, setReportReason] = useState("off-topic")
    const [reportDetails, setReportDetails] = useState("")
    const [notice, setNotice] = useState("")
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError("")
        const url = topicId
            ? `${API_BASE}/api/community/topics/${topicId}`
            : `${API_BASE}/api/community/topics?page=${page}&limit=15&category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}`
        fetch(url)
            .then(async (response) => {
                if (!response.ok) throw new Error(await responseMessage(response, "No se pudo cargar la comunidad"))
                return response.json()
            })
            .then((data) => {
                if (!active) return
                if (topicId) setTopic(data.topic as CommunityTopic)
                else {
                    setTopics(Array.isArray(data.topics) ? data.topics : [])
                    setTotal(Number(data.total) || 0)
                }
            })
            .catch((reason: unknown) => {
                if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la comunidad")
            })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [topicId, page, category, query, refresh])

    const needLogin = () => {
        if (isLoggedIn()) return true
        navigate("/auth/login")
        return false
    }

    const createTopic = async (event: FormEvent) => {
        event.preventDefault()
        if (!needLogin()) return
        setBusy(true)
        try {
            const response = await fetch(`${API_BASE}/api/community/topics`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getUserToken()}` },
                body: JSON.stringify({ category: newCategory, title: newTitle, content: newContent }),
            })
            if (!response.ok) throw new Error(await responseMessage(response, "No se pudo publicar el tema"))
            const data = await response.json()
            navigate(`/pag/comunidad/${data.topic.id}`)
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo publicar el tema")
        } finally { setBusy(false) }
    }

    const addComment = async (event: FormEvent) => {
        event.preventDefault()
        if (!topic || !needLogin()) return
        setBusy(true)
        try {
            const response = await fetch(`${API_BASE}/api/community/topics/${topic.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getUserToken()}` },
                body: JSON.stringify({ content: commentDraft, parentCommentId: replyingTo }),
            })
            if (!response.ok) throw new Error(await responseMessage(response, "No se pudo publicar la respuesta"))
            setCommentDraft("")
            setReplyingTo(null)
            setRefresh((value) => value + 1)
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo publicar la respuesta")
        } finally { setBusy(false) }
    }

    const saveTopic = async (event: FormEvent) => {
        event.preventDefault()
        if (!topic) return
        setBusy(true)
        try {
            const response = await fetch(`${API_BASE}/api/community/topics/${topic.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getUserToken()}` },
                body: JSON.stringify(topicDraft),
            })
            if (!response.ok) throw new Error(await responseMessage(response, "No se pudo actualizar el tema"))
            setEditingTopic(false)
            setRefresh((value) => value + 1)
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo actualizar el tema")
        } finally { setBusy(false) }
    }

    const removeTopic = async () => {
        if (!topic || !window.confirm("¿Eliminar este tema y sus comentarios?")) return
        const response = await fetch(`${API_BASE}/api/community/topics/${topic.id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${getUserToken()}` },
        })
        if (response.ok) navigate("/pag/comunidad")
        else setError(await responseMessage(response, "No se pudo eliminar el tema"))
    }

    const saveComment = async (id: number) => {
        setBusy(true)
        try {
            const response = await fetch(`${API_BASE}/api/community/comments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getUserToken()}` },
                body: JSON.stringify({ content: commentEditDraft }),
            })
            if (!response.ok) throw new Error(await responseMessage(response, "No se pudo actualizar el comentario"))
            setEditingComment(null)
            setRefresh((value) => value + 1)
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo actualizar el comentario")
        } finally { setBusy(false) }
    }

    const removeComment = async (id: number) => {
        if (!window.confirm("¿Eliminar este comentario?")) return
        const response = await fetch(`${API_BASE}/api/community/comments/${id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${getUserToken()}` },
        })
        if (response.ok) setRefresh((value) => value + 1)
        else setError(await responseMessage(response, "No se pudo eliminar el comentario"))
    }

    const sendReport = async (event: FormEvent) => {
        event.preventDefault()
        if (!reportTarget || !needLogin()) return
        setBusy(true)
        try {
            const response = await fetch(`${API_BASE}/api/community/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getUserToken()}` },
                body: JSON.stringify({
                    targetType: reportTarget.type,
                    targetId: reportTarget.id,
                    reason: reportReason,
                    details: reportDetails,
                }),
            })
            if (!response.ok) throw new Error(await responseMessage(response, "No se pudo enviar el reporte"))
            setNotice("Reporte enviado para revisión")
            setReportTarget(null)
            setReportDetails("")
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "No se pudo enviar el reporte")
        } finally { setBusy(false) }
    }

    const renderComment = (comment: CommunityComment, isReply = false) => (
        <article className={`community-comment ${isReply ? "community-comment-reply" : ""}`} key={comment.id}>
            <span className="community-comment-marker" aria-hidden="true" />
            <div className="community-comment-body">
                <div className="community-meta"><strong>{authorName(comment.author)}</strong><span>{dateLabel(comment.createdAt)}</span></div>
                {editingComment === comment.id ? <div className="community-edit-form">
                    <textarea value={commentEditDraft} onChange={(event) => setCommentEditDraft(event.target.value)} maxLength={5000} rows={3} />
                    <button type="button" disabled={busy || !commentEditDraft.trim()} onClick={() => void saveComment(comment.id)}>Guardar</button>
                    <button type="button" className="community-text-button" onClick={() => setEditingComment(null)}>Cancelar</button>
                </div> : <p className="community-copy">{comment.content}</p>}
                <div className="community-actions">
                    {!isReply && <button type="button" onClick={() => { setReplyingTo(comment.id); setCommentDraft("") }}>Responder</button>}
                    {isLoggedIn() && user?.id === comment.userId && editingComment !== comment.id && <>
                        <button type="button" onClick={() => { setEditingComment(comment.id); setCommentEditDraft(comment.content) }}>Editar</button>
                        <button type="button" onClick={() => void removeComment(comment.id)}>Eliminar</button>
                    </>}
                    {isLoggedIn() && <button type="button" onClick={() => setReportTarget({ type: "comment", id: comment.id })}>Reportar</button>}
                </div>
                {comment.replies?.map((reply) => renderComment(reply, true))}
            </div>
        </article>
    )

    return <main className="community-page">
        <header className="community-masthead"><div className="community-masthead-inner">
            <div className="community-kicker"><span /> ESPACIO DE INTERCAMBIO</div>
            <h1>Comunidad <em>segura</em></h1>
            <p>Experiencias y preguntas prácticas sobre ciberseguridad para pequeñas empresas.</p>
            <div className="community-guidance">Comparte aprendizajes, no datos personales, credenciales ni detalles que identifiquen a una empresa.</div>
        </div></header>

        <div className="community-layout">
            {!topicId ? <>
                <aside className="community-sidebar">
                    <div className="community-side-section">
                        <span className="community-overline">EXPLORAR POR TEMA</span>
                        <button type="button" className={!category ? "community-category active" : "community-category"} onClick={() => { setCategory(""); setPage(1) }}>Todos los temas</button>
                        {categories.map((item) => <button type="button" key={item.value} className={category === item.value ? "community-category active" : "community-category"} onClick={() => { setCategory(item.value); setPage(1) }}>{item.label}</button>)}
                    </div>
                    <div className="community-side-section community-safety-note"><span className="community-overline">ANTES DE PUBLICAR</span><p>No incluyas nombres de clientes, direcciones IP públicas, claves ni información personal.</p></div>
                </aside>
                <section className="community-feed">
                    <div className="community-feed-heading"><div><span className="community-overline">FORO DE PYMES</span><h2>Conversaciones</h2></div>
                        <button type="button" className="community-primary-button" onClick={() => needLogin() && setComposeOpen((value) => !value)}>{composeOpen ? "Cerrar formulario" : "+ Nuevo tema"}</button>
                    </div>
                    {composeOpen && <form className="community-compose" onSubmit={(event) => void createTopic(event)}>
                        <label>Categoría<select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                        <label>Título<input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} maxLength={160} required placeholder="¿Qué te gustaría consultar?" /></label>
                        <label>Contexto<textarea value={newContent} onChange={(event) => setNewContent(event.target.value)} maxLength={10000} rows={5} required placeholder="Describe tu pregunta sin incluir datos sensibles." /></label>
                        <button type="submit" disabled={busy}>{busy ? "Publicando…" : "Publicar tema"}</button>
                    </form>}
                    <form className="community-search" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); setPage(1) }}>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en las conversaciones" aria-label="Buscar temas" />
                        <button type="submit" aria-label="Buscar">Buscar</button>
                    </form>
                    {error && <p role="alert" className="community-error">{error}</p>}
                    {notice && <p role="status" className="community-notice">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Cerrar aviso">×</button></p>}
                    {loading ? <p className="community-state">Cargando conversaciones…</p> : topics.length === 0 ? <div className="community-empty"><span>01 / NUEVO HILO</span><h3>La conversación empieza aquí.</h3><p>No hay temas con estos filtros todavía.</p></div> :
                        <div className="community-topic-list">{topics.map((item, index) => <article className="community-topic-row" key={item.id}>
                            <span className="community-topic-index">{String((page - 1) * 15 + index + 1).padStart(2, "0")}</span>
                            <div className="community-topic-main">
                                <div className="community-meta"><span className="community-tag">{categories.find((entry) => entry.value === item.category)?.label ?? item.category}</span><span>{dateLabel(item.createdAt)}</span></div>
                                <h3><Link to={`/pag/comunidad/${item.id}`}>{item.title}</Link></h3>
                                <p>{item.content.length > 220 ? `${item.content.slice(0, 220)}…` : item.content}</p>
                                <div className="community-topic-byline">Iniciado por <strong>{authorName(item.author)}</strong></div>
                            </div>
                            <Link className="community-open-link" to={`/pag/comunidad/${item.id}`} aria-label={`Abrir ${item.title}`}>↗</Link>
                        </article>)}</div>}
                    {!loading && total > 15 && <div className="community-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>← Anterior</button><span>{page} / {Math.ceil(total / 15)}</span><button type="button" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage((value) => value + 1)}>Siguiente →</button></div>}
                </section>
            </> : <section className="community-thread">
                <Link className="community-back-link" to="/pag/comunidad">← Volver a conversaciones</Link>
                {error && <p role="alert" className="community-error">{error}</p>}
                {notice && <p role="status" className="community-notice">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Cerrar aviso">×</button></p>}
                {loading ? <p className="community-state">Cargando conversación…</p> : topic && <>
                    <div className="community-thread-meta"><span className="community-tag">{categories.find((entry) => entry.value === topic.category)?.label ?? topic.category}</span><span>Publicado el {dateLabel(topic.createdAt)}</span></div>
                    {editingTopic ? <form className="community-compose" onSubmit={(event) => void saveTopic(event)}>
                        <label>Título<input value={topicDraft.title} onChange={(event) => setTopicDraft({ ...topicDraft, title: event.target.value })} maxLength={160} required /></label>
                        <label>Contexto<textarea value={topicDraft.content} onChange={(event) => setTopicDraft({ ...topicDraft, content: event.target.value })} rows={6} maxLength={10000} required /></label>
                        <button type="submit" disabled={busy}>Guardar cambios</button><button type="button" className="community-text-button" onClick={() => setEditingTopic(false)}>Cancelar</button>
                    </form> : <>
                        <h2 className="community-thread-title">{topic.title}</h2>
                        <p className="community-thread-author">Por <strong>{authorName(topic.author)}</strong> · {dateLabel(topic.createdAt)}</p>
                        <div className="community-thread-content">{topic.content}</div>
                        <div className="community-actions community-topic-actions">
                            {isLoggedIn() && user?.id === topic.userId && <>
                                <button type="button" onClick={() => { setTopicDraft({ title: topic.title, content: topic.content }); setEditingTopic(true) }}>Editar tema</button>
                                <button type="button" onClick={() => void removeTopic()}>Eliminar tema</button>
                            </>}
                            {isLoggedIn() && <button type="button" onClick={() => setReportTarget({ type: "topic", id: topic.id })}>Reportar tema</button>}
                        </div>
                    </>}
                    <section className="community-comments-section">
                        <div className="community-comments-heading"><span className="community-overline">INTERCAMBIO</span><h3>Respuestas <span>{topic.comments?.length ?? 0}</span></h3></div>
                        {topic.comments?.length ? <div className="community-comments-list">{topic.comments.map((comment) => renderComment(comment))}</div> : <p className="community-no-comments">Todavía no hay respuestas. Puedes abrir la conversación.</p>}
                        <form className="community-reply-form" onSubmit={(event) => void addComment(event)}>
                            <label htmlFor="community-reply">{replyingTo ? "Tu respuesta" : "Aporta a la conversación"}</label>
                            {replyingTo && <button className="community-text-button" type="button" onClick={() => setReplyingTo(null)}>Responder al tema en su lugar</button>}
                            <textarea id="community-reply" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={5000} rows={4} placeholder="Comparte una recomendación práctica…" />
                            <button type="submit" disabled={busy || !commentDraft.trim()}>{busy ? "Enviando…" : "Publicar respuesta"}</button>
                        </form>
                    </section>
                </>}
            </section>}
        </div>

        {reportTarget && <div className="community-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportTarget(null) }}>
            <form className="community-report-modal" onSubmit={(event) => void sendReport(event)}>
                <button type="button" className="community-modal-close" onClick={() => setReportTarget(null)} aria-label="Cerrar">×</button>
                <span className="community-overline">REVISIÓN DE CONTENIDO</span><h2>Reportar {reportTarget.type === "topic" ? "tema" : "comentario"}</h2>
                <label>Motivo<select value={reportReason} onChange={(event) => setReportReason(event.target.value)}><option value="off-topic">Fuera de tema</option><option value="spam">Spam</option><option value="abuse">Acoso o abuso</option><option value="sensitive-data">Datos sensibles</option><option value="other">Otro</option></select></label>
                <label>Detalle opcional<textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={1000} rows={4} /></label>
                <button type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar reporte"}</button>
            </form>
        </div>}
    </main>
}