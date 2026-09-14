import { Link, Outlet, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
    fetchSessionUser,
    getSessionUser,
    isLoggedIn,
    removeUserToken,
    type SessionUser,
} from "../config/api"

export default function Layout() {
    
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()
    const [user, setUser] = useState<SessionUser | null>(() => getSessionUser())

    useEffect(() => {
        if (!loggedIn) {
            setUser(null)
            return
        }
        // Confirma contra el backend de quién es la sesión. Si no hay respuesta
        // se mantienen los datos guardados en el navegador.
        void fetchSessionUser().then((fresh) => {
            if (fresh) setUser(fresh)
        })
    }, [loggedIn])

    const handleVerPlan = () => {

        if (loggedIn) {
            navigate("/pag/plan-accion")
        } else {
            navigate("/auth/login")
        }
    }

    const handleLogout = () => {
        removeUserToken()
        
        navigate("/pag/home", { replace: true })
        // Forzar re-render
        window.location.reload()
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* NAVBAR */}
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "rgba(244,237,228,0.92)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(196,98,45,0.15)",
                }}
                className="w-full px-8 py-4 flex justify-between items-center"
            >
                <Link
                    to="/pag/home"
                    className="no-underline hover:opacity-90"
                    style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 900, color: "#C4622D" }}
                >
                    🏪 Pymes<span style={{ color: "#2D6A4F" }}>Seguras</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/pag/home" style={{ color: "#444", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
                        className="hover:text-[#C4622D] transition-colors">
                        Inicio
                    </Link>

                    <button
                        onClick={handleVerPlan}
                        style={{ background: "none", border: "none", color: "#444", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                        className="hover:text-[#C4622D] transition-colors"
                    >
                        Mi plan de acción
                    </button>

                    <Link to="/pag/leyes" style={{ color: "#444", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
                        className="hover:text-[#C4622D] transition-colors">
                        Leyes
                    </Link>

                    <Link to="/pag/diagnostico" style={{
                        background: "rgba(196,98,45,0.1)", color: "#C4622D",
                        textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
                        padding: "0.3rem 0.85rem", borderRadius: 100,
                        border: "1px solid rgba(196,98,45,0.3)",
                    }}>
                        🔍 Diagnóstico
                    </Link>

                    {loggedIn && (
                        <Link to="/pag/evolucion" style={{ color: "#444", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
                            className="hover:text-[#C4622D] transition-colors">
                            Evolución
                        </Link>
                    )}

                    {loggedIn && (
                        <div
                            title={user ? `Sesión activa: ${user.email}` : "Sesión activa"}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.55rem",
                                background: "rgba(45,106,79,0.1)",
                                border: "1px solid rgba(45,106,79,0.3)",
                                borderRadius: 100, padding: "0.25rem 0.85rem 0.25rem 0.3rem",
                            }}
                        >
                            <span style={{
                                width: 28, height: 28, borderRadius: "50%", background: "#2D6A4F",
                                color: "white", fontSize: "0.8rem", fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, textTransform: "uppercase",
                            }}>
                                {(user?.name || user?.email || "?").trim().charAt(0)}
                            </span>
                            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2C2C2C" }}>
                                    {user?.name ?? "Cargando…"}
                                    {user?.role === "admin" && (
                                        <span style={{ color: "#C4622D", fontWeight: 600 }}> · Admin</span>
                                    )}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "#666" }}>
                                    {user?.email ?? "sesión activa"}
                                </span>
                            </span>
                        </div>
                    )}

                    {loggedIn ? (
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "#C4622D", color: "white", padding: "0.4rem 1.1rem",
                                borderRadius: 100, fontWeight: 600, fontSize: "0.875rem",
                                border: "none", cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            Cerrar sesión
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/auth/login"
                                style={{ color: "#444", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
                                className="hover:text-[#C4622D] transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                to="/auth/register"
                                style={{
                                    background: "#C4622D", color: "white", padding: "0.4rem 1.1rem",
                                    borderRadius: 100, fontWeight: 600, fontSize: "0.875rem",
                                    textDecoration: "none",
                                }}
                            >
                                Crear cuenta
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* CONTENIDO */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* FOOTER */}
            <footer style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.5)", padding: "2.5rem 4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 900, color: "white" }}>
                    🏪 Pymes<span style={{ color: "#C4622D" }}>Seguras</span>
                </div>
                <div style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                    Un proyecto de bien público para las pymes de Colombia.<br />
                    Barrio El Restrepo · Bogotá, Colombia · 2025
                </div>
                <div style={{ fontSize: "0.75rem", textAlign: "right", lineHeight: 1.6 }}>
                    Alineado con ISO/IEC 27001 · Ley 1581/2012
                </div>
            </footer>
        </div>
    )
}
