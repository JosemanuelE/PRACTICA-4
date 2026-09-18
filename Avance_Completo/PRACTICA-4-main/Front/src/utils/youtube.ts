/** Convierte URL de visualización de YouTube a URL apta para iframe embed */
export function toYouTubeEmbedUrl(url: string): string {
    const u = url.trim()
    if (!u) return ""
    if (u.includes("youtube.com/embed/")) {
        return u.split("&")[0]
    }
    const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
    return u
}
