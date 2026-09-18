import { useEffect, useMemo, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { API_BASE, getUserToken, isLoggedIn, removeUserToken } from "../config/api"

// ── Tipos ───────────────────────────────────────────────────────────────────
type RespuestaDiag = "si" | "no" | "parcial"

type DiagnosticoRow = {
    id: number
    companyName: string | null
    answers: Record<string, RespuestaDiag>
    securityScore: number
    riskScore: number
    weakestPoint: string
    createdAt: string
}

type NivelPlan = "bajo" | "medio" | "alto"

type AccionPlan = {
    id: string
    texto: string
    /** Qué es y por qué importa, en lenguaje sencillo. */
    detalle: string
    /** Pasos concretos para ejecutarla. */
    pasos: string[]
    /** Cómo confirmar que quedó bien hecha antes de marcarla. */
    verificacion: string
    /** Qué puede pasar si se omite (motivación de seguridad). */
    riesgo: string
    /** Estándar o norma que respalda la tarea. */
    marco?: string
}

type FasePlan = {
    nombre: string
    plazo: string
    acciones: AccionPlan[]
}

type PlanDefinicion = {
    nivel: NivelPlan
    titulo: string
    emoji: string
    color: string
    bg: string
    resumen: string
    fases: FasePlan[]
    marcos: string[]
}

// ── Definición de los 3 planes de acción ────────────────────────────────────
// Fundamentados en: NIST Cybersecurity Framework 2.0, CIS Critical Security
// Controls v8 (Implementation Group 1 - higiene cibernética básica para
// pequeñas organizaciones), ISO/IEC 27001:2022, NIST SP 800-63B y la
// normativa colombiana (Ley 1273 de 2009, Ley 1581 de 2012, CONPES 3854).
const PLANES: Record<NivelPlan, PlanDefinicion> = {
    bajo: {
        nivel: "bajo",
        titulo: "Plan de mantenimiento y mejora continua",
        emoji: "✅",
        color: "#2D6A4F",
        bg: "#d1fae5",
        resumen:
            "Tu negocio ya tiene una base sólida de ciberseguridad. El objetivo ahora es mantener el nivel logrado, formalizar por escrito lo que ya haces bien y prepararte para crecer sin perder el control de tus riesgos.",
        fases: [
            {
                nombre: "Consolidar",
                plazo: "0 – 15 días",
                acciones: [
                    {
                        id: "bajo-f1-1",
                        texto:
                            "Documenta por escrito las prácticas de seguridad que ya aplicas de forma informal (contraseñas, backups, uso de WiFi).",
                        detalle:
                            "Tus buenas prácticas hoy viven en la cabeza de una o dos personas. Si esa persona se va o falta, el negocio pierde la protección sin darse cuenta. Documentarlas convierte un hábito personal en una regla del negocio.",
                        pasos: [
                            "Haz una lista de las reglas que ya sigues en la práctica (por ejemplo: 'las contraseñas se cambian cada 6 meses', 'el respaldo se hace los viernes').",
                            "Escríbelas en un documento simple, en lenguaje claro y sin tecnicismos. Una o dos páginas son suficientes.",
                            "Incluye quién es responsable de cada práctica y con qué frecuencia debe hacerse.",
                            "Compártelo con todo el equipo y guarda el archivo en un lugar accesible (carpeta compartida o impreso en la oficina).",
                        ],
                        verificacion:
                            "Pídele a alguien del equipo que lea el documento y te explique con sus palabras qué debe hacer. Si lo entiende sin que tengas que aclararle nada, está bien escrito.",
                        riesgo:
                            "Sin documentación, las prácticas se pierden con la rotación de personal y nadie puede auditar si realmente se están cumpliendo.",
                        marco: "ISO/IEC 27001:2022 – Cláusula 7.5 (Información documentada)",
                    },
                    {
                        id: "bajo-f1-2",
                        texto:
                            "Haz una prueba real de restauración de tu copia de seguridad más reciente para confirmar que sí funciona.",
                        detalle:
                            "Una copia de seguridad que nunca se ha probado no es una copia de seguridad: es una suposición. Es muy común descubrir que el respaldo estaba incompleto, corrupto o vacío justo en el momento de la emergencia.",
                        pasos: [
                            "Elige un archivo o carpeta importante de tu copia de seguridad más reciente.",
                            "Restáuralo en una ubicación de prueba (una carpeta nueva o un equipo distinto), nunca encima del archivo original.",
                            "Ábrelo y revisa que el contenido esté completo y legible, no solo que el archivo exista.",
                            "Anota la fecha de esta prueba en tu documento de prácticas de seguridad.",
                        ],
                        verificacion:
                            "Pudiste abrir el archivo restaurado y su contenido coincide con el original. Si el archivo no abre o está incompleto, tu respaldo está fallando y hay que corregirlo antes de continuar.",
                        riesgo:
                            "Ante un ransomware o una falla de disco, descubrirías que el respaldo no sirve cuando ya es demasiado tarde para recuperar la información.",
                        marco: "CIS Control 11 – Recuperación de datos",
                    },
                    {
                        id: "bajo-f1-3",
                        texto:
                            "Revisa quién tiene acceso a las cuentas administrativas del negocio y elimina accesos que ya no se usan.",
                        detalle:
                            "Con el tiempo se acumulan accesos de exempleados, proveedores antiguos, contadores que ya no trabajan contigo o pruebas temporales que nadie recuerda. Cada acceso innecesario es una puerta abierta que no estás vigilando.",
                        pasos: [
                            "Lista todas las cuentas con permisos de administrador: correo, redes sociales, banca en línea, punto de venta, contabilidad, hosting de la página web.",
                            "Para cada una, escribe quién tiene acceso hoy y si realmente lo necesita para su trabajo actual.",
                            "Elimina los usuarios que ya no correspondan; si la cuenta es compartida, cambia la contraseña.",
                            "Aplica el principio de mínimo privilegio: cada persona debe tener solo los permisos que su rol exige, no más.",
                        ],
                        verificacion:
                            "Cada acceso administrativo que queda en la lista tiene un nombre y una razón de negocio asociada. No queda ningún acceso del que no sepas quién lo usa ni para qué.",
                        riesgo:
                            "Un exempleado molesto o una cuenta olvidada con contraseña débil es una de las vías de intrusión más frecuentes y difíciles de detectar.",
                        marco: "CIS Control 5 – Gestión de cuentas",
                    },
                ],
            },
            {
                nombre: "Formalizar",
                plazo: "1 – 3 meses",
                acciones: [
                    {
                        id: "bajo-f2-1",
                        texto: "Establece un calendario de revisiones de seguridad cada trimestre.",
                        detalle:
                            "La seguridad se degrada sola: alguien desactiva el antivirus para instalar algo, un respaldo deja de correr, entra personal nuevo sin capacitar. Una revisión periódica detecta estos descuidos antes de que se conviertan en incidentes.",
                        pasos: [
                            "Agenda un recordatorio fijo cada tres meses (por ejemplo, el primer lunes de enero, abril, julio y octubre).",
                            "Define una lista corta de verificación: contraseñas, respaldos, accesos vigentes, actualizaciones y antivirus activos.",
                            "Reserva entre 30 y 60 minutos para recorrer esa lista con calma.",
                            "Registra por escrito qué encontraste y qué corregiste en cada revisión.",
                        ],
                        verificacion:
                            "El recordatorio está creado en el calendario que realmente usas y existe la lista de verificación escrita. Ya completaste al menos una revisión y quedó registrada.",
                        riesgo:
                            "Sin revisiones, el nivel de seguridad que lograste se erosiona en meses y solo te enteras cuando ya ocurrió el incidente.",
                        marco: "NIST CSF 2.0 – Función Identificar / ISO 27001 Cláusula 9.1",
                    },
                    {
                        id: "bajo-f2-2",
                        texto: "Capacita a todo el personal nuevo en las políticas de seguridad desde su primer día.",
                        detalle:
                            "El eslabón más débil suele ser la persona que nunca recibió la información básica. Si la seguridad no forma parte de la inducción, cada contratación abre un hueco nuevo en tus defensas.",
                        pasos: [
                            "Agrega un punto de 'seguridad digital' al proceso de inducción que ya usas.",
                            "Explica las políticas documentadas: manejo de contraseñas, uso del WiFi, qué hacer ante un correo sospechoso y a quién reportar.",
                            "Entrega el documento de prácticas de seguridad y pide confirmación por escrito de que lo leyó.",
                            "Deja claro que reportar un error o un clic sospechoso nunca será motivo de sanción: la detección temprana vale más que el silencio.",
                        ],
                        verificacion:
                            "La última persona que ingresó al negocio recibió la inducción de seguridad y puede decirte a quién reportar un incidente.",
                        riesgo:
                            "Un empleado sin formación es el objetivo preferido del phishing y la ingeniería social, las causas más comunes de brechas en pequeñas empresas.",
                        marco: "CIS Control 14 – Concientización y formación en seguridad",
                    },
                    {
                        id: "bajo-f2-3",
                        texto: "Evalúa adoptar un gestor de contraseñas empresarial para todo el equipo.",
                        detalle:
                            "Un gestor de contraseñas permite usar claves largas y distintas en cada servicio sin memorizarlas, y elimina la práctica de anotarlas en papeles, chats o archivos de Excel. También facilita revocar accesos cuando alguien sale del equipo.",
                        pasos: [
                            "Compara dos o tres opciones reconocidas, revisando si ofrecen plan gratuito o de bajo costo por usuario.",
                            "Verifica que la herramienta use cifrado de extremo a extremo y permita compartir credenciales sin revelarlas en texto plano.",
                            "Haz una prueba piloto con una o dos personas durante un par de semanas.",
                            "Si funciona, migra primero las contraseñas críticas del negocio (banca, correo, punto de venta) y luego el resto.",
                        ],
                        verificacion:
                            "Las contraseñas críticas del negocio están dentro del gestor y ya nadie del equipo necesita anotarlas en papel, chats o archivos sin proteger.",
                        riesgo:
                            "Sin un gestor, la tendencia natural es reutilizar contraseñas; una sola filtración externa termina comprometiendo varias cuentas del negocio a la vez.",
                        marco: "CIS Control 5 – Gestión de cuentas / NIST SP 800-63B",
                    },
                    {
                        id: "bajo-f2-4",
                        texto:
                            "Revisa las prácticas de seguridad de tus proveedores externos (plataforma de pagos, POS, contabilidad en la nube).",
                        detalle:
                            "Tus datos están también en manos de terceros. Si tu proveedor sufre una brecha, la información de tus clientes queda expuesta aunque tú hayas hecho todo bien. Esto se conoce como riesgo de cadena de suministro.",
                        pasos: [
                            "Lista los proveedores que almacenan o procesan información sensible del negocio o de tus clientes.",
                            "Revisa en su sitio web o pregúntales directamente: ¿ciframos los datos?, ¿ofrecen autenticación en dos pasos?, ¿tienen respaldos propios?",
                            "Pregunta también cómo y en cuánto tiempo te notificarían si sufrieran un incidente de seguridad.",
                            "Prioriza y renueva contratos con los proveedores que demuestren mejores prácticas o certificaciones reconocidas.",
                        ],
                        verificacion:
                            "Tienes por escrito (correo o documentación del proveedor) la respuesta de tus proveedores críticos sobre cifrado, 2FA y notificación de incidentes.",
                        riesgo:
                            "Como responsable del tratamiento de datos, tu negocio puede responder legalmente por una filtración ocurrida en un proveedor que elegiste sin verificar.",
                        marco: "ISO/IEC 27001:2022 – Anexo A.5.19 a A.5.22 (Relaciones con proveedores)",
                    },
                ],
            },
            {
                nombre: "Madurar",
                plazo: "3 – 6 meses",
                acciones: [
                    {
                        id: "bajo-f3-1",
                        texto:
                            "Realiza una autoevaluación básica frente al Anexo A de ISO/IEC 27001:2022 para identificar controles adicionales.",
                        detalle:
                            "No necesitas certificarte para aprovechar el estándar. Su lista de controles funciona como una checklist profesional que revela huecos que un diagnóstico general no alcanza a cubrir.",
                        pasos: [
                            "Busca un resumen público de los 93 controles del Anexo A de ISO/IEC 27001:2022, agrupados en organizativos, de personas, físicos y tecnológicos.",
                            "Marca cada control como 'cumplido', 'parcial', 'no cumplido' o 'no aplica' a tu negocio.",
                            "Concéntrate en los controles organizativos y de personas: suelen ser los más económicos de implementar.",
                            "Elige entre dos y tres controles nuevos como meta para el próximo semestre.",
                        ],
                        verificacion:
                            "Tienes la lista de controles con su estado marcado y ya seleccionaste cuáles vas a trabajar, con una fecha objetivo para cada uno.",
                        riesgo:
                            "Quedarte solo con lo básico deja expuestas áreas que no aparecen en un diagnóstico inicial, como la gestión de proveedores, la seguridad física o el control de cambios.",
                        marco: "ISO/IEC 27001:2022 – Anexo A",
                    },
                    {
                        id: "bajo-f3-2",
                        texto:
                            "Define un plan de continuidad de negocio ante incidentes mayores (robo de equipos, incendio, ransomware).",
                        detalle:
                            "Un plan de continuidad responde a la pregunta: '¿cómo seguimos operando si mañana perdemos todo?'. Tenerlo escrito reduce el pánico, el tiempo de reacción y las pérdidas económicas durante una emergencia real.",
                        pasos: [
                            "Identifica los recursos mínimos para seguir operando: qué datos, qué equipos y qué contactos clave necesitas.",
                            "Define cuánto tiempo podrías estar detenido sin que el negocio sufra un daño grave, y cuánta información podrías permitirte perder.",
                            "Anota dónde está respaldado cada recurso crítico y los pasos exactos para recuperarlo.",
                            "Escribe los primeros cinco pasos a ejecutar en las primeras horas de un incidente grave, con nombres y teléfonos de responsables.",
                        ],
                        verificacion:
                            "El plan está escrito, incluye contactos y pasos concretos, y al menos otra persona del negocio sabe dónde encontrarlo si tú no estás disponible.",
                        riesgo:
                            "Sin un plan, un incidente mayor puede detener la operación durante días o semanas; muchas pequeñas empresas no sobreviven a una interrupción prolongada.",
                        marco: "NIST CSF 2.0 – Función Recuperar / ISO 27001 Anexo A.5.29-5.30",
                    },
                    {
                        id: "bajo-f3-3",
                        texto: "Repite el diagnóstico cada 6 meses para verificar que tu puntaje se mantenga o mejore.",
                        detalle:
                            "La ciberseguridad no es un estado permanente: las amenazas cambian, el negocio crece y las buenas prácticas se relajan. Medir de nuevo es la única forma objetiva de saber si sigues protegido.",
                        pasos: [
                            "Agenda un recordatorio cada seis meses para volver a completar el diagnóstico.",
                            "Responde con honestidad según la situación real del momento, no según lo que planeabas hacer.",
                            "Compara el nuevo puntaje con el anterior en la sección 'Mi evolución'.",
                            "Si el puntaje bajó, revisa qué prácticas se dejaron de cumplir y retómalas de inmediato.",
                        ],
                        verificacion:
                            "El recordatorio está agendado y puedes ver al menos dos diagnósticos comparables en tu historial de evolución.",
                        riesgo:
                            "Sin medición periódica, el negocio puede pasar meses en un nivel de riesgo mayor del que crees, sin ninguna señal de alerta.",
                        marco: "NIST CSF 2.0 – Función Gobernar (mejora continua)",
                    },
                ],
            },
        ],
        marcos: ["NIST CSF 2.0", "ISO/IEC 27001:2022", "CIS Controls v8 (IG1)"],
    },
    medio: {
        nivel: "medio",
        titulo: "Plan de cierre de brechas",
        emoji: "⚠️",
        color: "#b45309",
        bg: "#fef9c3",
        resumen:
            "Tu negocio tiene algunas medidas de seguridad, pero existen brechas reales que un ciberdelincuente podría aprovechar. Este plan prioriza cerrarlas en un periodo corto y con bajo costo.",
        fases: [
            {
                nombre: "Contención inmediata",
                plazo: "0 – 15 días",
                acciones: [
                    {
                        id: "medio-f1-1",
                        texto:
                            "Activa la verificación en dos pasos (2FA) en correo, WhatsApp Business, redes sociales y banca en línea.",
                        detalle:
                            "El 2FA agrega un segundo requisito además de la contraseña (un código temporal o una confirmación en tu celular). Es la medida individual con mejor relación costo-beneficio: aunque roben tu contraseña, el atacante no puede entrar.",
                        pasos: [
                            "Haz una lista de todas las cuentas del negocio, empezando por correo y banca, que son las más críticas.",
                            "En cada una, entra a la configuración de seguridad y busca 'Verificación en dos pasos' o 'Autenticación de dos factores'.",
                            "Prefiere una aplicación autenticadora antes que los códigos por SMS: los mensajes de texto son vulnerables al fraude de duplicación de SIM.",
                            "Descarga y guarda los códigos de respaldo en un lugar físico seguro, fuera del celular.",
                        ],
                        verificacion:
                            "Cierra sesión y vuelve a entrar en la cuenta más crítica: debe pedirte el segundo factor. Si entra solo con la contraseña, el 2FA no quedó activo.",
                        riesgo:
                            "Con solo la contraseña como barrera, cualquier filtración, reutilización o phishing exitoso da acceso inmediato al correo y, desde ahí, a recuperar el resto de tus cuentas.",
                        marco: "CIS Control 6 – Gestión de control de acceso",
                    },
                    {
                        id: "medio-f1-2",
                        texto:
                            "Cambia cualquier contraseña compartida o reutilizada por contraseñas únicas de al menos 12 caracteres.",
                        detalle:
                            "Cuando una contraseña se repite en varias cuentas, una sola filtración compromete todas. Los atacantes automatizan esto: prueban credenciales robadas de un sitio en decenas de servicios más.",
                        pasos: [
                            "Identifica qué cuentas comparten la misma contraseña o usan una clave conocida por varias personas.",
                            "Crea una contraseña distinta para cada cuenta, de 12 caracteres o más. Una frase larga y fácil de recordar es más segura que una palabra corta con símbolos.",
                            "Evita datos predecibles: nombre del negocio, año actual, números consecutivos o la dirección del local.",
                            "Guárdalas en un gestor de contraseñas, nunca en papeles a la vista, chats o archivos sin proteger.",
                        ],
                        verificacion:
                            "Ninguna contraseña se repite entre cuentas y todas superan los 12 caracteres. Si alguien del equipo aún necesita anotar una clave en papel, falta resolver esa parte.",
                        riesgo:
                            "Las contraseñas reutilizadas son la causa de una enorme proporción de accesos no autorizados, y el ataque no deja rastros evidentes hasta que el daño está hecho.",
                        marco: "NIST SP 800-63B – Guía de autenticación digital",
                    },
                    {
                        id: "medio-f1-3",
                        texto:
                            "Confirma que exista al menos una copia de seguridad reciente de tu información crítica (clientes, inventario, facturación).",
                        detalle:
                            "Antes de avanzar en el resto del plan necesitas una red de seguridad: la garantía de que si algo falla hoy, la información esencial del negocio no se pierde.",
                        pasos: [
                            "Define cuál es tu información realmente crítica: base de clientes, inventario, facturación y contabilidad.",
                            "Verifica si ya existe una copia y de qué fecha es. Si tiene más de una semana, considérala desactualizada.",
                            "Si no existe o está vieja, crea una copia hoy mismo en un disco externo o en un servicio en la nube.",
                            "Asegúrate de que esa copia no quede conectada permanentemente al equipo: un ransomware cifra también los discos conectados.",
                        ],
                        verificacion:
                            "Tienes una copia con fecha de esta semana, sabes exactamente dónde está y pudiste abrir al menos un archivo desde ella para comprobar que es legible.",
                        riesgo:
                            "Sin un respaldo reciente y desconectado, un ransomware o una falla de hardware significa perder la información del negocio de forma definitiva.",
                        marco: "CIS Control 11 – Recuperación de datos",
                    },
                ],
            },
            {
                nombre: "Fortalecimiento",
                plazo: "1 – 3 meses",
                acciones: [
                    {
                        id: "medio-f2-1",
                        texto: "Instala antivirus/antimalware en todos los equipos y activa sus actualizaciones automáticas.",
                        detalle:
                            "Un antivirus desactualizado ofrece protección mínima, porque no reconoce las amenazas nuevas. La clave no es solo instalarlo, sino garantizar que se actualice solo, sin depender de que alguien lo recuerde.",
                        pasos: [
                            "Elige una solución reconocida e instálala en todos los equipos del negocio, incluidos los portátiles personales que se usen para trabajar.",
                            "Activa la protección en tiempo real y las actualizaciones automáticas de firmas.",
                            "Programa un análisis completo automático una vez por semana, en un horario que no interrumpa la operación.",
                            "Instala solo una solución por equipo: dos antivirus simultáneos entran en conflicto y bajan la protección.",
                        ],
                        verificacion:
                            "En cada equipo, el panel del antivirus muestra la protección activa y una fecha de actualización de hoy o de ayer. No debe haber equipos con avisos en rojo o licencias vencidas.",
                        riesgo:
                            "Sin protección actualizada, un solo archivo adjunto o una descarga infectada puede cifrar la información del negocio o robar credenciales bancarias.",
                        marco: "CIS Control 10 – Defensas contra malware",
                    },
                    {
                        id: "medio-f2-2",
                        texto: "Separa la red WiFi del negocio de la red que usan clientes o visitantes.",
                        detalle:
                            "Si clientes y equipos del negocio comparten la misma red, el teléfono infectado de un visitante puede alcanzar tus computadores y tu punto de venta. La separación de redes limita hasta dónde puede llegar un problema.",
                        pasos: [
                            "Entra a la configuración de tu router y busca la opción 'Red de invitados' o 'Guest network'.",
                            "Crea una red separada, con nombre y contraseña propios, solo para clientes y visitantes.",
                            "Verifica que el aislamiento de clientes esté activo, para que los dispositivos conectados no se vean entre sí.",
                            "Conecta los equipos del negocio (punto de venta, computadores administrativos) únicamente a la red principal, y cambia la contraseña de administrador del router.",
                        ],
                        verificacion:
                            "Conéctate con tu celular a la red de invitados e intenta acceder a un equipo o carpeta compartida del negocio. Si no lo alcanzas, la separación funciona.",
                        riesgo:
                            "En una red plana, un solo dispositivo comprometido puede espiar el tráfico o propagar malware a la caja y a los equipos administrativos.",
                        marco: "CIS Control 12 – Gestión de infraestructura de red",
                    },
                    {
                        id: "medio-f2-3",
                        texto: "Activa las actualizaciones automáticas del sistema operativo y de las aplicaciones que usas.",
                        detalle:
                            "Una gran parte de los ataques exitosos aprovecha fallas ya conocidas y corregidas por el fabricante, pero que la víctima nunca instaló. Automatizar las actualizaciones cierra esa puerta sin esfuerzo continuo.",
                        pasos: [
                            "En cada equipo, entra a la configuración de actualizaciones del sistema operativo y activa la instalación automática.",
                            "Haz lo mismo en el navegador y en las aplicaciones críticas: punto de venta, contabilidad, lector de PDF.",
                            "Define un horario de reinicio para que las actualizaciones se apliquen de verdad; muchas quedan pendientes hasta reiniciar.",
                            "Revisa que ningún equipo use una versión del sistema operativo que ya perdió el soporte del fabricante.",
                        ],
                        verificacion:
                            "En cada equipo, la pantalla de actualizaciones dice que el sistema está al día y que la instalación automática está activada, sin reinicios pendientes acumulados.",
                        riesgo:
                            "Las vulnerabilidades conocidas y sin parchear son uno de los vectores de intrusión más explotados, porque las herramientas de ataque son públicas y automatizadas.",
                        marco: "CIS Control 7 – Gestión continua de vulnerabilidades",
                    },
                    {
                        id: "medio-f2-4",
                        texto: "Realiza al menos una capacitación con tu equipo sobre cómo identificar correos o mensajes de phishing.",
                        detalle:
                            "El phishing sigue siendo la puerta de entrada más común: un mensaje que imita a un banco, un proveedor o incluso a ti mismo para conseguir contraseñas o pagos. Una sesión práctica corta reduce notablemente el riesgo.",
                        pasos: [
                            "Reúne tres o cuatro ejemplos reales de correos y mensajes fraudulentos; hay bancos y entidades públicas que los publican gratuitamente.",
                            "Muéstralos al equipo y señala las señales que los delatan: urgencia excesiva, errores de redacción, remitente parecido pero no idéntico, enlaces que no coinciden con el sitio oficial.",
                            "Enseña a verificar un enlace antes de hacer clic, pasando el cursor por encima para ver la dirección real.",
                            "Establece una regla simple y una excepción crítica: ante la duda no se hace clic, y ninguna solicitud de pago o cambio de cuenta se aprueba sin confirmarla por otro canal, como una llamada telefónica.",
                        ],
                        verificacion:
                            "Muestra al equipo un ejemplo nuevo que no vieron en la sesión. Si identifican las señales sospechosas y saben a quién reportar, la capacitación funcionó.",
                        riesgo:
                            "Un solo clic en un enlace fraudulento puede entregar las credenciales del correo o de la banca, o instalar ransomware en toda la red.",
                        marco: "CIS Control 14 – Concientización y formación / NIST CSF (Detectar)",
                    },
                    {
                        id: "medio-f2-5",
                        texto:
                            "Elabora el inventario de datos personales de tus clientes y la autorización de tratamiento exigida por la Ley 1581 de 2012.",
                        detalle:
                            "En Colombia, manejar datos de clientes (nombre, cédula, teléfono, dirección) exige autorización previa e informada. Además de ser una obligación legal, saber qué datos tienes y dónde están es la base para poder protegerlos.",
                        pasos: [
                            "Lista qué datos personales recolectas, con qué finalidad, dónde los guardas y quién tiene acceso a ellos.",
                            "Redacta una autorización de tratamiento breve y clara, indicando la finalidad y los derechos del titular; la Superintendencia de Industria y Comercio publica guías y modelos de referencia.",
                            "Elabora también tu política de tratamiento de datos y hazla visible para los clientes.",
                            "Empieza a solicitar la autorización a los clientes nuevos y define un plan para los existentes. Elimina los datos que ya no necesitas: lo que no guardas no se puede filtrar.",
                        ],
                        verificacion:
                            "Tienes el inventario escrito, el texto de autorización en uso con clientes nuevos y la política de tratamiento publicada o disponible cuando un cliente la pida.",
                        riesgo:
                            "El incumplimiento expone al negocio a sanciones económicas de la Superintendencia de Industria y Comercio, además del daño reputacional ante una filtración.",
                        marco: "Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia)",
                    },
                ],
            },
            {
                nombre: "Consolidación",
                plazo: "3 – 6 meses",
                acciones: [
                    {
                        id: "medio-f3-1",
                        texto:
                            "Redacta un protocolo básico de respuesta a incidentes: a quién avisar, cómo aislar un equipo comprometido y cómo restaurar backups.",
                        detalle:
                            "En medio de un incidente real no hay tiempo ni calma para improvisar. Un protocolo escrito de una página reduce el tiempo de reacción, que es justamente lo que determina el tamaño del daño.",
                        pasos: [
                            "Define quién es la persona responsable de coordinar la respuesta y quién la reemplaza si no está disponible.",
                            "Escribe los pasos inmediatos: desconectar el equipo de la red sin apagarlo, avisar al responsable y no borrar ni 'limpiar' nada.",
                            "Anota el procedimiento para restaurar desde el respaldo, y los teléfonos del banco, del soporte técnico y de los proveedores críticos.",
                            "Incluye qué hacer si se filtran datos de clientes: en Colombia, un incidente de esta naturaleza debe reportarse a la Superintendencia de Industria y Comercio.",
                        ],
                        verificacion:
                            "El protocolo cabe en una página, está impreso o accesible sin depender de los equipos afectados, y cualquier persona del equipo sabe cuál es el primer paso y a quién llamar.",
                        riesgo:
                            "Sin protocolo, las primeras horas se pierden en improvisación; apagar el equipo o borrar archivos por pánico puede destruir evidencia y agravar la pérdida.",
                        marco: "NIST CSF 2.0 – Función Responder / ISO 27001 Anexo A.5.24-5.28",
                    },
                    {
                        id: "medio-f3-2",
                        texto: "Define un presupuesto mensual mínimo para herramientas de seguridad digital.",
                        detalle:
                            "La seguridad requiere inversión continua, aunque sea modesta: respaldos en la nube, antivirus, gestor de contraseñas. Sin un rubro asignado, estas herramientas se cancelan en el primer recorte y las mejoras se pierden.",
                        pasos: [
                            "Suma el costo real de las herramientas que ya usas o quieres adoptar, en su versión anual si ofrece descuento.",
                            "Asigna ese monto como gasto fijo mensual dentro del presupuesto del negocio, igual que los servicios públicos.",
                            "Prioriza en este orden: respaldos, antivirus y gestor de contraseñas. Es el mayor retorno por peso invertido.",
                            "Revisa el rubro cada trimestre, junto con tu calendario de revisiones de seguridad.",
                        ],
                        verificacion:
                            "El rubro de seguridad aparece explícito en el presupuesto del negocio y las herramientas contratadas están pagadas y activas, sin licencias vencidas.",
                        riesgo:
                            "Sin presupuesto, las medidas implementadas caducan sin aviso y el negocio vuelve al nivel de riesgo anterior sin que nadie lo note.",
                        marco: "ISO/IEC 27001:2022 – Cláusula 7.1 (Recursos)",
                    },
                    {
                        id: "medio-f3-3",
                        texto: "Repite el diagnóstico para medir tu avance y ajustar el plan según los resultados.",
                        detalle:
                            "Este plan fue diseñado para cerrar brechas concretas. Repetir el diagnóstico confirma de forma objetiva si realmente se cerraron o si alguna sigue abierta.",
                        pasos: [
                            "Agenda repetir el diagnóstico entre ocho y doce semanas después de haber iniciado este plan.",
                            "Responde según lo que está funcionando hoy en la práctica, no según lo que quedó planeado.",
                            "Compara los resultados con el diagnóstico anterior en la sección 'Mi evolución'.",
                            "Si subes al nivel bajo, revisa el nuevo plan de mantenimiento; si sigues en medio, identifica qué tareas quedaron pendientes.",
                        ],
                        verificacion:
                            "Completaste un diagnóstico nuevo y puedes comparar ambos puntajes. Sabes con claridad qué brecha se cerró y cuál sigue abierta.",
                        riesgo:
                            "Sin medir, es fácil asumir que el negocio está protegido cuando en realidad varias tareas quedaron a medias.",
                        marco: "NIST CSF 2.0 – Función Gobernar (mejora continua)",
                    },
                ],
            },
        ],
        marcos: ["CIS Controls v8 (IG1)", "NIST CSF 2.0", "NIST SP 800-63B", "Ley 1581 de 2012", "Ley 1273 de 2009"],
    },
    alto: {
        nivel: "alto",
        titulo: "Plan de emergencia y recuperación",
        emoji: "🚨",
        color: "#D62828",
        bg: "#fee2e2",
        resumen:
            "Tu negocio está altamente expuesto a un ciberataque. Actuar en los próximos días puede evitar la pérdida total de tu información o la interrupción completa del negocio.",
        fases: [
            {
                nombre: "Emergencia",
                plazo: "0 – 15 días",
                acciones: [
                    {
                        id: "alto-f1-1",
                        texto:
                            "Haz HOY una copia de seguridad completa de tu información crítica en un medio externo o en la nube, separado de la red principal.",
                        detalle:
                            "Este es el paso más urgente de todo el plan. Si ocurre un ransomware o un robo de equipos, esta copia es lo único que puede evitar la pérdida definitiva de la información del negocio.",
                        pasos: [
                            "Identifica de inmediato la información que no puedes permitirte perder: clientes, inventario, facturación y contabilidad.",
                            "Cópiala hoy mismo a un disco externo o a un servicio en la nube.",
                            "Desconecta el disco externo al terminar. Un medio conectado de forma permanente también sería cifrado por un ransomware.",
                            "Guarda ese medio en una ubicación física distinta al local del negocio, para cubrir también robo, incendio o inundación.",
                        ],
                        verificacion:
                            "La copia terminó sin errores, pudiste abrir varios archivos desde ella para comprobar que son legibles, y el medio quedó desconectado y guardado fuera del local.",
                        riesgo:
                            "Sin esta copia, un solo incidente puede significar perder la base de clientes y la contabilidad completa, una situación de la que muchos negocios pequeños no se recuperan.",
                        marco: "CIS Control 11 – Recuperación de datos",
                    },
                    {
                        id: "alto-f1-2",
                        texto: "Activa la verificación en dos pasos (2FA) en absolutamente todas las cuentas del negocio.",
                        detalle:
                            "Sin 2FA, cualquier contraseña filtrada o adivinada da acceso inmediato. Al estar en riesgo alto, hay que asumir que alguna contraseña del negocio ya podría estar comprometida.",
                        pasos: [
                            "Lista todas las cuentas del negocio: correo, banca, redes sociales, punto de venta, plataformas de proveedores.",
                            "Empieza por el correo principal: es la llave maestra, porque desde ahí se recuperan las demás cuentas.",
                            "Activa el 2FA en cada una, prefiriendo una aplicación autenticadora sobre los códigos por SMS.",
                            "Guarda los códigos de respaldo impresos en un lugar seguro, no solo dentro del celular.",
                        ],
                        verificacion:
                            "Recorre la lista y confirma cuenta por cuenta que al iniciar sesión se solicita el segundo factor. No debe quedar ninguna cuenta crítica sin 2FA.",
                        riesgo:
                            "Con el correo comprometido y sin 2FA, un atacante puede tomar control de todas las cuentas del negocio en minutos y bloquearte el acceso.",
                        marco: "CIS Control 6 – Gestión de control de acceso",
                    },
                    {
                        id: "alto-f1-3",
                        texto:
                            "Cambia todas las contraseñas del negocio, en especial las compartidas entre empleados o reutilizadas en varias cuentas.",
                        detalle:
                            "Un resultado de riesgo alto suele significar que hay claves débiles, repetidas o conocidas por demasiadas personas. Un cambio general corta cualquier acceso no autorizado que ya estuviera ocurriendo.",
                        pasos: [
                            "Lista todas las cuentas críticas y cambia cada contraseña por una única de 12 caracteres o más.",
                            "Empieza por el correo y la banca en línea, en ese orden.",
                            "Comunica las nuevas credenciales solo en persona o por un canal seguro, nunca por WhatsApp ni correo sin cifrar.",
                            "Cierra todas las sesiones activas en cada servicio, para expulsar a cualquier intruso que ya estuviera conectado.",
                        ],
                        verificacion:
                            "Ninguna contraseña se repite entre cuentas, todas superan los 12 caracteres y cerraste las sesiones abiertas en los servicios críticos.",
                        riesgo:
                            "Si alguien ya tiene acceso indebido, mantener las mismas contraseñas le permite seguir operando sin ser detectado, incluso durante meses.",
                        marco: "CIS Control 5 – Gestión de cuentas / NIST SP 800-63B",
                    },
                    {
                        id: "alto-f1-4",
                        texto:
                            "Instala un antivirus/antimalware confiable en todos los dispositivos, aunque sea una versión gratuita mientras defines presupuesto.",
                        detalle:
                            "No tener protección activa es la situación de mayor exposición posible. Una solución gratuita instalada hoy protege mucho más que la solución ideal que llegaría en tres meses.",
                        pasos: [
                            "Instala hoy una solución reconocida en todos los equipos, incluidos los portátiles personales usados para trabajar.",
                            "Ejecuta un análisis completo inmediato en cada equipo y atiende cualquier detección antes de seguir.",
                            "Activa la protección en tiempo real y las actualizaciones automáticas.",
                            "Si el análisis encuentra algo grave, aísla ese equipo de la red antes de continuar con el resto del plan.",
                        ],
                        verificacion:
                            "Todos los equipos completaron un análisis inicial, muestran protección activa y firmas actualizadas al día de hoy.",
                        riesgo:
                            "Un equipo sin protección puede tener ya un programa espía registrando contraseñas bancarias sin ninguna señal visible para el usuario.",
                        marco: "CIS Control 10 – Defensas contra malware",
                    },
                    {
                        id: "alto-f1-5",
                        texto:
                            "Si sospechas que ya hubo un incidente (virus, acceso no autorizado, mensajes extraños enviados desde tus cuentas), desconecta el equipo afectado de internet y busca asesoría técnica especializada de inmediato.",
                        detalle:
                            "Si hay señales de un ataque en curso, cada minuto importa. Aislar el equipo detiene la propagación y preserva la evidencia mientras consigues ayuda profesional.",
                        pasos: [
                            "Desconecta el cable de red o apaga el WiFi del equipo afectado, pero no lo apagues si puedes evitarlo: apagarlo borra evidencia de la memoria.",
                            "No intentes repararlo por tu cuenta si no tienes experiencia técnica, y no borres archivos ni formatees.",
                            "Cambia las contraseñas críticas desde un equipo distinto y limpio, no desde el comprometido.",
                            "Contacta a un técnico o proveedor de ciberseguridad de confianza y, si hubo fraude financiero o datos de clientes afectados, notifícalo al banco y a las autoridades competentes.",
                        ],
                        verificacion:
                            "El equipo sospechoso está aislado de la red, las contraseñas críticas se cambiaron desde otro dispositivo y ya contactaste a alguien con capacidad técnica para revisarlo.",
                        riesgo:
                            "Un incidente activo sin contener se propaga al resto de la red, cifra los respaldos conectados y multiplica el costo de la recuperación.",
                        marco: "NIST CSF 2.0 – Función Responder / Ley 1273 de 2009 (Colombia)",
                    },
                ],
            },
            {
                nombre: "Estabilización",
                plazo: "1 – 3 meses",
                acciones: [
                    {
                        id: "alto-f2-1",
                        texto: "Separa la red WiFi del negocio de la que usan tus clientes o visitantes.",
                        detalle:
                            "Mientras clientes y equipos del negocio compartan la misma red, cualquier dispositivo ajeno infectado es un riesgo directo para tus computadores y tu punto de venta.",
                        pasos: [
                            "Entra a la configuración del router y activa la red de invitados.",
                            "Crea esa red con nombre y contraseña propios, solo para clientes y visitantes.",
                            "Activa el aislamiento de clientes para que los dispositivos conectados no puedan verse entre sí.",
                            "Cambia la contraseña de administrador del router, que en riesgo alto suele seguir siendo la de fábrica.",
                        ],
                        verificacion:
                            "Desde la red de invitados no logras alcanzar ningún equipo del negocio, y el acceso a la configuración del router ya no usa la contraseña por defecto.",
                        riesgo:
                            "Con una red compartida y un router con clave de fábrica, un atacante puede interceptar el tráfico del negocio o llegar directamente al punto de venta.",
                        marco: "CIS Control 12 – Gestión de infraestructura de red",
                    },
                    {
                        id: "alto-f2-2",
                        texto:
                            "Actualiza los sistemas operativos y aplicaciones desactualizadas; elimina software que ya no tiene soporte del fabricante.",
                        detalle:
                            "El software sin soporte ya no recibe parches, así que cualquier falla descubierta queda abierta de forma permanente. Es una de las causas más frecuentes de brechas graves en negocios pequeños.",
                        pasos: [
                            "Revisa en cada equipo qué sistema operativo usa y cuándo se actualizó por última vez.",
                            "Aplica todas las actualizaciones pendientes y reinicia para que se instalen de verdad.",
                            "Identifica el software que ya perdió soporte del fabricante y planifica su reemplazo con fecha concreta.",
                            "Desinstala programas que nadie usa: cada aplicación innecesaria amplía la superficie de ataque.",
                        ],
                        verificacion:
                            "Ningún equipo muestra actualizaciones pendientes ni versiones fuera de soporte, y las actualizaciones automáticas quedaron activadas.",
                        riesgo:
                            "Las herramientas para explotar vulnerabilidades conocidas son públicas y automatizadas: un equipo sin parchear puede ser comprometido sin que nadie haga clic en nada.",
                        marco: "CIS Control 7 – Gestión continua de vulnerabilidades",
                    },
                    {
                        id: "alto-f2-3",
                        texto: "Capacita con urgencia a tu personal en phishing, contraseñas seguras y manejo básico de incidentes.",
                        detalle:
                            "Si el negocio llegó a riesgo alto, es probable que el equipo nunca haya recibido formación en seguridad. Es una de las medidas más urgentes y económicas que puedes tomar.",
                        pasos: [
                            "Agenda una sesión de 40 a 60 minutos dentro de la próxima semana, con todo el equipo.",
                            "Cubre tres temas: reconocer phishing, crear y guardar contraseñas seguras, y qué hacer ante algo sospechoso.",
                            "Usa ejemplos reales de mensajes fraudulentos y muestra cómo verificar un enlace antes de hacer clic.",
                            "Deja por escrito un resumen de una página con las reglas clave y el contacto para reportar incidentes.",
                        ],
                        verificacion:
                            "Todo el equipo asistió, cada persona tiene el resumen de una página y sabe a quién reportar un mensaje sospechoso sin miedo a ser sancionada.",
                        riesgo:
                            "Sin formación, el phishing y la ingeniería social siguen siendo la vía de entrada más probable, y ninguna herramienta técnica compensa del todo ese hueco.",
                        marco: "CIS Control 14 – Concientización y formación en seguridad",
                    },
                    {
                        id: "alto-f2-4",
                        texto:
                            "Elabora el inventario de datos personales y la autorización de tratamiento exigida por la Ley 1581 de 2012, para evitar sanciones de la Superintendencia de Industria y Comercio.",
                        detalle:
                            "Además del riesgo técnico, un negocio en riesgo alto suele tener un vacío legal en el manejo de datos de clientes. Saber qué datos tienes y dónde están es también el primer paso para poder protegerlos.",
                        pasos: [
                            "Lista qué datos personales de clientes manejas, con qué finalidad, en qué formato y dónde se almacenan.",
                            "Redacta la autorización de tratamiento y la política de tratamiento de datos, usando como base las guías de la Superintendencia de Industria y Comercio.",
                            "Empieza a solicitar la autorización a todos los clientes nuevos.",
                            "Elimina de forma segura los datos que ya no necesitas: la información que no conservas no puede filtrarse.",
                        ],
                        verificacion:
                            "El inventario está escrito, la autorización se está aplicando con clientes nuevos y ya depuraste los datos innecesarios.",
                        riesgo:
                            "El incumplimiento puede derivar en sanciones económicas y, ante una filtración, el daño legal y reputacional se suma a la pérdida técnica.",
                        marco: "Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia)",
                    },
                    {
                        id: "alto-f2-5",
                        texto: "Documenta un protocolo de respuesta a incidentes, aunque sea muy básico.",
                        detalle:
                            "Un protocolo simple reduce el caos y el tiempo de reacción si el problema se repite, incluso mientras terminas de estabilizar el resto del plan.",
                        pasos: [
                            "Define quién coordina la respuesta y quién lo reemplaza si no está disponible.",
                            "Escribe entre tres y cinco pasos básicos: aislar el equipo, avisar al responsable, no borrar nada, restaurar desde el respaldo.",
                            "Incluye los teléfonos del banco, del soporte técnico y de los proveedores críticos.",
                            "Imprímelo y déjalo accesible: durante un incidente los equipos pueden estar inutilizables.",
                        ],
                        verificacion:
                            "El protocolo está impreso y a la vista, y cualquier persona del equipo puede decirte cuál es el primer paso y a quién llamar.",
                        riesgo:
                            "Sin protocolo, las decisiones apresuradas durante un incidente (apagar equipos, borrar archivos, pagar un rescate) suelen empeorar el resultado.",
                        marco: "NIST CSF 2.0 – Función Responder",
                    },
                ],
            },
            {
                nombre: "Reconstrucción",
                plazo: "3 – 6 meses",
                acciones: [
                    {
                        id: "alto-f3-1",
                        texto: "Destina un presupuesto fijo mensual, por pequeño que sea, a seguridad digital.",
                        detalle:
                            "Salir del riesgo alto y mantenerse fuera requiere inversión sostenida, no solo un esfuerzo puntual de emergencia. Un rubro fijo evita que las medidas tomadas ahora se abandonen en unos meses.",
                        pasos: [
                            "Calcula el costo mínimo de mantener respaldos, antivirus y gestor de contraseñas activos.",
                            "Asigna ese monto como gasto fijo mensual del negocio, con la misma prioridad que un servicio público.",
                            "Prioriza en este orden: respaldos, antivirus, gestor de contraseñas y capacitación.",
                            "Revisa el rubro cada trimestre y ajústalo si el negocio crece o cambian tus herramientas.",
                        ],
                        verificacion:
                            "El rubro aparece explícito en el presupuesto, las herramientas están pagadas y activas, y no hay licencias vencidas ni servicios suspendidos.",
                        riesgo:
                            "Sin presupuesto, el negocio repite el ciclo: invierte durante la emergencia, lo abandona por costos y vuelve al riesgo alto en pocos meses.",
                        marco: "ISO/IEC 27001:2022 – Cláusula 7.1 (Recursos)",
                    },
                    {
                        id: "alto-f3-2",
                        texto:
                            "Automatiza tus copias de seguridad siguiendo la regla 3-2-1 (3 copias, 2 medios distintos, 1 fuera del sitio).",
                        detalle:
                            "Una sola copia manual no es sostenible: depende de que alguien se acuerde. La regla 3-2-1 es el estándar recomendado para que siempre exista una copia recuperable, pase lo que pase.",
                        pasos: [
                            "Configura respaldos automáticos con la frecuencia que tu negocio necesite: diaria si la información cambia a diario.",
                            "Mantén copias en al menos dos medios distintos, por ejemplo un disco externo y un servicio en la nube.",
                            "Asegura que al menos una copia esté fuera del local, para cubrir robo, incendio o inundación.",
                            "Conserva alguna copia desconectada o inmutable: es la única defensa real contra un ransomware que busca cifrar también los respaldos.",
                        ],
                        verificacion:
                            "Los respaldos corren solos sin intervención manual, existen en dos medios con una copia fuera del sitio, y probaste restaurar un archivo con éxito en el último mes.",
                        riesgo:
                            "Con una única copia, cualquier falla simultánea (o un ransomware que alcance el disco conectado) deja al negocio sin ninguna vía de recuperación.",
                        marco: "CIS Control 11 – Recuperación de datos",
                    },
                    {
                        id: "alto-f3-3",
                        texto: "Repite el diagnóstico cada mes hasta salir del rango de riesgo alto; luego hazlo cada trimestre.",
                        detalle:
                            "El seguimiento frecuente es la única forma de confirmar que las medidas de emergencia están funcionando y de detectar rápido si algo se descuidó.",
                        pasos: [
                            "Agenda un recordatorio mensual para repetir el diagnóstico mientras sigas en riesgo alto.",
                            "Responde según lo que funciona hoy en la práctica, no según lo que quedó planeado.",
                            "Revisa en 'Mi evolución' si el puntaje mejora mes a mes.",
                            "Cuando salgas del rango alto, cambia la frecuencia a trimestral y sigue el plan del nivel que te corresponda.",
                        ],
                        verificacion:
                            "Tienes al menos dos diagnósticos consecutivos para comparar y el recordatorio mensual está agendado.",
                        riesgo:
                            "Sin medición frecuente, el negocio puede creerse recuperado mientras varias tareas críticas quedaron a medio implementar.",
                        marco: "NIST CSF 2.0 – Función Gobernar (mejora continua)",
                    },
                    {
                        id: "alto-f3-4",
                        texto: "Evalúa contratar una asesoría externa puntual en ciberseguridad para pymes.",
                        detalle:
                            "Un resultado de riesgo alto puede esconder problemas estructurales que una autoevaluación no alcanza a detectar. Una revisión profesional puntual, sin contrato permanente, suele ser accesible y muy rentable.",
                        pasos: [
                            "Busca dos o tres consultores o empresas con experiencia específica en pequeñas empresas.",
                            "Pide cotización por una revisión puntual con informe de hallazgos, no necesariamente un contrato continuo.",
                            "Comparte con ellos este plan y tus diagnósticos, para que partan de lo que ya avanzaste.",
                            "Usa su informe para priorizar las acciones que quedaron fuera del alcance de este plan.",
                        ],
                        verificacion:
                            "Tienes al menos una cotización concreta y, si la contrataste, un informe escrito con hallazgos y recomendaciones priorizadas.",
                        riesgo:
                            "Algunas exposiciones (configuraciones del servidor, la web del negocio, el punto de venta) requieren conocimiento técnico especializado para ser detectadas.",
                        marco: "NIST CSF 2.0 – Función Identificar",
                    },
                ],
            },
        ],
        marcos: [
            "CIS Controls v8 (IG1)",
            "NIST CSF 2.0",
            "NIST SP 800-63B",
            "Ley 1273 de 2009",
            "Ley 1581 de 2012",
            "CONPES 3854 de 2016",
        ],
    },
}

// ── Recomendaciones puntuales por categoría del diagnóstico ────────────────
const CATEGORIAS: Record<
    string,
    {
        categoria: string
        icono: string
        marco: string
        no: string
        parcial: string
    }
> = {
    antivirus: {
        categoria: "Protección básica",
        icono: "🛡️",
        marco: "CIS Control 10 – Defensas contra malware",
        no: "Instala una solución antivirus/antimalware en todos los dispositivos del negocio y activa sus actualizaciones automáticas.",
        parcial: "Revisa que el antivirus esté actualizado en todos los equipos, no solo en algunos.",
    },
    backup: {
        categoria: "Continuidad del negocio",
        icono: "💾",
        marco: "CIS Control 11 – Recuperación de datos / NIST CSF (Recuperar)",
        no: "Implementa copias de seguridad automáticas siguiendo la regla 3-2-1 y pruébalas periódicamente.",
        parcial: "Aumenta la frecuencia de tus copias de seguridad y verifica que realmente puedan restaurarse.",
    },
    contrasenas: {
        categoria: "Contraseñas",
        icono: "🔑",
        marco: "CIS Control 5 – Gestión de cuentas / NIST SP 800-63B",
        no: "Adopta contraseñas únicas de al menos 12 caracteres por cuenta y considera un gestor de contraseñas.",
        parcial: "Refuerza las contraseñas más débiles y evita reutilizarlas entre distintas cuentas.",
    },
    wifi: {
        categoria: "Seguridad de redes",
        icono: "📡",
        marco: "CIS Control 12 – Gestión de infraestructura de red",
        no: "Separa la red WiFi del negocio (caja, administración) de la red para clientes o visitantes.",
        parcial: "Confirma que la separación entre red del negocio y red de invitados esté bien configurada.",
    },
    dobleFA: {
        categoria: "Autenticación",
        icono: "📱",
        marco: "CIS Control 6 – Gestión de control de acceso",
        no: "Activa la verificación en dos pasos (2FA) en WhatsApp Business, correo y redes sociales del negocio.",
        parcial: "Activa el 2FA también en las cuentas que aún te falten, no solo en las principales.",
    },
    capacitacion: {
        categoria: "Formación",
        icono: "📚",
        marco: "CIS Control 14 – Concientización y formación en seguridad",
        no: "Programa al menos una capacitación anual en ciberseguridad para todo tu equipo.",
        parcial: "Refuerza la capacitación existente e inclúyela como parte del proceso de inducción de nuevo personal.",
    },
    actualizaciones: {
        categoria: "Actualizaciones",
        icono: "🔄",
        marco: "CIS Control 7 – Gestión continua de vulnerabilidades",
        no: "Activa las actualizaciones automáticas de sistemas operativos y aplicaciones, y retira el software sin soporte.",
        parcial: "Revisa qué equipos aún tienen actualizaciones pendientes y agenda su actualización.",
    },
    phishing: {
        categoria: "Conciencia digital",
        icono: "🎣",
        marco: "NIST CSF (Detectar) / Buenas prácticas CISA Cyber Essentials",
        no: "Aprende (y enseña a tu equipo) a verificar remitente, enlaces y adjuntos antes de interactuar con un mensaje.",
        parcial: "Practica con ejemplos reales de phishing para reconocerlo con más seguridad.",
    },
    plan: {
        categoria: "Plan de respuesta",
        icono: "📋",
        marco: "NIST CSF (Responder) / ISO/IEC 27001:2022 Anexo A.5.24-5.28",
        no: "Documenta un protocolo básico: a quién avisar, cómo aislar un equipo comprometido y cómo restaurar tus backups.",
        parcial: "Formaliza por escrito el protocolo que ya manejas de manera informal.",
    },
    datos: {
        categoria: "Cumplimiento legal",
        icono: "⚖️",
        marco: "Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia)",
        no: "Elabora un inventario de los datos personales que manejas y solicita autorización de tratamiento a tus clientes.",
        parcial: "Revisa que tu autorización de tratamiento de datos esté completa y actualizada.",
    },
    presupuesto: {
        categoria: "Inversión en seguridad",
        icono: "💰",
        marco: "ISO/IEC 27001:2022 – Cláusula 7.1 (Recursos)",
        no: "Destina un presupuesto mínimo mensual, aunque sea pequeño, a herramientas de seguridad digital.",
        parcial: "Evalúa si el presupuesto actual cubre backups, antivirus y capacitación de forma sostenida.",
    },
}

function getNivel(securityScore: number): NivelPlan {
    if (securityScore >= 75) return "bajo"
    if (securityScore >= 40) return "medio"
    return "alto"
}

function formatDate(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

// ── Persistencia local del progreso del checklist ──────────────────────────
// El progreso se guarda por nivel de plan y por id de diagnóstico, de modo
// que al repetir el diagnóstico y cambiar de nivel el checklist arranca
// limpio para el plan nuevo, sin perder el histórico del anterior.
function storageKey(nivel: NivelPlan, diagnosticoId: number) {
    return `plan_accion_progreso_${nivel}_${diagnosticoId}`
}

function loadProgreso(nivel: NivelPlan, diagnosticoId: number): Set<string> {
    try {
        const raw = localStorage.getItem(storageKey(nivel, diagnosticoId))
        if (!raw) return new Set()
        const arr = JSON.parse(raw)
        return new Set(Array.isArray(arr) ? (arr as string[]) : [])
    } catch {
        return new Set()
    }
}

function saveProgreso(nivel: NivelPlan, diagnosticoId: number, completados: Set<string>) {
    try {
        localStorage.setItem(storageKey(nivel, diagnosticoId), JSON.stringify(Array.from(completados)))
    } catch {
        // Si el almacenamiento local no está disponible, el progreso simplemente no persiste
    }
}

export default function PlanAccionView() {
    const navigate = useNavigate()
    const [diagnostico, setDiagnostico] = useState<DiagnosticoRow | null>(null)
    const [tieneDiagnosticos, setTieneDiagnosticos] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [completados, setCompletados] = useState<Set<string>>(new Set())
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

    useEffect(() => {
        const token = getUserToken()
        if (!token || !isLoggedIn()) {
            navigate("/auth/login", { replace: true })
            return
        }

        let cancelled = false
        ;(async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${API_BASE}/api/diagnostics`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (res.status === 401 || res.status === 403) {
                    removeUserToken()
                    navigate("/auth/login", { replace: true })
                    return
                }

                if (!res.ok) {
                    if (!cancelled) setError("No se pudo cargar tu diagnóstico para generar el plan de acción.")
                    return
                }

                const data = await res.json()
                const lista: DiagnosticoRow[] = Array.isArray(data.diagnostics) ? data.diagnostics : []
                if (!cancelled) {
                    if (lista.length === 0) {
                        setTieneDiagnosticos(false)
                    } else {
                        const ultimo = lista[lista.length - 1]
                        setDiagnostico(ultimo)
                        setCompletados(loadProgreso(getNivel(ultimo.securityScore), ultimo.id))
                    }
                }
            } catch {
                if (!cancelled) setError("Comprueba que el servidor esté en marcha.")
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [navigate])

    const handleLogout = () => {
        removeUserToken()
        navigate("/pag/home", { replace: true })
    }

    const nivel = diagnostico ? getNivel(diagnostico.securityScore) : null
    const plan = nivel ? PLANES[nivel] : null

    // Todas las acciones del plan en orden, para controlar el avance secuencial
    const accionesOrdenadas = useMemo(() => {
        if (!plan) return [] as AccionPlan[]
        return plan.fases.flatMap((fase) => fase.acciones)
    }, [plan])

    // Primera acción pendiente: es la única que se puede marcar
    const siguientePendiente = accionesOrdenadas.find((a) => !completados.has(a.id))?.id ?? null

    // Última acción completada: se permite desmarcarla para poder corregir
    const ultimaCompletada =
        accionesOrdenadas.filter((a) => completados.has(a.id)).slice(-1)[0]?.id ?? null

    const toggleAccion = (id: string) => {
        if (!diagnostico || !nivel) return

        const yaCompletada = completados.has(id)
        const puedeMarcar = id === siguientePendiente
        const puedeDesmarcar = yaCompletada && id === ultimaCompletada
        if (!puedeMarcar && !puedeDesmarcar) return

        setCompletados((prev) => {
            const next = new Set(prev)
            if (yaCompletada) next.delete(id)
            else next.add(id)
            saveProgreso(nivel, diagnostico.id, next)
            return next
        })
    }

    const toggleExpandido = (id: string) => {
        setExpandidos((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const reiniciarProgreso = () => {
        if (!diagnostico || !nivel) return
        const vacio = new Set<string>()
        setCompletados(vacio)
        saveProgreso(nivel, diagnostico.id, vacio)
    }

    // ── Estados de carga / error / sin diagnóstico ─────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
                <p className="text-[#444]">Generando tu plan de acción…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4] px-6">
                <p className="text-red-600 font-medium text-center">{error}</p>
            </div>
        )
    }

    if (!tieneDiagnosticos || !diagnostico || !plan || !nivel) {
        return (
            <div className="min-h-screen bg-[#F4EDE4] px-6 py-16">
                <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-10 text-center">
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🗺️</div>
                    <h1 className="text-2xl font-black text-[#2C2C2C] mb-3">Aún no tienes un plan de acción</h1>
                    <p className="text-[#555] mb-8 leading-relaxed">
                        Tu plan de acción se genera a partir de los resultados de tu diagnóstico de ciberseguridad.
                        Complétalo con tu sesión iniciada para recibir un plan personalizado según tu nivel de riesgo.
                    </p>
                    <Link
                        to="/pag/diagnostico"
                        style={{
                            display: "inline-block",
                            background: "#C4622D",
                            color: "white",
                            textDecoration: "none",
                            padding: "0.9rem 2rem",
                            borderRadius: 100,
                            fontWeight: 700,
                        }}
                    >
                        🔍 Hacer el diagnóstico
                    </Link>
                </div>
            </div>
        )
    }

    // Acciones prioritarias personalizadas: primero las "no", luego las "parcial"
    const criticas = Object.entries(diagnostico.answers || {})
        .filter(([, v]) => v === "no")
        .map(([id]) => id)
        .filter((id) => CATEGORIAS[id])
    const parciales = Object.entries(diagnostico.answers || {})
        .filter(([, v]) => v === "parcial")
        .map(([id]) => id)
        .filter((id) => CATEGORIAS[id])

    const totalAcciones = accionesOrdenadas.length
    const totalCompletadas = accionesOrdenadas.filter((a) => completados.has(a.id)).length
    const porcentajeAvance = totalAcciones > 0 ? Math.round((totalCompletadas / totalAcciones) * 100) : 0
    const planTerminado = totalCompletadas === totalAcciones

    return (
        <div className="min-h-screen bg-[#F4EDE4]">
            {/* Header */}
            <section
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    padding: "3.5rem 4rem 3rem",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.75rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#f4a261",
                        marginBottom: "0.5rem",
                    }}
                >
                    // Mi plan de acción
                </p>
                <h1
                    style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                        fontWeight: 900,
                        color: "white",
                    }}
                >
                    {diagnostico.companyName
                        ? `Plan de acción para ${diagnostico.companyName}`
                        : "Tu plan de acción en ciberseguridad"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                    Basado en tu último diagnóstico del {formatDate(diagnostico.createdAt)}
                </p>
                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: "1.5rem",
                        background: "rgba(255,255,255,0.12)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 100,
                        padding: "0.45rem 1.1rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Cerrar sesión
                </button>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Resumen del nivel asignado */}
                <div
                    style={{
                        background: "white",
                        borderRadius: 24,
                        padding: "2.5rem 2rem",
                        textAlign: "center",
                        boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
                        marginBottom: "2rem",
                        border: `2px solid ${plan.color}30`,
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: plan.bg,
                            border: `1px solid ${plan.color}40`,
                            color: plan.color,
                            padding: "0.4rem 1.25rem",
                            borderRadius: 100,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            marginBottom: "1rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}
                    >
                        {plan.emoji} Plan de nivel {nivel}
                    </div>
                    <h2
                        style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: "1.6rem",
                            fontWeight: 900,
                            color: "#2C2C2C",
                            marginBottom: "0.75rem",
                        }}
                    >
                        {plan.titulo}
                    </h2>
                    <p style={{ color: "#555", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 1.5rem" }}>
                        {plan.resumen}
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: "#C4622D" }}>
                                {diagnostico.securityScore}%
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>Puntaje de seguridad</div>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: plan.color }}>
                                {diagnostico.riskScore}%
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>Puntaje de riesgo</div>
                        </div>
                    </div>
                </div>

                {/* Progreso del checklist */}
                <div
                    style={{
                        background: "white",
                        borderRadius: 20,
                        padding: "1.5rem 2rem",
                        marginBottom: "2rem",
                        border: "1px solid #e8ddd2",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", gap: "1rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, color: "#2C2C2C", fontSize: "0.9rem" }}>
                            Tu avance en el plan
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: plan.color, fontSize: "0.9rem" }}>
                            {totalCompletadas}/{totalAcciones} tareas · {porcentajeAvance}%
                        </span>
                    </div>
                    <div style={{ background: "#f1e9dd", borderRadius: 100, height: 10, overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${porcentajeAvance}%`,
                                background: plan.color,
                                height: "100%",
                                borderRadius: 100,
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#888", marginTop: "0.7rem", lineHeight: 1.6 }}>
                        Las tareas se completan <strong>una por una y en orden</strong>: cada casilla se desbloquea al
                        marcar la anterior. Abre "Ver detalle" en cada tarea para saber exactamente cómo hacerla, cómo
                        comprobar que quedó bien y qué riesgo corres si la dejas pendiente.
                    </p>
                    {totalCompletadas > 0 && (
                        <button
                            onClick={reiniciarProgreso}
                            style={{
                                marginTop: "0.9rem",
                                background: "none",
                                border: "1px solid #ddd0c0",
                                color: "#888",
                                borderRadius: 100,
                                padding: "0.35rem 0.9rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Reiniciar mi progreso
                        </button>
                    )}
                </div>

                {/* Aviso al completar todo el plan */}
                {planTerminado && (
                    <div
                        style={{
                            background: "#d1fae5",
                            border: "1px solid #6ee7b7",
                            borderRadius: 20,
                            padding: "1.5rem 2rem",
                            marginBottom: "2rem",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🎉</p>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 900, color: "#2D6A4F", marginBottom: "0.4rem" }}>
                            Completaste todas las tareas de tu plan
                        </h3>
                        <p style={{ color: "#3d6b55", fontSize: "0.85rem", lineHeight: 1.6 }}>
                            Repite el diagnóstico para confirmar tu nuevo nivel de riesgo y recibir el plan que
                            corresponda a partir de ahora.
                        </p>
                    </div>
                )}

                {/* Acciones prioritarias personalizadas */}
                {(criticas.length > 0 || parciales.length > 0) && (
                    <div
                        style={{
                            background: "white",
                            borderRadius: 20,
                            padding: "2rem",
                            marginBottom: "2rem",
                            border: "1px solid #e8ddd2",
                        }}
                    >
                        <h3
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: "1.25rem",
                                fontWeight: 900,
                                color: "#2C2C2C",
                                marginBottom: "1.25rem",
                            }}
                        >
                            🎯 Acciones prioritarias según tu diagnóstico
                        </h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {criticas.map((id) => {
                                const c = CATEGORIAS[id]
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            display: "flex",
                                            gap: "0.9rem",
                                            padding: "1rem 1.1rem",
                                            borderRadius: 14,
                                            background: "#fee2e2",
                                            border: "1px solid #fca5a5",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{c.icono}</span>
                                        <div>
                                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#D62828", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                {c.categoria} · Crítico
                                            </div>
                                            <p style={{ color: "#2C2C2C", fontSize: "0.88rem", margin: "0.3rem 0 0.4rem", lineHeight: 1.5 }}>
                                                {c.no}
                                            </p>
                                            <span style={{ fontSize: "0.72rem", color: "#888" }}>📖 {c.marco}</span>
                                        </div>
                                    </div>
                                )
                            })}
                            {parciales.map((id) => {
                                const c = CATEGORIAS[id]
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            display: "flex",
                                            gap: "0.9rem",
                                            padding: "1rem 1.1rem",
                                            borderRadius: 14,
                                            background: "#fef9c3",
                                            border: "1px solid #fde68a",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{c.icono}</span>
                                        <div>
                                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                {c.categoria} · Por reforzar
                                            </div>
                                            <p style={{ color: "#2C2C2C", fontSize: "0.88rem", margin: "0.3rem 0 0.4rem", lineHeight: 1.5 }}>
                                                {c.parcial}
                                            </p>
                                            <span style={{ fontSize: "0.72rem", color: "#888" }}>📖 {c.marco}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Fases del plan con checklist secuencial */}
                <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
                    {plan.fases.map((fase, idx) => {
                        const completadasFase = fase.acciones.filter((a) => completados.has(a.id)).length
                        const faseCompleta = completadasFase === fase.acciones.length
                        return (
                            <div
                                key={fase.nombre}
                                style={{
                                    background: "white",
                                    borderRadius: 20,
                                    padding: "1.75rem 2rem",
                                    border: `1px solid ${faseCompleta ? "#bfe3cf" : "#e8ddd2"}`,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                                    <span
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            background: faseCompleta ? "#2D6A4F" : plan.color,
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {faseCompleta ? "✓" : idx + 1}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 800, color: "#2C2C2C" }}>
                                            {fase.nombre}
                                        </h4>
                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: plan.color, fontWeight: 700 }}>
                                            {fase.plazo}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            color: faseCompleta ? "#2D6A4F" : "#888",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {completadasFase}/{fase.acciones.length}
                                    </span>
                                </div>

                                <div style={{ display: "grid", gap: "0.75rem" }}>
                                    {fase.acciones.map((accion) => {
                                        const hecha = completados.has(accion.id)
                                        const esSiguiente = accion.id === siguientePendiente
                                        const bloqueada = !hecha && !esSiguiente
                                        const abierta = expandidos.has(accion.id)
                                        const puedeTocar = esSiguiente || (hecha && accion.id === ultimaCompletada)

                                        return (
                                            <div
                                                key={accion.id}
                                                style={{
                                                    border: `1px solid ${
                                                        hecha ? "#bfe3cf" : esSiguiente ? plan.color + "55" : "#eee2d3"
                                                    }`,
                                                    background: hecha ? "#f4fbf7" : bloqueada ? "#fbfaf8" : "white",
                                                    borderRadius: 14,
                                                    padding: "0.9rem 1rem",
                                                    opacity: bloqueada ? 0.65 : 1,
                                                    boxShadow: esSiguiente ? `0 2px 12px ${plan.color}18` : "none",
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                                                    {/* Casilla de cumplimiento */}
                                                    <button
                                                        onClick={() => toggleAccion(accion.id)}
                                                        disabled={!puedeTocar}
                                                        title={
                                                            bloqueada
                                                                ? "Completa la tarea anterior para desbloquear esta"
                                                                : hecha
                                                                ? "Marcar como pendiente"
                                                                : "Marcar como cumplida"
                                                        }
                                                        style={{
                                                            width: 27,
                                                            height: 27,
                                                            borderRadius: 8,
                                                            border: `2px solid ${
                                                                hecha ? "#2D6A4F" : bloqueada ? "#d6cec2" : plan.color
                                                            }`,
                                                            background: hecha ? "#2D6A4F" : "white",
                                                            color: "white",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "0.8rem",
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                            cursor: puedeTocar ? "pointer" : "not-allowed",
                                                            marginTop: "0.1rem",
                                                        }}
                                                    >
                                                        {hecha ? "✓" : bloqueada ? "🔒" : ""}
                                                    </button>

                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        {/* Etiqueta de estado */}
                                                        {esSiguiente && (
                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    background: plan.bg,
                                                                    color: plan.color,
                                                                    fontSize: "0.65rem",
                                                                    fontWeight: 800,
                                                                    letterSpacing: "0.05em",
                                                                    textTransform: "uppercase",
                                                                    padding: "0.15rem 0.6rem",
                                                                    borderRadius: 100,
                                                                    marginBottom: "0.4rem",
                                                                }}
                                                            >
                                                                Tarea actual
                                                            </span>
                                                        )}
                                                        {hecha && (
                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    background: "#d1fae5",
                                                                    color: "#2D6A4F",
                                                                    fontSize: "0.65rem",
                                                                    fontWeight: 800,
                                                                    letterSpacing: "0.05em",
                                                                    textTransform: "uppercase",
                                                                    padding: "0.15rem 0.6rem",
                                                                    borderRadius: 100,
                                                                    marginBottom: "0.4rem",
                                                                }}
                                                            >
                                                                Cumplida
                                                            </span>
                                                        )}

                                                        <p
                                                            style={{
                                                                color: hecha ? "#4b7d63" : bloqueada ? "#8a8378" : "#2C2C2C",
                                                                fontSize: "0.88rem",
                                                                lineHeight: 1.55,
                                                                textDecoration: hecha ? "line-through" : "none",
                                                                margin: 0,
                                                            }}
                                                        >
                                                            {accion.texto}
                                                        </p>

                                                        {bloqueada && !abierta && (
                                                            <p style={{ fontSize: "0.72rem", color: "#a09789", marginTop: "0.35rem" }}>
                                                                🔒 Completa la tarea anterior para desbloquear esta.
                                                            </p>
                                                        )}

                                                        <button
                                                            onClick={() => toggleExpandido(accion.id)}
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                padding: 0,
                                                                marginTop: "0.5rem",
                                                                color: plan.color,
                                                                fontSize: "0.75rem",
                                                                fontWeight: 700,
                                                                cursor: "pointer",
                                                                fontFamily: "inherit",
                                                            }}
                                                        >
                                                            {abierta ? "▲ Ocultar detalle" : "▾ Ver detalle e instrucciones"}
                                                        </button>

                                                        {abierta && (
                                                            <div
                                                                style={{
                                                                    marginTop: "0.85rem",
                                                                    paddingTop: "0.85rem",
                                                                    borderTop: "1px dashed #e5ddd0",
                                                                    display: "grid",
                                                                    gap: "0.9rem",
                                                                }}
                                                            >
                                                                {/* Qué es y por qué importa */}
                                                                <div>
                                                                    <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2C2C2C", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
                                                                        ¿Qué es y por qué importa?
                                                                    </p>
                                                                    <p style={{ color: "#555", fontSize: "0.83rem", lineHeight: 1.65, margin: 0 }}>
                                                                        {accion.detalle}
                                                                    </p>
                                                                </div>

                                                                {/* Cómo hacerlo */}
                                                                <div>
                                                                    <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2C2C2C", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
                                                                        ¿Cómo hacerlo, paso a paso?
                                                                    </p>
                                                                    <ol style={{ display: "grid", gap: "0.4rem", paddingLeft: "1.2rem", margin: 0 }}>
                                                                        {accion.pasos.map((paso, i) => (
                                                                            <li key={i} style={{ color: "#555", fontSize: "0.82rem", lineHeight: 1.55 }}>
                                                                                {paso}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </div>

                                                                {/* Cómo verificar */}
                                                                <div
                                                                    style={{
                                                                        background: "#eef7f1",
                                                                        border: "1px solid #cfe8da",
                                                                        borderRadius: 12,
                                                                        padding: "0.75rem 0.9rem",
                                                                    }}
                                                                >
                                                                    <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2D6A4F", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.3rem" }}>
                                                                        ✅ Cómo saber que ya la cumpliste
                                                                    </p>
                                                                    <p style={{ color: "#3d6b55", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                                                                        {accion.verificacion}
                                                                    </p>
                                                                </div>

                                                                {/* Riesgo de no hacerlo */}
                                                                <div
                                                                    style={{
                                                                        background: "#fdf2f2",
                                                                        border: "1px solid #f4cccc",
                                                                        borderRadius: 12,
                                                                        padding: "0.75rem 0.9rem",
                                                                    }}
                                                                >
                                                                    <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b02525", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.3rem" }}>
                                                                        ⚠️ Riesgo si la dejas pendiente
                                                                    </p>
                                                                    <p style={{ color: "#8f2f2f", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                                                                        {accion.riesgo}
                                                                    </p>
                                                                </div>

                                                                {accion.marco && (
                                                                    <span style={{ fontSize: "0.7rem", color: "#999" }}>
                                                                        📖 Fundamento: {accion.marco}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Marcos de referencia */}
                <div
                    style={{
                        background: "#1a1a2e",
                        borderRadius: 20,
                        padding: "1.75rem 2rem",
                        marginBottom: "2rem",
                    }}
                >
                    <h4 style={{ color: "white", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.9rem" }}>
                        📖 Este plan está fundamentado en:
                    </h4>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        {plan.marcos.map((m) => (
                            <span
                                key={m}
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    color: "#f4a261",
                                    padding: "0.35rem 0.9rem",
                                    borderRadius: 100,
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    border: "1px solid rgba(244,162,97,0.3)",
                                }}
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CTA final */}
                <div
                    style={{
                        background: "#2D6A4F",
                        borderRadius: 20,
                        padding: "2.25rem 2rem",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.3rem", fontWeight: 900, color: "white", marginBottom: "0.6rem" }}>
                        ¿Ya aplicaste algunas acciones?
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                        Vuelve a hacer el diagnóstico para actualizar tu plan y ver tu evolución.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            onClick={() => navigate("/pag/diagnostico")}
                            style={{
                                background: "#E9C46A",
                                color: "#2C2C2C",
                                padding: "0.8rem 1.8rem",
                                borderRadius: 100,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            🔍 Repetir diagnóstico
                        </button>
                        <button
                            onClick={() => navigate("/pag/evolucion")}
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                                padding: "0.8rem 1.8rem",
                                borderRadius: 100,
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                border: "1px solid rgba(255,255,255,0.3)",
                                cursor: "pointer",
                            }}
                        >
                            📈 Ver mi evolución
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
