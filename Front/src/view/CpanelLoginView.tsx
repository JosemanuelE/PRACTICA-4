import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE, ADMIN_TOKEN_KEY } from "../config/api"
import ErrorMessage from "../components/ErrorMessage"

export default function CpanelLoginView() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/admin/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(
                    typeof data.message === "string"
                        ? data.message
                        : "No se pudo iniciar sesión"
                )
                return
            }
            if (typeof data.token === "string") {
                sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token)
                navigate("/cpanel/dashboard", { replace: true })
            } else {
                setError("Respuesta inválida del servidor")
            }
        } catch {
            setError("No se pudo conectar con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "#1a1a1a" }}
        >
            <div
                className="w-full max-w-md rounded-2xl p-8 shadow-xl"
                style={{ background: "#2C2C2C" }}
            >
                <h1 className="text-xl font-bold text-white mb-1">Panel administrativo</h1>
                <p className="text-sm text-gray-400 mb-8">
                    Introduce las credenciales de administrador
                </p>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full px-4 py-3 rounded-lg bg-[#3d3d3d] border border-gray-600 text-white text-sm outline-none focus:border-[#C4622D]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 rounded-lg bg-[#3d3d3d] border border-gray-600 text-white text-sm outline-none focus:border-[#C4622D]"
                        />
                    </div>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-semibold text-white bg-[#C4622D] hover:bg-[#9e4e23] disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Entrando…" : "Entrar al panel"}
                    </button>
                </form>
            </div>
        </div>
    )
}
