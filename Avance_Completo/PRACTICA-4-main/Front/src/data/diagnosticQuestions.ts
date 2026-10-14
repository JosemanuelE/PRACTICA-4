export const preguntas = [
    { id: "antivirus", pregunta: "¿Tu empresa tiene antivirus instalado y actualizado en todos sus dispositivos?", peso: 10, categoria: "Protección básica", icono: "🛡️" },
    { id: "backup", pregunta: "¿Realizas copias de seguridad (backups) de tus datos importantes al menos una vez por semana?", peso: 10, categoria: "Continuidad del negocio", icono: "💾" },
    { id: "contrasenas", pregunta: "¿Usas contraseñas diferentes y fuertes (más de 8 caracteres, con números y símbolos) en tus cuentas del negocio?", peso: 10, categoria: "Contraseñas", icono: "🔑" },
    { id: "wifi", pregunta: "¿Tu red WiFi del negocio está separada de la red que usan los clientes o visitantes?", peso: 8, categoria: "Seguridad de redes", icono: "📡" },
    { id: "dobleFA", pregunta: "¿Tienes activada la verificación en dos pasos (2FA) en WhatsApp Business y correo electrónico?", peso: 10, categoria: "Autenticación", icono: "📱" },
    { id: "capacitacion", pregunta: "¿Tus empleados han recibido alguna capacitación sobre ciberseguridad en el último año?", peso: 8, categoria: "Formación", icono: "📚" },
    { id: "actualizaciones", pregunta: "¿Mantienes actualizados los sistemas operativos y aplicaciones de los dispositivos del negocio?", peso: 8, categoria: "Actualizaciones", icono: "🔄" },
    { id: "phishing", pregunta: "¿Sabes identificar un correo o mensaje fraudulento (phishing) antes de hacer clic en un enlace?", peso: 8, categoria: "Conciencia digital", icono: "🎣" },
    { id: "plan", pregunta: "¿Tu empresa tiene un plan o protocolo definido para actuar si sufre un ciberataque?", peso: 10, categoria: "Plan de respuesta", icono: "📋" },
    { id: "datos", pregunta: "¿Tienes un registro de qué datos personales de clientes guardas y pides autorización para tratarlos (Ley 1581)?", peso: 10, categoria: "Cumplimiento legal", icono: "⚖️" },
    { id: "presupuesto", pregunta: "¿Tu empresa destina algún presupuesto, por pequeño que sea, a herramientas de seguridad digital?", peso: 8, categoria: "Inversión en seguridad", icono: "💰" },
] as const

export type PreguntaDiagnostico = (typeof preguntas)[number]
export type IdPregunta = PreguntaDiagnostico["id"]