import { preguntas, type IdPregunta } from "./diagnosticQuestions"

export type DiagnosticAnswer = "si" | "parcial" | "no"
export type AnswerMap = Record<string, DiagnosticAnswer | undefined>

type Task = { titulo: string; pasos: string[]; marco: string }
type AnswerTasks = Record<DiagnosticAnswer, Task[]>

const task = (titulo: string, pasos: string[], marco: string): Task => ({ titulo, pasos, marco })

const recommendations: Record<IdPregunta, AnswerTasks> = {
    antivirus: {
        si: [task("Verifica mensualmente la protección de todos los dispositivos", ["Revisa la consola o cada equipo y registra los dispositivos comprobados.", "Corrige alertas o definiciones desactualizadas."], "ISO/IEC 27001:2022 A.8.7; CIS Controls v8, Control 10.")],
        parcial: [
            task("Completa la cobertura antimalware del inventario", ["Lista computadores y dispositivos usados para trabajar.", "Instala o habilita protección en cada equipo faltante."], "ISO/IEC 27001:2022 A.5.9 y A.8.7; CIS Controls v8, Controls 1 y 10."),
            task("Activa actualizaciones automáticas de la protección", ["Habilita actualizaciones automáticas.", "Comprueba mensualmente que no haya equipos atrasados."], "ISO/IEC 27001:2022 A.8.7; CIS Controls v8, Control 10."),
        ],
        no: [
            task("Identifica los dispositivos que requieren protección", ["Registra equipos, usuarios y tipo de información que manejan."], "ISO/IEC 27001:2022 A.5.9; CIS Controls v8, Control 1."),
            task("Instala protección antimalware en los equipos del negocio", ["Elige una solución compatible.", "Instálala en cada equipo y activa protección en tiempo real."], "ISO/IEC 27001:2022 A.8.7; CIS Controls v8, Control 10."),
            task("Activa actualizaciones y revisa las alertas", ["Configura actualizaciones automáticas.", "Asigna a una persona para revisar alertas semanalmente."], "ISO/IEC 27001:2022 A.8.7; CIS Controls v8, Control 10."),
        ],
    },
    backup: {
        si: [task("Prueba periódicamente la restauración de una copia", ["Restaura una muestra en una ubicación de prueba cada trimestre.", "Registra el resultado y corrige fallos."], "ISO/IEC 27001:2022 A.8.13; CIS Controls v8, Control 11.")],
        parcial: [
            task("Programa copias automáticas de la información crítica", ["Identifica los datos necesarios para operar.", "Configura respaldos regulares y comprueba que finalicen."], "ISO/IEC 27001:2022 A.8.13; CIS Controls v8, Control 11."),
            task("Protege las copias frente a borrado o ransomware", ["Mantén una copia desconectada o con acceso separado.", "Limita quién puede modificar o eliminar los respaldos."], "ISO/IEC 27001:2022 A.8.13; CIS Controls v8, Control 11."),
        ],
        no: [
            task("Define qué información debe respaldarse", ["Lista archivos, sistemas y bases de datos esenciales.", "Asigna una persona responsable."], "ISO/IEC 27001:2022 A.5.9 y A.8.13; CIS Controls v8, Control 11."),
            task("Configura copias automáticas y separadas", ["Programa respaldos regulares.", "Conserva una copia con acceso separado de los equipos de trabajo."], "ISO/IEC 27001:2022 A.8.13; CIS Controls v8, Control 11."),
            task("Realiza una restauración de prueba", ["Restaura un archivo en una ubicación de prueba.", "Ábrelo, verifica su integridad y anota el resultado."], "ISO/IEC 27001:2022 A.8.13; CIS Controls v8, Control 11."),
        ],
    },
    contrasenas: {
        si: [task("Revisa periódicamente cuentas y métodos de acceso", ["Revisa trimestralmente las cuentas de servicios del negocio.", "Retira las que no se usan y confirma que las claves no se reutilicen."], "ISO/IEC 27001:2022 A.5.16 y A.5.17; NIST SP 800-63B.")],
        parcial: [
            task("Cambia las contraseñas débiles o reutilizadas", ["Prioriza correo, banca, redes sociales y cuentas administrativas.", "Usa credenciales únicas para cada servicio."], "ISO/IEC 27001:2022 A.5.17; NIST SP 800-63B."),
            task("Centraliza credenciales en un gestor de contraseñas", ["Selecciona un gestor con controles de acceso y recuperación.", "Migra las cuentas críticas y limita accesos según funciones."], "ISO/IEC 27001:2022 A.5.17; CIS Controls v8, Control 5."),
        ],
        no: [
            task("Adopta contraseñas únicas para cada cuenta", ["Empieza por correo, banca y cuentas administrativas.", "Usa frases de contraseña largas y distintas."], "ISO/IEC 27001:2022 A.5.17; NIST SP 800-63B."),
            task("Implementa un gestor de contraseñas", ["Elige una herramienta con controles para el equipo.", "Guarda las cuentas prioritarias y protege el gestor con MFA."], "ISO/IEC 27001:2022 A.5.17; CIS Controls v8, Control 5."),
            task("Elimina credenciales compartidas", ["Identifica servicios donde varias personas usan la misma cuenta.", "Crea accesos individuales y cambia las claves compartidas."], "ISO/IEC 27001:2022 A.5.16 y A.5.18; CIS Controls v8, Control 6."),
        ],
    },
    wifi: {
        si: [task("Comprueba que la red de invitados siga aislada", ["Verifica trimestralmente que visitantes no alcancen equipos internos.", "Actualiza el firmware del router cuando haya correcciones."], "ISO/IEC 27001:2022 A.8.20 y A.8.22; CIS Controls v8, Control 12.")],
        parcial: [
            task("Completa la separación de la red de invitados", ["Revisa la configuración de invitados del router.", "Prueba que desde esa red no se acceda a equipos internos."], "ISO/IEC 27001:2022 A.8.22; CIS Controls v8, Control 12."),
            task("Refuerza el acceso administrativo al router", ["Cambia la clave administrativa predeterminada.", "Usa WPA2-AES o WPA3 si está disponible y actualiza el firmware."], "ISO/IEC 27001:2022 A.8.20 y A.8.21; CIS Controls v8, Control 12."),
        ],
        no: [
            task("Crea una red separada para clientes y visitantes", ["Activa la red de invitados o solicita una red separada.", "Usa una clave distinta de la red interna."], "ISO/IEC 27001:2022 A.8.22; CIS Controls v8, Control 12."),
            task("Protege la red interna con configuración segura", ["Cambia credenciales administrativas predeterminadas.", "Activa WPA2-AES o WPA3 con una clave única."], "ISO/IEC 27001:2022 A.8.20 y A.8.21; CIS Controls v8, Control 12."),
            task("Actualiza el router y verifica el aislamiento", ["Instala el firmware vigente del fabricante.", "Comprueba desde un dispositivo de invitado que no pueda ver equipos internos."], "ISO/IEC 27001:2022 A.8.8 y A.8.22; CIS Controls v8, Control 12."),
        ],
    },
    dobleFA: {
        si: [task("Verifica la recuperación segura de cuentas con MFA", ["Revisa trimestralmente teléfonos y métodos de recuperación.", "Guarda códigos de respaldo con acceso restringido."], "ISO/IEC 27001:2022 A.5.17 y A.8.5; NIST SP 800-63B.")],
        parcial: [
            task("Activa MFA en las cuentas críticas que faltan", ["Haz una lista de correo, banca y cuentas administrativas sin MFA.", "Actívalo y prueba el método de recuperación."], "ISO/IEC 27001:2022 A.8.5; CIS Controls v8, Control 6."),
            task("Protege métodos de recuperación y accesos", ["Guarda códigos de respaldo en un lugar restringido.", "Retira teléfonos o correos de recuperación fuera del control del negocio."], "ISO/IEC 27001:2022 A.5.16, A.5.17 y A.8.5."),
        ],
        no: [
            task("Activa MFA en correo y cuentas administrativas", ["Empieza por correo empresarial, banca y servicios administrativos.", "Sigue la guía oficial de cada proveedor."], "ISO/IEC 27001:2022 A.8.5; CIS Controls v8, Control 6."),
            task("Extiende MFA a las demás cuentas del negocio", ["Lista servicios digitales y redes sociales usados por la empresa.", "Activa MFA donde esté disponible y documenta excepciones."], "ISO/IEC 27001:2022 A.8.5; CIS Controls v8, Control 6."),
            task("Configura recuperación segura y guarda los códigos", ["Registra métodos controlados por la empresa.", "Guarda códigos protegidos y prueba el proceso de recuperación."], "ISO/IEC 27001:2022 A.5.17 y A.8.5; NIST SP 800-63B."),
        ],
    },
    capacitacion: {
        si: [task("Refuerza la capacitación con una práctica trimestral", ["Repasa un tema práctico como phishing o reporte de incidentes.", "Registra la fecha y comparte el canal de ayuda."], "ISO/IEC 27001:2022 A.6.3; CIS Controls v8, Control 14.")],
        parcial: [
            task("Completa los temas que aún no cubre la capacitación", ["Revisa phishing, contraseñas, MFA, datos y reporte de incidentes.", "Programa refuerzo de los temas ausentes."], "ISO/IEC 27001:2022 A.6.3; CIS Controls v8, Control 14."),
            task("Añade seguridad digital al proceso de inducción", ["Incluye las reglas básicas para personal nuevo.", "Confirma que conozca el canal de reporte."], "ISO/IEC 27001:2022 A.6.3."),
        ],
        no: [
            task("Programa capacitación básica para todo el equipo", ["Cubre contraseñas, MFA, manejo de datos, phishing y actualizaciones.", "Registra participantes y fecha."], "ISO/IEC 27001:2022 A.6.3; CIS Controls v8, Control 14."),
            task("Define reglas simples para manejar información", ["Documenta cómo compartir archivos y proteger dispositivos.", "Explícalas en lenguaje sencillo a todo el equipo."], "ISO/IEC 27001:2022 A.5.1 y A.6.3."),
            task("Establece un canal para reportar incidentes o dudas", ["Define a quién contactar y por qué medio.", "Indica que errores o clics sospechosos deben reportarse pronto."], "ISO/IEC 27001:2022 A.6.8; CIS Controls v8, Control 14."),
        ],
    },
    actualizaciones: {
        si: [task("Revisa actualizaciones y software sin soporte cada mes", ["Comprueba sistemas y aplicaciones de los equipos.", "Planifica reemplazar o aislar programas fuera de soporte."], "ISO/IEC 27001:2022 A.8.8; CIS Controls v8, Control 7.")],
        parcial: [
            task("Identifica equipos y aplicaciones con parches pendientes", ["Revisa notificaciones de actualización en los dispositivos.", "Anota los pendientes y fija fecha de instalación."], "ISO/IEC 27001:2022 A.8.8; CIS Controls v8, Control 7."),
            task("Prioriza correcciones críticas y activa actualizaciones automáticas", ["Instala primero actualizaciones críticas y de seguridad.", "Activa actualizaciones automáticas donde sea viable."], "ISO/IEC 27001:2022 A.8.8; CIS Controls v8, Control 7."),
        ],
        no: [
            task("Actualiza sistemas operativos y aplicaciones", ["Lista dispositivos y programas usados para trabajar.", "Instala las actualizaciones de seguridad disponibles."], "ISO/IEC 27001:2022 A.8.8; CIS Controls v8, Control 7."),
            task("Activa actualizaciones automáticas", ["Habilita actualizaciones automáticas de sistemas y aplicaciones.", "Comprueba mensualmente que se estén aplicando."], "ISO/IEC 27001:2022 A.8.8; CIS Controls v8, Control 7."),
            task("Retira o reemplaza software sin soporte", ["Identifica sistemas y aplicaciones fuera de soporte.", "Reemplázalos o limita su conexión hasta retirarlos."], "ISO/IEC 27001:2022 A.8.8; CIS Controls v8, Control 7."),
        ],
    },
    phishing: {
        si: [task("Practica el reporte de mensajes sospechosos", ["Realiza un ejercicio breve de identificación y reporte.", "Confirma que el equipo conozca el canal de aviso."], "ISO/IEC 27001:2022 A.6.3 y A.6.8; NIST CSF 2.0 PR.AT.")],
        parcial: [
            task("Verifica remitente, dominio, enlaces y solicitudes urgentes", ["Comprueba el dominio completo y confirma solicitudes inusuales por otro canal.", "No ingreses credenciales desde enlaces recibidos."], "ISO/IEC 27001:2022 A.6.3; NIST CSF 2.0 PR.AT."),
            task("Asegura un canal sencillo para reportar phishing", ["Define el correo o contacto al que se envían mensajes sospechosos.", "Explica qué hacer si alguien hizo clic o entregó datos."], "ISO/IEC 27001:2022 A.6.8; NIST CSF 2.0 RS.CO."),
        ],
        no: [
            task("Aprende señales comunes de phishing", ["Revisa ejemplos de remitentes falsificados y dominios parecidos.", "Confirma por otro canal solicitudes urgentes de pagos o contraseñas."], "ISO/IEC 27001:2022 A.6.3; NIST CSF 2.0 PR.AT."),
            task("Evita iniciar sesión desde enlaces recibidos", ["Accede escribiendo la dirección o usando un marcador confiable.", "No compartas contraseñas ni códigos MFA por mensajes."], "NIST CSF 2.0 PR.AA; CIS Controls v8, Control 6."),
            task("Establece cómo reportar mensajes o clics sospechosos", ["Define un contacto y canal para todo el personal.", "Indica que se debe avisar enseguida si se ingresaron datos."], "ISO/IEC 27001:2022 A.6.8; NIST CSF 2.0 RS.CO."),
        ],
    },
    plan: {
        si: [task("Ensaya el protocolo y actualiza los contactos", ["Realiza anualmente un ejercicio de mesa con un escenario sencillo.", "Actualiza responsables, teléfonos y pasos según lo aprendido."], "ISO/IEC 27001:2022 A.5.24 y A.5.26; NIST CSF 2.0 RS.MA.")],
        parcial: [
            task("Documenta responsables y primeros pasos de respuesta", ["Define quién coordina, contacta proveedores e informa a dirección.", "Describe cómo aislar un equipo y proteger evidencias."], "ISO/IEC 27001:2022 A.5.24 y A.5.26; NIST CSF 2.0 RS.MA."),
            task("Incluye recuperación y comunicación", ["Documenta cómo validar y restaurar respaldos.", "Anota contactos internos, proveedores críticos y canales de comunicación."], "ISO/IEC 27001:2022 A.5.26 y A.5.29; NIST CSF 2.0 RC.RP."),
        ],
        no: [
            task("Crea una guía de respuesta para las primeras horas", ["Define cómo reportar, quién coordina y a quién contactar.", "Incluye cómo aislar equipos sin borrar evidencias."], "ISO/IEC 27001:2022 A.5.24 y A.5.26; NIST CSF 2.0 RS.MA."),
            task("Define cómo contener incidentes y proteger cuentas", ["Establece cómo deshabilitar cuentas o sesiones comprometidas.", "Define quién puede aislar dispositivos y contactar soporte."], "ISO/IEC 27001:2022 A.5.26 y A.5.27; NIST CSF 2.0 RS.MI."),
            task("Documenta recuperación y registro de incidentes", ["Describe cómo validar respaldos y restaurar servicios prioritarios.", "Registra impacto, acciones y mejoras posteriores."], "ISO/IEC 27001:2022 A.5.27 y A.5.29; NIST CSF 2.0 RC.RP."),
        ],
    },
    datos: {
        si: [task("Revisa el inventario y los avisos de privacidad", ["Comprueba anualmente qué datos conservas y por cuánto tiempo.", "Actualiza avisos y autorizaciones si cambian las finalidades."], "Ley 1581 de 2012; Decreto 1074 de 2015; ISO/IEC 27001:2022 A.5.34.")],
        parcial: [
            task("Completa el inventario de datos personales", ["Registra categorías, origen, finalidad, ubicación y personas con acceso.", "Incluye correo, hojas de cálculo y servicios en la nube."], "Ley 1581 de 2012; Decreto 1074 de 2015; ISO/IEC 27001:2022 A.5.34."),
            task("Verifica autorización, aviso y tiempo de conservación", ["Confirma que la información a titulares corresponde al uso real.", "Define plazos y un proceso para atender solicitudes."], "Ley 1581 de 2012; Decreto 1074 de 2015."),
        ],
        no: [
            task("Identifica qué datos personales recopilas y dónde se guardan", ["Lista datos de clientes, empleados y proveedores.", "Anota finalidad, ubicación, responsable y personas con acceso."], "Ley 1581 de 2012; Decreto 1074 de 2015; ISO/IEC 27001:2022 A.5.34."),
            task("Revisa la autorización y la información entregada a titulares", ["Identifica la base jurídica y los deberes de información aplicables.", "Solicita orientación jurídica cuando el caso lo requiera."], "Ley 1581 de 2012; Decreto 1074 de 2015."),
            task("Limita accesos y define conservación y eliminación", ["Permite acceso solo a quienes lo necesitan.", "Define plazos y elimina datos de forma segura cuando corresponda."], "Ley 1581 de 2012; ISO/IEC 27001:2022 A.5.15 y A.5.34."),
        ],
    },
    presupuesto: {
        si: [task("Revisa anualmente la inversión frente a los riesgos prioritarios", ["Compara gastos con necesidades de copias, actualizaciones y formación.", "Ajusta prioridades cuando cambien sistemas o riesgos."], "ISO/IEC 27001:2022, cláusula 7.1; NIST CSF 2.0 GV.RR.")],
        parcial: [
            task("Identifica brechas que requieren recursos recurrentes", ["Anota herramientas críticas y sus costos de renovación.", "Prioriza según el impacto de una interrupción o pérdida."], "ISO/IEC 27001:2022, cláusula 7.1; NIST CSF 2.0 GV.RR."),
            task("Asigna responsables y fechas a las inversiones prioritarias", ["Define presupuesto y responsable para las brechas más importantes.", "Revisa trimestralmente avances y gastos previstos."], "ISO/IEC 27001:2022, cláusula 7.1; NIST CSF 2.0 GV.RR."),
        ],
        no: [
            task("Establece un presupuesto inicial para necesidades esenciales", ["Calcula costos básicos de copias, actualizaciones y protección.", "Asigna un monto periódico realista y una persona responsable."], "ISO/IEC 27001:2022, cláusula 7.1; NIST CSF 2.0 GV.RR."),
            task("Prioriza gastos según el impacto en la operación", ["Lista sistemas y datos cuya pérdida detendría el negocio.", "Prioriza respaldo, acceso seguro, actualizaciones y formación."], "ISO/IEC 27001:2022, cláusulas 6.1 y 7.1; NIST CSF 2.0 GV.RR."),
            task("Registra y revisa las inversiones de seguridad", ["Registra gastos, responsables y objetivos.", "Comprueba trimestralmente si cada gasto cubrió la necesidad prevista."], "ISO/IEC 27001:2022, cláusulas 7.1 y 9.1; NIST CSF 2.0 GV.RR."),
        ],
    },
}

export type RecommendationGroup = {
    questionId: IdPregunta
    pregunta: string
    categoria: string
    icono: string
    peso: number
    answer: DiagnosticAnswer
    tasks: Array<Task & { id: string }>
}

const answerPriority: Record<DiagnosticAnswer, number> = { no: 0, parcial: 1, si: 2 }

export function generateChecklist(answers: AnswerMap): RecommendationGroup[] {
    return preguntas
        .flatMap((question) => {
            const answer = answers[question.id]
            if (answer !== "si" && answer !== "parcial" && answer !== "no") return []

            return [{
                questionId: question.id,
                pregunta: question.pregunta,
                categoria: question.categoria,
                icono: question.icono,
                peso: question.peso,
                answer,
                tasks: recommendations[question.id][answer].map((item, index) => ({
                    ...item,
                    id: `${question.id}-${answer}-${index + 1}`,
                })),
            }]
        })
        .sort((left, right) => answerPriority[left.answer] - answerPriority[right.answer] || right.peso - left.peso)
}