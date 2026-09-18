import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import ErrorMessage from "../components/ErrorMessage"
import { API_BASE } from "../config/api"

type FormValues = { email: string }

export default function ForgotPasswordView() {
    const [done, setDone] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: { email: "" },
    })

    const onSubmit = async ({ email }: FormValues) => {
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setSubmitError(typeof data.message === "string" ? data.message : "No se pudo enviar el correo")
                return
            }
            setDone(true)
        } catch {
            setSubmitError("No se pudo conectar con el servidor.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F4EDE4" }}>
            <div className="w-full max-w-md">
                <h1 className="font-serif text-3xl font-black mb-2" style={{ color: "#2C2C2C" }}>
                    Recuperar contraseña
                </h1>
                <p className="text-sm mb-8" style={{ color: "#444" }}>
                    Te enviaremos un enlace si el correo está registrado.
                </p>
                {done ? (
                    <p className="text-sm leading-relaxed" style={{ color: "#2D6A4F" }}>
                        Si el correo existe, enviamos las instrucciones. Revisa tu bandeja (o la terminal del backend
                        si estás en modo desarrollo).
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                style={{ border: "2px solid #e8ddd2" }}
                                {...register("email", {
                                    required: "El email es obligatorio",
                                    pattern: { value: /^\S+@\S+$/i, message: "El email no es válido" },
                                })}
                            />
                            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                        </div>
                        {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl font-bold text-white border-none"
                            style={{ background: "#C4622D" }}
                        >
                            {isSubmitting ? "Enviando…" : "Enviar enlace"}
                        </button>
                    </form>
                )}
                <p className="text-sm mt-6">
                    <Link to="/auth/login" style={{ color: "#C4622D" }}>Volver al login</Link>
                </p>
            </div>
        </div>
    )
}
