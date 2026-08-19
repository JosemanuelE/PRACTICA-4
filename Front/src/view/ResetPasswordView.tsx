import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import ErrorMessage from "../components/ErrorMessage"
import { API_BASE } from "../config/api"

type FormValues = { password: string; confirm: string }

export default function ResetPasswordView() {
    const [params] = useSearchParams()
    const token = params.get("token") || ""
    const [done, setDone] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: { password: "", confirm: "" },
    })
    const password = watch("password")

    const onSubmit = async ({ password: pwd }: FormValues) => {
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: pwd }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setSubmitError(typeof data.message === "string" ? data.message : "No se pudo cambiar la contraseña")
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
                    Nueva contraseña
                </h1>
                {!token && (
                    <p className="text-sm" style={{ color: "#D62828" }}>Este enlace no incluye token.</p>
                )}
                {done ? (
                    <>
                        <p className="text-sm mb-4" style={{ color: "#2D6A4F" }}>
                            Contraseña actualizada. Ya puedes iniciar sesión.
                        </p>
                        <Link to="/auth/login" className="font-bold" style={{ color: "#C4622D" }}>
                            Ir al login
                        </Link>
                    </>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase">Contraseña nueva</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3.5 rounded-xl text-sm"
                                style={{ border: "2px solid #e8ddd2" }}
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                })}
                            />
                            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase">Confirmar</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3.5 rounded-xl text-sm"
                                style={{ border: "2px solid #e8ddd2" }}
                                {...register("confirm", {
                                    required: "Confirma la contraseña",
                                    validate: (v) => v === password || "Las contraseñas no coinciden",
                                })}
                            />
                            {errors.confirm && <ErrorMessage>{errors.confirm.message}</ErrorMessage>}
                        </div>
                        {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
                        <button
                            type="submit"
                            disabled={isSubmitting || !token}
                            className="w-full py-4 rounded-xl font-bold text-white border-none"
                            style={{ background: "#C4622D" }}
                        >
                            {isSubmitting ? "Guardando…" : "Guardar contraseña"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
