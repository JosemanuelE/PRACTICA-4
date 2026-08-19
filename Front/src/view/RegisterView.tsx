import { Link } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import ErrorMessage from "../components/ErrorMessage"
import { API_BASE } from "../config/api"

type RegisterFormValues = {
  name: string
  email: string
  password: string
  PassWordConfirmation: string
}

export default function RegisterView() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  const { register, watch, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', PassWordConfirmation: '' }
  })

  const password = watch('password')

  const handleRegister = async ({ name, email, password: pwd }: RegisterFormValues) => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      // 1. Registrar usuario
      const resReg = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pwd }),
      })
      const dataReg = await resReg.json().catch(() => ({}))
      if (!resReg.ok) {
        const msg =
          typeof dataReg.message === "string"
            ? dataReg.message
            : Array.isArray(dataReg.errors) && dataReg.errors[0]?.msg
              ? dataReg.errors[0].msg
              : "No se pudo crear la cuenta"
        setSubmitError(msg)
        return
      }

      setRegisteredEmail(email)
    } catch {
      setSubmitError("No se pudo conectar con el servidor. ¿Está el backend en marcha?")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
    border: '2px solid #e8ddd2',
    background: '#ffffff',
    color: '#2C2C2C',
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#C4622D'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,98,45,0.1)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e8ddd2'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div className="min-h-screen flex">
      <section
        className="flex-1 flex items-center justify-center px-6 py-16"
        style={{ background: '#F4EDE4' }}
      >
        <div className="w-full max-w-md" style={{ animation: 'fadeUp 0.5s ease both' }}>

          {/* Logo mobile */}
          <Link to="/pag/home" className="lg:hidden no-underline block mb-10">
            <span className="font-serif text-xl font-black" style={{ color: '#C4622D' }}>
              🥾 Zapaterías<span style={{ color: '#2D6A4F' }}>Seguras</span>
            </span>
          </Link>

          <h1 className="font-serif text-3xl font-black mb-1 tracking-tight" style={{ color: '#2C2C2C' }}>
            Crear cuenta
          </h1>
          <p className="text-sm mb-8" style={{ color: '#444444' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/auth/login" className="font-semibold no-underline hover:underline" style={{ color: '#C4622D' }}>
              Inicia sesión
            </Link>
          </p>

          {registeredEmail ? (
            <div className="rounded-2xl p-5 text-sm leading-relaxed" style={{ background: "#fff", border: "1px solid #e8ddd2" }}>
              <p className="font-semibold mb-2" style={{ color: "#2D6A4F" }}>
                Cuenta creada. Ahora confirma tu correo.
              </p>
              <p style={{ color: "#444" }}>
                Enviamos un enlace a <strong>{registeredEmail}</strong>. Ábrelo para activar la cuenta.
                Si no hay SMTP configurado, el enlace aparece en la terminal del backend.
              </p>
              <Link to="/auth/login" className="inline-block mt-4 font-bold" style={{ color: "#C4622D" }}>
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
          <>
          <form onSubmit={handleSubmit(handleRegister)} className="flex flex-col gap-5" noValidate>

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase" style={{ color: '#2C2C2C', letterSpacing: '0.06em' }}>
                Nombre
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Gómez"
                autoComplete="name"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                {...register("name", { required: "El nombre es obligatorio" })}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase" style={{ color: '#2C2C2C', letterSpacing: '0.06em' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Ej: ejemplo@gmail.com"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: { value: /^\S+@\S+$/i, message: "El email no es válido" }
                })}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase" style={{ color: '#2C2C2C', letterSpacing: '0.06em' }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" }
                })}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
            </div>

            {/* Confirmar contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase" style={{ color: '#2C2C2C', letterSpacing: '0.06em' }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                {...register("PassWordConfirmation", {
                  required: "Confirma tu contraseña",
                  validate: (value) => value === password || "Las contraseñas no coinciden"
                })}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.PassWordConfirmation && <ErrorMessage>{errors.PassWordConfirmation.message}</ErrorMessage>}
            </div>

            {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-base text-white border-none cursor-pointer transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#C4622D', boxShadow: '0 4px 20px rgba(196,98,45,0.3)' }}
              onMouseEnter={(e) => {
                if (isSubmitting) return
                e.currentTarget.style.background = '#9e4e23'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(196,98,45,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#C4622D'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(196,98,45,0.3)'
              }}
            >
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta gratis"}
            </button>
          </form>

          <p className="text-xs text-center mt-8 leading-relaxed" style={{ color: 'rgba(68,68,68,0.5)' }}>
            Al registrarte, aceptas los Términos de Uso y la Política de Privacidad.
          </p>
          </>
          )}
        </div>
      </section>
    </div>
  )
}
