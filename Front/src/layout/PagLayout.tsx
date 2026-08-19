import { Link, Outlet, useNavigate } from "react-router-dom"
import { isLoggedIn, removeUserToken } from "../config/api"

export default function Layout() {
    
    const navigate = useNavigate()
    const loggedIn = isLoggedIn()

    const handleVerCursos = () => {
        
        if (loggedIn) {
            navigate("/pag/cursos")
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
                    🥾 Zapaterías<span style={{ color: "#2D6A4F" }}>Seguras</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/pag/home" style={{ color: "#444", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
                        className="hover:text-[#C4622D] transition-colors">
                        Inicio
                    </Link>

                    <button
                        onClick={handleVerCursos}
                        style={{ background: "none", border: "none", color: "#444", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                        className="hover:text-[#C4622D] transition-colors"
                    >
                        Cursos
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
                    🥾 Zapaterías<span style={{ color: "#C4622D" }}>Seguras</span>
                </div>
                <div style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                    Un proyecto de bien público para el sector calzado.<br />
                    Barrio El Restrepo · Bogotá, Colombia · 2025
                </div>
                <div style={{ fontSize: "0.75rem", textAlign: "right", lineHeight: 1.6 }}>
                    Alineado con ISO/IEC 27001 · Ley 1581/2012
                </div>
            </footer>
        </div>
    )
}
