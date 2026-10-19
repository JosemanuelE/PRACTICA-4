export const POLICIES_VERSION = "2026-10-18";
export const PRIVACY_CONTACT = "josmaed65@gmail.com";

export type LegalSection = {
    title: string;
    paragraphs: string[];
};

export type LegalDocument = {
    path: string;
    kicker: string;
    title: string;
    updated: string;
    sections: LegalSection[];
};

export const privacyDocument: LegalDocument = {
    path: "/legal/privacidad",
    kicker: "Ley 1581 de 2012",
    title: "Autorización para el tratamiento de datos personales",
    updated: "18 de octubre de 2026",
    sections: [
        {
            title: "Quién trata los datos",
            paragraphs: [
                "Pymes Seguras es un proyecto de bien público para pequeñas empresas de Colombia, con base en el barrio El Restrepo, Bogotá. El responsable del tratamiento es el equipo del proyecto.",
                `Para conocer, corregir o eliminar tus datos escribe a ${PRIVACY_CONTACT}.`,
            ],
        },
        {
            title: "Qué datos se recogen",
            paragraphs: [
                "Al crear la cuenta: nombre, correo y contraseña. La contraseña no se guarda en texto claro: se almacena con un hash bcrypt.",
                "También se guarda la fecha en la que aceptaste esta política y los términos, y la versión del texto que leíste.",
                "Si haces el diagnóstico: nombre de la empresa, sector, tamaño, respuestas y puntajes. Esos datos quedan asociados a tu cuenta.",
                "Si participas en la comunidad: los temas y comentarios que publiques.",
                "Por seguridad se registran intentos de acceso, la dirección IP y el navegador, para detectar abusos y bloqueos. El token de sesión se guarda en el almacenamiento local del navegador. No usamos cookies de publicidad ni de seguimiento.",
            ],
        },
        {
            title: "Para qué se usan",
            paragraphs: [
                "Crear y proteger tu cuenta, confirmar el correo y restablecer la contraseña.",
                "Mostrarte el diagnóstico, la evolución y el plan de acción.",
                "Moderar la comunidad y bloquear intentos repetidos de ingreso.",
                "No vendemos datos ni los usamos para publicidad. El correo de verificación y de recuperación se envía a través de Gmail, que solo lo usa para entregar ese mensaje.",
            ],
        },
        {
            title: "Tus derechos",
            paragraphs: [
                "Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar esta autorización. La revocación no borra los registros de seguridad que la ley o la protección del servicio obliguen a conservar por un tiempo limitado.",
                `La solicitud se atiende por ${PRIVACY_CONTACT}. Si no recibes respuesta, puedes acudir a la Superintendencia de Industria y Comercio.`,
            ],
        },
        {
            title: "Cuánto tiempo se conservan",
            paragraphs: [
                "Los datos de la cuenta se conservan mientras la cuenta exista. Si pides la eliminación, se borran la cuenta, el diagnóstico y las publicaciones asociadas, salvo los registros de auditoría necesarios para investigar un abuso reciente.",
            ],
        },
    ],
};

export const termsDocument: LegalDocument = {
    path: "/legal/terminos",
    kicker: "Condiciones de uso",
    title: "Términos y condiciones de Pymes Seguras",
    updated: "18 de octubre de 2026",
    sections: [
        {
            title: "Qué es este sitio",
            paragraphs: [
                "Pymes Seguras ofrece orientación práctica de ciberseguridad para pequeñas empresas: diagnóstico, plan de acción, material de estudio y una comunidad.",
                "El diagnóstico y las recomendaciones son educativos. No son una auditoría certificada, ni un concepto jurídico, ni un seguro frente a un incidente.",
            ],
        },
        {
            title: "Tu cuenta",
            paragraphs: [
                "Debes registrarte con datos verdaderos y mantener la contraseña en secreto. La cuenta es personal. Eres responsable de lo que se haga con ella.",
                "Para entrar hay que confirmar el correo. Varios intentos fallidos bloquean el acceso un tiempo, para frenar adivinación de contraseñas.",
            ],
        },
        {
            title: "Uso permitido",
            paragraphs: [
                "Puedes usar el sitio para aprender y mejorar la seguridad de tu negocio.",
                "No está permitido atacar el sitio ni a otros usuarios, publicar datos personales de terceros, malware, spam, ni contenido que pida cometer un delito. Hablar de un ataque para prevenirlo es válido; dar instrucciones para dañar a alguien no lo es.",
                "El equipo puede ocultar publicaciones, cerrar una cuenta y conservar el registro de auditoría cuando haya abuso.",
            ],
        },
        {
            title: "Aceptación",
            paragraphs: [
                "Crear la cuenta exige aceptar estos términos y la autorización de tratamiento de datos. Si no estás de acuerdo, no completes el registro.",
                "El uso del sitio se rige por la ley colombiana. Los juzgados de Bogotá son el fuero competente.",
            ],
        },
    ],
};
