import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { API_BASE } from "../config/api"

export default function VerifyEmailView() {
    const [params] = useSearchParams()
    const token = params.get("token") || ""
    const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
    const [message, setMessage] = useState("Confirmando tu correo…")

    useEffect(() => {
        const run = async () => {
            if (!token) {
                setStatus("error")
                setMessage("Falta el enlace de confirmación.")
                return
            }
            try {
                const res = await fetch(`${API_BASE}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setStatus("error")
                    setMessage(typeof data.message === "string" ? data.message : "No se pudo confirmar el correo.")
                    return
                }
                setStatus("ok")
                setMessage(typeof data.message === "string" ? data.message : "Correo confirmado.")
            } catch {
                setStatus("error")
                setMessage("No se pudo conectar con el servidor.")
            }
        }
        void run()
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F4EDE4" }}>
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm text-center">
                <h1 className="font-serif text-2xl font-black mb-3" style={{ color: "#2C2C2C" }}>
                    Confirmar correo
                </h1>
                <p className="text-sm mb-6" style={{ color: status === "error" ? "#D62828" : "#444" }}>
                    {message}
                </p>
                {status === "ok" && (
                    <Link
                        to="/auth/login"
                        className="inline-block px-5 py-3 rounded-xl font-bold text-white no-underline"
                        style={{ background: "#C4622D" }}
                    >
                        Iniciar sesión
                    </Link>
                )}
                {status === "error" && (
                    <Link to="/auth/login" className="font-semibold" style={{ color: "#C4622D" }}>
                        Volver al login
                    </Link>
                )}
            </div>
        </div>
    )
}
