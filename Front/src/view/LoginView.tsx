import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import ErrorMessage from "../components/ErrorMessage"
import PasswordInput from "../components/PasswordInput"
import { API_BASE, setUserToken } from "../config/api"

type LoginFormValues = {
    email: string
    password: string
}

export default function LoginView() {
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [needsVerification, setNeedsVerification] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        defaultValues: { email: "", password: "" },
    })

    const onLogin = async ({ email, password }: LoginFormValues) => {
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                if (data.token) setUserToken(data.token)
                navigate("/pag/cursos", { replace: true })
                return
            }
            const msg =
                typeof data.message === "string"
                    ? data.message
                    : Array.isArray(data.errors) && data.errors[0]?.msg
                      ? data.errors[0].msg
                      : "No se pudo iniciar sesión"
            setSubmitError(msg)
            if (data.code === "EMAIL_NOT_VERIFIED") {
                setNeedsVerification(true)
            }
        } catch {
            setSubmitError("No se pudo conectar con el servidor. ¿Está el backend en marcha?")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <section
                className="flex-1 flex items-center justify-center px-6"
                style={{ background: "#F4EDE4" }}
            >
                <div
                    className="w-full max-w-md"
                    style={{ animation: "fadeUp 0.5s ease both" }}
                >
                    <Link to="/" className="lg:hidden no-underline block mb-10">
                        <span
                            className="font-serif text-xl font-black"
                            style={{ color: "#C4622D" }}
                        >
                            Zapaterías
                            <span style={{ color: "#2D6A4F" }}>Seguras</span>
                        </span>
                    </Link>

                    <h1
                        className="font-serif text-3xl font-black mb-1 tracking-tight"
                        style={{ color: "#2C2C2C" }}
                    >
                        Iniciar sesión
                    </h1>

                    <p className="text-sm mb-8" style={{ color: "#444444" }}>
                        ¿No tienes cuenta?{" "}
                        <Link
                            to="/auth/register"
                            className="font-semibold no-underline hover:underline"
                            style={{ color: "#C4622D" }}
                        >
                            Crear cuenta
                        </Link>
                    </p>

                    <form
                        onSubmit={handleSubmit(onLogin)}
                        className="flex flex-col gap-5"
                        noValidate
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                className="text-xs font-semibold uppercase"
                                style={{ color: "#2C2C2C", letterSpacing: "0.06em" }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="Ej: ejemplo@gmail.com"
                                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                                {...register("email", {
                                    required: "El email es obligatorio",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "El email no es válido",
                                    },
                                })}
                                style={{
                                    border: "2px solid #e8ddd2",
                                    background: "#ffffff",
                                    color: "#2C2C2C",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#C4622D"
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(196,98,45,0.1)"
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "#e8ddd2"
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            />
                            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                className="text-xs font-semibold uppercase"
                                style={{ color: "#2C2C2C", letterSpacing: "0.06em" }}
                            >
                                Contraseña
                            </label>
                            <PasswordInput
                                autoComplete="current-password"
                                placeholder="Tu contraseña"
                                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                })}
                                style={{
                                    border: "2px solid #e8ddd2",
                                    background: "#ffffff",
                                    color: "#2C2C2C",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#C4622D"
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(196,98,45,0.1)"
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "#e8ddd2"
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            />
                            {errors.password && (
                                <ErrorMessage>{errors.password.message}</ErrorMessage>
                            )}
                            <Link
                                to="/auth/forgot-password"
                                className="text-xs font-semibold no-underline hover:underline self-start"
                                style={{ color: "#C4622D" }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
                        {needsVerification && (
                            <p className="text-xs" style={{ color: "#444" }}>
                                ¿No te llegó el correo?{" "}
                                <Link to="/auth/forgot-password" className="font-semibold" style={{ color: "#C4622D" }}>
                                    Revisa también spam
                                </Link>
                                {" "}o vuelve a registrarte con el mismo email para pedir el reenvío desde la pantalla de registro.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl font-bold text-base text-white border-none cursor-pointer transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: "#C4622D",
                                boxShadow: "0 4px 20px rgba(196,98,45,0.3)",
                            }}
                            onMouseEnter={(e) => {
                                if (isSubmitting) return
                                e.currentTarget.style.background = "#9e4e23"
                                e.currentTarget.style.transform = "translateY(-2px)"
                                e.currentTarget.style.boxShadow = "0 8px 30px rgba(196,98,45,0.4)"
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#C4622D"
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(196,98,45,0.3)"
                            }}
                        >
                            {isSubmitting ? "Entrando…" : "Iniciar sesión"}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    )
}
