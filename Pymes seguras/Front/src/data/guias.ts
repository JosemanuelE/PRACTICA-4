import type { DiagnosticAnswer, IdPregunta } from "./diagnosticQuestions"

export type Guia = {
    riesgo: string
    minutos: number
    pasos: string[]
    enlace: { texto: string; url: string }
    prueba: string
}

const guia = (
    riesgo: string,
    minutos: number,
    pasos: string[],
    enlace: { texto: string; url: string },
    prueba: string
): Guia => ({ riesgo, minutos, pasos, enlace, prueba })

const whatsapp2fa = "https://faq.whatsapp.com/1278661612895630"
const google2fa = "https://support.google.com/accounts/answer/185839?hl=es"
const windowsSecurity = "https://support.microsoft.com/es-es/windows/mantenerse-protegido-con-seguridad-de-windows"
const backupHelp = "https://faq.whatsapp.com/1146933653075746"

export const guias: Record<IdPregunta, Record<DiagnosticAnswer, Guia>> = {
    antivirus: {
        no: guia(
            "Si el computador de la caja se infecta, pueden bloquearte las facturas y pedirte plata para devolverlas.",
            8,
            [
                "En el computador abre Seguridad de Windows. En el celular Android abre Play Store y luego el icono de perfil, Play Protect.",
                "Activa la protección en tiempo real. Si pide permiso, acéptalo.",
                "Pulsa buscar actualizaciones y espera a que diga que está al día.",
            ],
            { texto: "Abrir la ayuda de Seguridad de Windows", url: windowsSecurity },
            "Escribe en qué equipo lo activaste y qué mensaje viste al final. No pegues capturas ni claves."
        ),
        parcial: guia(
            "Un solo celular sin protección basta para que un archivo infectado entre al negocio.",
            10,
            [
                "Haz una lista corta: computador de la caja, tu celular y el de quien cobra.",
                "En el que falte, abre Seguridad de Windows o Play Protect y activa la protección.",
                "Revisa que la fecha de la última actualización sea de esta semana.",
            ],
            { texto: "Abrir la ayuda de Seguridad de Windows", url: windowsSecurity },
            "Escribe qué equipo faltaba y cómo confirmaste que ya quedó protegido."
        ),
        si: guia(
            "La protección que no se revisa se queda vieja y deja de servir.",
            5,
            [
                "Abre Seguridad de Windows o Play Protect en el equipo principal.",
                "Mira la fecha de las definiciones o del último análisis.",
                "Si tiene más de una semana, pulsa actualizar ahora.",
            ],
            { texto: "Abrir la ayuda de Seguridad de Windows", url: windowsSecurity },
            "Escribe la fecha que viste en la última actualización y en qué equipo."
        ),
    },
    backup: {
        no: guia(
            "Si se daña el celular, se van los chats de pedidos y no hay forma de recuperarlos.",
            6,
            [
                "Abre WhatsApp, entra a Ajustes y luego a Chats.",
                "Toca Copia de seguridad y elige la cuenta de Google o iCloud del negocio.",
                "Pulsa Realizar copia ahora y espera a que diga que terminó.",
            ],
            { texto: "Ver cómo hacer la copia de WhatsApp", url: backupHelp },
            "Escribe a qué cuenta quedó la copia y a qué hora terminó. No pegues el correo completo si no quieres."
        ),
        parcial: guia(
            "Una copia que nunca se probó puede estar vacía el día que la necesites.",
            8,
            [
                "Abre WhatsApp, Ajustes, Chats, Copia de seguridad.",
                "Mira la fecha de la última copia. Si no es de esta semana, pulsa Realizar copia ahora.",
                "Confirma que diga copia finalizada y anota el día.",
            ],
            { texto: "Ver cómo hacer la copia de WhatsApp", url: backupHelp },
            "Escribe la fecha de la última copia que viste en la pantalla."
        ),
        si: guia(
            "Tener copia no alcanza: hay que saber si de verdad se puede abrir.",
            10,
            [
                "Elige un archivo que no sea urgente, por ejemplo una foto de un producto.",
                "Bórralo solo de la galería después de confirmar que está en la copia, o ábrelo desde Google Drive o iCloud.",
                "Comprueba que se ve completo y anota el resultado.",
            ],
            { texto: "Ver cómo hacer la copia de WhatsApp", url: backupHelp },
            "Escribe qué archivo abriste desde la copia y si se vio completo."
        ),
    },
    contrasenas: {
        no: guia(
            "Si la clave del correo es la misma del banco, quien adivine una entra a las dos.",
            10,
            [
                "Entra al correo del negocio escribiendo tú la dirección, no desde un enlace.",
                "Abre la seguridad de la cuenta y cambia la contraseña por una frase larga que solo uses ahí.",
                "Guárdala en un cuaderno bajo llave o en el gestor del celular, no en un chat.",
            ],
            { texto: "Ayuda para una contraseña de Google", url: "https://support.google.com/accounts/answer/32040?hl=es" },
            "Escribe qué cuenta cambiaste y dónde guardaste la frase. No escribas la contraseña."
        ),
        parcial: guia(
            "Una clave repetida en el banco y en el correo alcanza para vaciar la cuenta.",
            10,
            [
                "Entra primero al banco o a Nequi y cambia esa clave por una que no uses en ningún otro lado.",
                "Luego cambia la del correo del negocio, distinta a la anterior.",
                "Anota en un papel guardado en la tienda solo el lugar donde quedó cada una, no la clave.",
            ],
            { texto: "Ayuda para una contraseña de Google", url: "https://support.google.com/accounts/answer/32040?hl=es" },
            "Escribe qué dos cuentas quedaron con clave distinta y dónde anotaste el recordatorio."
        ),
        si: guia(
            "Las cuentas viejas de exempleados siguen abiertas aunque tú ya uses claves buenas.",
            8,
            [
                "Abre el correo y la lista de cuentas con las que entra el negocio.",
                "Cierra la sesión o quita a quien ya no trabaja.",
                "Revisa que la clave del correo no sea la misma del banco.",
            ],
            { texto: "Ayuda para revisar el acceso a Google", url: "https://support.google.com/accounts/answer/32040?hl=es" },
            "Escribe qué cuenta revisaste y si quitaste a alguien o confirmaste que la clave no se repite."
        ),
    },
    wifi: {
        no: guia(
            "Si el cliente usa la misma Wi‑Fi del datáfono, puede llegar a ver equipos de la tienda.",
            12,
            [
                "Entra al router: suele ser una etiqueta debajo del módem con una dirección como 192.168.0.1.",
                "Activa la red de invitados y ponle una clave distinta a la de la caja.",
                "En el celular de un cliente de prueba, conéctate a esa red y comprueba que no ves el computador de la tienda.",
            ],
            { texto: "Qué es una red de invitados", url: "https://www.wi-fi.org/discover-wi-fi/security" },
            "Escribe el nombre de la red de invitados que creaste. No escribas la clave."
        ),
        parcial: guia(
            "La red de invitados que sigue viendo la impresora o el computador no está separada.",
            10,
            [
                "Conéctate con un celular a la red de clientes.",
                "Intenta abrir la impresora o el computador de la caja. No debería aparecer.",
                "Si aparece, entra al router y deja aislada la red de invitados.",
            ],
            { texto: "Qué es una red de invitados", url: "https://www.wi-fi.org/discover-wi-fi/security" },
            "Escribe si desde la red de clientes pudiste ver algún equipo de la tienda y qué cambiaste."
        ),
        si: guia(
            "El módem con la clave de fábrica se puede entrar desde la calle.",
            8,
            [
                "Mira la etiqueta del módem y entra con la dirección que indica.",
                "Cambia la clave de administrador si todavía es admin o la de la etiqueta.",
                "Revisa que la red de invitados siga activa.",
            ],
            { texto: "Qué es una red de invitados", url: "https://www.wi-fi.org/discover-wi-fi/security" },
            "Escribe si cambiaste la clave del módem y si la red de invitados seguía activa. No pegues la clave."
        ),
    },
    dobleFA: {
        no: guia(
            "Si te roban el celular y WhatsApp no tiene verificación en dos pasos, se llevan los pedidos y pueden escribirles a tus clientes.",
            4,
            [
                "Abre WhatsApp, entra a Ajustes y luego a Cuenta.",
                "Toca Verificación en dos pasos y luego Activar.",
                "Crea un código de 6 números y anótalo en un papel que no esté dentro del celular.",
            ],
            { texto: "Ver los pasos oficiales de WhatsApp", url: whatsapp2fa },
            "Escribe dónde guardaste el papel del código. No escribas el código."
        ),
        parcial: guia(
            "Si el correo del negocio no pide el segundo paso, con la clave sola les basta para leer facturas y recuperar WhatsApp.",
            6,
            [
                "Entra al correo del negocio desde la página oficial, no desde un enlace.",
                "Abre Seguridad y activa la verificación en dos pasos con el celular del negocio.",
                "Guarda los códigos de respaldo en el mismo papel de WhatsApp, fuera del celular.",
            ],
            { texto: "Activar la verificación de Google", url: google2fa },
            "Escribe en qué correo quedó activa y dónde dejaste los códigos de respaldo. No pegues los códigos."
        ),
        si: guia(
            "Si cambiaste de celular y el código de respaldo quedó en el aparato viejo, puedes quedarte por fuera.",
            5,
            [
                "Abre WhatsApp, Ajustes, Cuenta, Verificación en dos pasos.",
                "Confirma que sigue activa.",
                "Revisa que el papel con el código esté en la tienda y no solo en el celular.",
            ],
            { texto: "Ver los pasos oficiales de WhatsApp", url: whatsapp2fa },
            "Escribe si la verificación seguía activa y dónde está hoy el papel del código."
        ),
    },
    capacitacion: {
        no: guia(
            "Quien cobra por WhatsApp puede abrir un enlace falso si nadie le explicó cómo se ve.",
            15,
            [
                "Reúne a quien usa el celular del negocio, aunque sea una sola persona.",
                "Muéstrale un mensaje falso: urgencia, premio o un banco que pide la clave.",
                "Acuerden una frase: si llega algo así, se pregunta en persona antes de tocar.",
            ],
            { texto: "Señales de un mensaje falso", url: "https://www.colcert.gov.co/" },
            "Escribe a quién se lo explicaste y qué frase acordaron para frenar un mensaje raro."
        ),
        parcial: guia(
            "Quien llegó nuevo a la tienda no oyó la charla del año pasado.",
            10,
            [
                "Llama a quien no estuvo en la charla anterior.",
                "Repasa solo dos cosas: no dar la clave por chat y no pagar por un enlace.",
                "Dile a quién avisar en la tienda si ya hizo clic.",
            ],
            { texto: "Señales de un mensaje falso", url: "https://www.colcert.gov.co/" },
            "Escribe el nombre de pila de quien faltaba y qué le pediste avisar."
        ),
        si: guia(
            "Una charla de hace un año se olvida el día que llega un mensaje bien hecho.",
            8,
            [
                "Esta semana muestra un solo ejemplo real de mensaje falso, sin abrir el enlace.",
                "Pregunta en voz alta qué harían antes de tocar.",
                "Recuerda el canal: se avisa a la persona de la caja, no se contesta el mensaje.",
            ],
            { texto: "Señales de un mensaje falso", url: "https://www.colcert.gov.co/" },
            "Escribe qué ejemplo mostraste y qué respondió el equipo."
        ),
    },
    actualizaciones: {
        no: guia(
            "El celular sin actualizaciones es la puerta que usan para entrar sin que veas nada.",
            8,
            [
                "En el celular del negocio abre Ajustes y busca Actualización de software o Sistema.",
                "Si hay una descarga, conéctate a la Wi‑Fi y déjala terminar. No lo apagues a la mitad.",
                "Repite lo mismo en el computador: Windows Update o Actualización de software en Mac.",
            ],
            { texto: "Buscar actualizaciones de Windows", url: "https://support.microsoft.com/es-es/windows/actualizar-windows" },
            "Escribe qué aparato actualizaste y hasta qué fecha quedó el sistema."
        ),
        parcial: guia(
            "El aviso de actualizar que llevas semanas posponiendo es el que cierra el hueco.",
            8,
            [
                "Abre el aparato que tiene el aviso pendiente.",
                "Entra a la actualización del sistema y pulsa descargar e instalar.",
                "Cuando reinicie, confirma que ya no pide la misma actualización.",
            ],
            { texto: "Buscar actualizaciones de Windows", url: "https://support.microsoft.com/es-es/windows/actualizar-windows" },
            "Escribe qué aparato tenía el aviso y si al reiniciar ya no apareció."
        ),
        si: guia(
            "Una aplicación vieja de facturación puede fallar aunque el celular esté al día.",
            6,
            [
                "Abre la tienda de aplicaciones del celular o el computador.",
                "Entra a actualizaciones pendientes.",
                "Actualiza la app con la que cobras o facturas.",
            ],
            { texto: "Buscar actualizaciones de Windows", url: "https://support.microsoft.com/es-es/windows/actualizar-windows" },
            "Escribe qué aplicación actualizaste y en qué aparato."
        ),
    },
    phishing: {
        no: guia(
            "Un mensaje que dice «tu banco bloqueó la cuenta» y trae un enlace se queda con la clave en un minuto.",
            5,
            [
                "No toques el enlace. Mira el número o el correo completo, no solo el nombre.",
                "Si habla de plata o de una clave, llama al banco o entra escribiendo tú la dirección.",
                "Borra el mensaje y avisa en la tienda para que nadie más lo abra.",
            ],
            { texto: "Avisos del ColCERT", url: "https://www.colcert.gov.co/" },
            "Escribe una señal que vas a mirar antes de abrir un enlace, con tus palabras."
        ),
        parcial: guia(
            "Confirmar por el mismo chat no sirve: quien escribió el mensaje falso también contesta.",
            5,
            [
                "Cuando pidan un pago raro, cierra ese chat.",
                "Llama a la persona por el número que ya tenías guardado, no por el que escribió.",
                "Solo paga si te lo confirman por esa llamada.",
            ],
            { texto: "Avisos del ColCERT", url: "https://www.colcert.gov.co/" },
            "Escribe a quién llamarías antes de pagar un mensaje urgente."
        ),
        si: guia(
            "Saber reconocerlo no ayuda si quien cobra igual abre el enlace.",
            8,
            [
                "Muestra hoy un mensaje sospechoso a quien usa el WhatsApp de la tienda, sin abrirlo.",
                "Pídele que diga en voz alta por qué no lo tocaría.",
                "Dejen dicho a quién se avisa si alguien ya hizo clic.",
            ],
            { texto: "Avisos del ColCERT", url: "https://www.colcert.gov.co/" },
            "Escribe qué señal repasaron y a quién hay que avisar si alguien ya abrió el enlace."
        ),
    },
    plan: {
        no: guia(
            "El día que bloqueen el WhatsApp, sin un papel con los pasos, cada quien hace algo distinto y se pierde tiempo.",
            15,
            [
                "En una hoja escribe tres líneas: a quién llamar, cómo avisar a los clientes y quién guarda la copia.",
                "Anota el número del banco y de la persona que administra el celular.",
                "Deja la hoja junto a la caja, no solo en el teléfono.",
            ],
            { texto: "Qué hacer ante un incidente", url: "https://www.colcert.gov.co/" },
            "Escribe las tres cosas que quedaron en la hoja, sin números secretos."
        ),
        parcial: guia(
            "Un plan que solo está en tu cabeza no sirve si ese día no estás en la tienda.",
            10,
            [
                "Pasa a una hoja quién llama al banco y quién escribe a los clientes.",
                "Añade dónde está la copia de WhatsApp.",
                "Enséñasela a otra persona del negocio.",
            ],
            { texto: "Qué hacer ante un incidente", url: "https://www.colcert.gov.co/" },
            "Escribe quién más ya vio la hoja y qué le toca hacer."
        ),
        si: guia(
            "El teléfono del banco anotado hace un año puede estar viejo.",
            8,
            [
                "Saca la hoja del plan.",
                "Confirma que los números sigan sirviendo.",
                "Cambia el que ya no conteste y guarda la hoja en el mismo sitio.",
            ],
            { texto: "Qué hacer ante un incidente", url: "https://www.colcert.gov.co/" },
            "Escribe qué dato corregiste o confirmaste en la hoja."
        ),
    },
    datos: {
        no: guia(
            "Si guardas celulares de clientes y no sabes para qué, la ley te puede pedir cuentas y un robo se lleva esa lista.",
            12,
            [
                "Haz una lista: qué datos de clientes tienes, dónde están y para qué los usas.",
                "Si están en un chat o en una hoja suelta, pasa solo lo necesario a un sitio con clave.",
                "Cuando pidas un dato nuevo, dile a la persona para qué es.",
            ],
            { texto: "Ley 1581 en lenguaje claro", url: "https://www.sic.gov.co/tema/proteccion-de-datos-personales" },
            "Escribe qué datos de clientes anotaste en la lista y dónde quedaron guardados."
        ),
        parcial: guia(
            "Pedir el celular para un domicilio y luego usarlo para promociones, sin decirlo, no está autorizado.",
            10,
            [
                "Revisa la lista de datos y tacha el uso que ya no haces.",
                "En el siguiente pedido, di en una frase para qué guardas el número.",
                "Borra de los chats las fotos de cédulas que ya no necesitas.",
            ],
            { texto: "Ley 1581 en lenguaje claro", url: "https://www.sic.gov.co/tema/proteccion-de-datos-personales" },
            "Escribe qué dato dejaste de guardar o qué frase vas a decir al pedirlo."
        ),
        si: guia(
            "La lista de datos de hace un año sigue teniendo clientes que ya no compran.",
            8,
            [
                "Abre el registro de datos.",
                "Borra los que ya no usas para vender o entregar.",
                "Anota la fecha de esta revisión en la misma hoja.",
            ],
            { texto: "Ley 1581 en lenguaje claro", url: "https://www.sic.gov.co/tema/proteccion-de-datos-personales" },
            "Escribe cuántos contactos quitaste o que revisaste la lista y no había nada de más."
        ),
    },
    presupuesto: {
        no: guia(
            "Sin un peso apartado, la copia y el antivirus se quedan para «después» y ese después es el día del daño.",
            10,
            [
                "Anota un monto pequeño de este mes, aunque sea el de un almuerzo, solo para seguridad.",
                "Decídelo en este orden: copia de WhatsApp, verificación en dos pasos y actualización del celular.",
                "Escribe en la misma hoja quién lo va a hacer esta semana.",
            ],
            { texto: "Por dónde empezar en un negocio pequeño", url: "https://www.colcert.gov.co/" },
            "Escribe el monto que apartaste y qué vas a pagar o hacer primero."
        ),
        parcial: guia(
            "Pagar una herramienta y no usarla es el mismo gasto sin protección.",
            8,
            [
                "Mira qué estás pagando hoy por internet, almacenamiento o antivirus.",
                "Entra y confirma que está activo en el equipo del negocio.",
                "Si no lo usas, cancélalo y deja ese dinero para la copia o la verificación.",
            ],
            { texto: "Por dónde empezar en un negocio pequeño", url: "https://www.colcert.gov.co/" },
            "Escribe qué pago revisaste y si seguía activo en el equipo de la tienda."
        ),
        si: guia(
            "El gasto del año pasado puede estar cubriendo un riesgo que ya no es el más grave.",
            8,
            [
                "Mira en qué se fue el dinero de seguridad este año.",
                "Compáralo con lo que el diagnóstico marcó como más débil.",
                "Mueve el siguiente pago hacia esa debilidad.",
            ],
            { texto: "Por dónde empezar en un negocio pequeño", url: "https://www.colcert.gov.co/" },
            "Escribe a qué riesgo vas a destinar el próximo gasto."
        ),
    },
}

export function guiaDe(questionId: IdPregunta, answer: DiagnosticAnswer): Guia {
    return guias[questionId][answer]
}

const trivial = /^(listo|ya|ya esta|ya está|ok|okay|hecho|si|sí|listo ya|ya lo hice|done)\.?$/i
const secreto = /\d{5,}/

export function validarPrueba(texto: string): string | null {
    const limpio = texto.trim().replace(/\s+/g, " ")
    if (limpio.length < 20) return "Cuéntalo en una frase de al menos 20 caracteres."
    if (trivial.test(limpio)) return "Escribe qué cambiaste y dónde quedó, no solo «listo»."
    if (secreto.test(limpio)) return "No pegues códigos ni contraseñas. Di solo el lugar donde los guardaste."
    if (limpio.length > 400) return "Basta con una frase. No pegues textos largos ni capturas."
    return null
}
