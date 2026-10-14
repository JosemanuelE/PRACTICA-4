import { useNavigate } from "react-router-dom"
import { isLoggedIn } from "../config/api"

const leyes = [
    {
        codigo: "Ley 1273",
        año: "2009",
        titulo: "Protección de la Información y los Datos",
        color: "#C4622D",
        icono: "⚖️",
        resumen:
            "Modifica el Código Penal colombiano creando el bien jurídico «protección de la información y los datos». Tipifica delitos como acceso abusivo a sistemas informáticos, interceptación de datos, daño informático, uso de software malicioso y violación de datos personales.",
        queTeDice:
            "Si un ciberdelincuente hackea los datos de tu pyme, comete un delito penal que puede conllevar prisión de 48 a 96 meses. Tú también puedes denunciar ante la Fiscalía.",
        articulosDestacados: [
            { num: "Art. 269A", desc: "Acceso abusivo a un sistema informático — hasta 8 años de prisión." },
            { num: "Art. 269C", desc: "Interceptación de datos informáticos — hasta 6 años." },
            { num: "Art. 269J", desc: "Transferencia no consentida de activos — hasta 8 años." },
        ],
        link: "https://www.policia.gov.co/denuncia-virtual/normatividad-delitos-informaticos",
    },
    {
        codigo: "Ley 1581",
        año: "2012",
        titulo: "Protección de Datos Personales (Habeas Data)",
        color: "#2D6A4F",
        icono: "🔒",
        resumen:
            "Reconoce y protege el derecho de todas las personas a conocer, actualizar y rectificar la información recogida sobre ellas en bases de datos públicas o privadas. Obliga a quienes tratan datos a pedir autorización, garantizar seguridad y notificar incidentes.",
        queTeDice:
            "Si guardas números de teléfono o datos de clientes en tu celular o en una hoja de cálculo, estás «tratando datos personales». Debes protegerlos y solo usarlos con autorización.",
        articulosDestacados: [
            { num: "Art. 4", desc: "Principios de legalidad, finalidad, libertad, veracidad y seguridad." },
            { num: "Art. 17", desc: "Obligaciones de los responsables del tratamiento de datos." },
            { num: "Art. 26", desc: "Sanciones de hasta 2.000 SMMLV por incumplimiento." },
        ],
        link: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981",
    },
    {
        codigo: "Decreto 338",
        año: "2022",
        titulo: "Gobernanza de Seguridad Digital",
        color: "#264653",
        icono: "🏛️",
        resumen:
            "Adiciona el Título 21 al Decreto Único 1078 de 2015 del Sector TIC. Establece lineamientos para fortalecer la gobernanza de la seguridad digital en Colombia y crea el Modelo de Gobernanza de Seguridad Digital con instancias de coordinación entre entidades.",
        queTeDice:
            "Define cómo el Estado protege la infraestructura digital del país. Como pyme, este decreto te respalda en la gestión de incidentes con entidades como el ColCERT y el Centro Cibernético Policial.",
        articulosDestacados: [
            { num: "Art. 2.21.1", desc: "Principios de seguridad digital: confianza, resiliencia y cooperación." },
            { num: "Art. 2.21.4", desc: "Creación del Modelo de Gobernanza de Seguridad Digital." },
            { num: "Art. 2.21.7", desc: "Responsabilidades de entidades públicas y privadas." },
        ],
        link: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=181866",
    },
    {
        codigo: "Decreto 957",
        año: "2019",
        titulo: "Clasificación de Micro, Pequeñas y Medianas Empresas",
        color: "#E9C46A",
        icono: "🏪",
        resumen:
            "Reglamenta el artículo 2° de la Ley 590 de 2000 y define los umbrales de ingresos por actividad (manufactura, servicios, comercio) para clasificar a las empresas como micro, pequeñas o medianas, determinando así qué apoyos estatales pueden recibir.",
        queTeDice:
            "Una pyme que facture hasta 1.535 millones de pesos al año en comercio es considerada microempresa. Esto determina los programas de apoyo, créditos y beneficios a los que puede acceder, sin importar su sector.",
        articulosDestacados: [
            { num: "Art. 2", desc: "Definición de tamaño por ingresos según sector." },
            { num: "Tabla 1", desc: "Microempresa comercio: hasta 1.535 M COP anuales." },
            { num: "Art. 5", desc: "Entidades encargadas de verificar la clasificación." },
        ],
        link: "https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=84425",
    },
]

const normasInternacionales = [
    {
        norma: "ISO/IEC 27001",
        descripcion: "Estándar internacional para la gestión de la seguridad de la información (SGSI). Define controles y requisitos para proteger activos de información.",
        aplicacion: "Referencia para auditar el nivel de seguridad de tu empresa.",
    },
    {
        norma: "NIST CSF",
        descripcion: "Marco de ciberseguridad del Instituto Nacional de Estándares y Tecnología de EE. UU. Ampliamente adoptado en Colombia por organizaciones privadas.",
        aplicacion: "5 funciones: Identificar, Proteger, Detectar, Responder, Recuperar.",
    },
    {
        norma: "ISO/IEC 27032",
        descripcion: "Directrices para mejorar la ciberseguridad, con énfasis en la protección en el ciberespacio y la colaboración entre organizaciones.",
        aplicacion: "Complementa la ISO 27001 con enfoque específico en amenazas digitales.",
    },
]

export default function LeyesView() {
    const navigate = useNavigate()
    const handleVerPlan = () => {
        if (isLoggedIn()) navigate("/pag/plan-accion")
        else navigate("/auth/login")
    }

    return (
        <>
            {/* ── HERO ── */}
            <section
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    padding: "5rem 4rem",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div style={{
                    position: "absolute", inset: 0,
                    background: "repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(255,255,255,0.02) 60px,rgba(255,255,255,0.02) 120px)",
                }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        background: "rgba(196,98,45,0.2)", border: "1px solid rgba(196,98,45,0.4)",
                        color: "#f4a261", padding: "0.4rem 1rem", borderRadius: 100,
                        fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em",
                        textTransform: "uppercase", marginBottom: "1.5rem",
                    }}>
                        ⚖️ Marco Legal
                    </div>
                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                        fontWeight: 900, color: "white", lineHeight: 1.1,
                        letterSpacing: "-0.02em", marginBottom: "1rem",
                    }}>
                        Leyes de Ciberseguridad{" "}
                        <em style={{ color: "#f4a261", fontStyle: "italic" }}>que protegen tu negocio</em>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", maxWidth: 560, margin: "0 auto 2rem", lineHeight: 1.7 }}>
                        Colombia tiene leyes claras sobre delitos informáticos y protección de datos.
                        Conócelas y úsalas a tu favor como dueño de una pyme.
                    </p>
                    <button
                        onClick={handleVerPlan}
                        style={{
                            background: "#C4622D", color: "white",
                            padding: "0.85rem 2rem", borderRadius: 100,
                            fontWeight: 700, fontSize: "0.95rem",
                            border: "none", cursor: "pointer", fontFamily: "inherit",
                            boxShadow: "0 4px 20px rgba(196,98,45,0.4)",
                        }}
                    >
                        🗺️ Ver mi plan de acción
                    </button>
                </div>
            </section>

            {/* ── LEYES CARDS ── */}
            <section style={{ padding: "5rem 4rem", background: "#F4EDE4" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4622D", marginBottom: "0.5rem" }}>
                        // Normativa colombiana
                    </p>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#2C2C2C", letterSpacing: "-0.02em" }}>
                        Las 4 leyes que debes conocer
                    </h2>
                </div>

                <div style={{ display: "grid", gap: "2rem", maxWidth: 900, margin: "0 auto" }}>
                    {leyes.map((ley) => (
                        <div
                            key={ley.codigo}
                            style={{
                                background: "white",
                                borderRadius: 20,
                                overflow: "hidden",
                                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                                border: `2px solid ${ley.color}22`,
                            }}
                        >
                            {/* Encabezado */}
                            <div style={{
                                background: ley.color,
                                padding: "1.25rem 2rem",
                                display: "flex", alignItems: "center", gap: "1rem",
                            }}>
                                <span style={{ fontSize: "2rem" }}>{ley.icono}</span>
                                <div>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>
                                        {ley.codigo} · {ley.año}
                                    </div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 700, color: "white" }}>
                                        {ley.titulo}
                                    </div>
                                </div>
                            </div>

                            {/* Cuerpo */}
                            <div style={{ padding: "1.75rem 2rem" }}>
                                <p style={{ color: "#444", lineHeight: 1.7, fontSize: "0.92rem", marginBottom: "1.25rem" }}>
                                    {ley.resumen}
                                </p>

                                {/* Qué te dice */}
                                <div style={{
                                    background: `${ley.color}10`,
                                    border: `1px solid ${ley.color}30`,
                                    borderRadius: 12, padding: "1rem 1.25rem",
                                    marginBottom: "1.25rem",
                                }}>
                                    <p style={{ fontWeight: 700, color: ley.color, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                                        💡 ¿Qué significa para tu pyme?
                                    </p>
                                    <p style={{ color: "#333", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                                        {ley.queTeDice}
                                    </p>
                                </div>

                                {/* Artículos destacados */}
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <p style={{ fontWeight: 700, color: "#2C2C2C", fontSize: "0.85rem", marginBottom: "0.6rem" }}>
                                        Artículos clave:
                                    </p>
                                    <div style={{ display: "grid", gap: "0.5rem" }}>
                                        {ley.articulosDestacados.map((art) => (
                                            <div key={art.num} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                                <span style={{
                                                    background: ley.color, color: "white",
                                                    padding: "0.15rem 0.6rem", borderRadius: 6,
                                                    fontSize: "0.72rem", fontFamily: "'DM Mono', monospace",
                                                    fontWeight: 600, flexShrink: 0, marginTop: 2,
                                                }}>
                                                    {art.num}
                                                </span>
                                                <span style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.5 }}>{art.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <a
                                    href={ley.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: ley.color, fontWeight: 600, fontSize: "0.85rem",
                                        textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                    }}
                                >
                                    Ver texto oficial →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── NORMAS INTERNACIONALES ── */}
            <section style={{ padding: "5rem 4rem", background: "white" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4622D", marginBottom: "0.5rem" }}>
                        // Estándares internacionales
                    </p>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#2C2C2C", letterSpacing: "-0.02em" }}>
                        Marcos de referencia que usamos
                    </h2>
                    <p style={{ color: "#666", maxWidth: 480, margin: "0.75rem auto 0", fontSize: "0.9rem" }}>
                        Las recomendaciones toman estos marcos como referencia para proponer prácticas concretas.
                    </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
                    {normasInternacionales.map((n) => (
                        <div key={n.norma} style={{
                            background: "#F4EDE4", borderRadius: 16, padding: "1.75rem 1.5rem",
                            border: "1px solid rgba(196,98,45,0.15)",
                        }}>
                            <div style={{
                                fontFamily: "'DM Mono', monospace", fontSize: "0.85rem",
                                fontWeight: 700, color: "#C4622D", marginBottom: "0.75rem",
                                background: "rgba(196,98,45,0.1)", display: "inline-block",
                                padding: "0.2rem 0.7rem", borderRadius: 6,
                            }}>
                                {n.norma}
                            </div>
                            <p style={{ fontSize: "0.875rem", color: "#444", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                                {n.descripcion}
                            </p>
                            <p style={{ fontSize: "0.8rem", color: "#2D6A4F", fontWeight: 600 }}>
                                ✓ {n.aplicacion}
                            </p>
                        </div>
                    ))}
                </div>
                <p style={{ color: "#666", maxWidth: 900, margin: "1.5rem auto 0", fontSize: "0.8rem", lineHeight: 1.6, textAlign: "center" }}>
                    Estas referencias no determinan por sí solas qué obligaciones aplican a cada empresa ni constituyen una auditoría o certificación. La aplicabilidad puede depender del tratamiento de datos y del sector.
                </p>
            </section>

            {/* ── LÍNEA DEL TIEMPO ── */}
            <section style={{ padding: "5rem 4rem", background: "#F4EDE4" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#2C2C2C", letterSpacing: "-0.02em" }}>
                        Evolución legal en Colombia
                    </h2>
                </div>
                <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
                    {/* Línea vertical */}
                    <div style={{
                        position: "absolute", left: "5rem", top: 0, bottom: 0,
                        width: 2, background: "rgba(196,98,45,0.2)",
                    }} />
                    {[
                        { año: "2009", hito: "Ley 1273", desc: "Colombia tipifica los delitos informáticos como bien jurídico protegido." },
                        { año: "2011", hito: "CONPES 3701", desc: "Lineamientos de política para ciberseguridad y ciberdefensa." },
                        { año: "2012", hito: "Ley 1581", desc: "Protección de datos personales y creación de la SIC como autoridad." },
                        { año: "2019", hito: "Decreto 957", desc: "Clasificación oficial de PYMES por ingresos, para todos los sectores económicos." },
                        { año: "2022", hito: "Decreto 338", desc: "Modelo de Gobernanza de Seguridad Digital para el Estado y el sector privado." },
                    ].map((item) => (
                        <div key={item.año} style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", alignItems: "flex-start" }}>
                            <div style={{
                                width: "4.5rem", fontFamily: "'DM Mono', monospace",
                                fontSize: "0.95rem", fontWeight: 700, color: "#C4622D",
                                textAlign: "right", flexShrink: 0, paddingTop: "0.1rem",
                            }}>
                                {item.año}
                            </div>
                            {/* Punto en la línea */}
                            <div style={{
                                width: 12, height: 12, borderRadius: "50%",
                                background: "#C4622D", flexShrink: 0,
                                marginTop: "0.3rem", position: "relative", zIndex: 2,
                                boxShadow: "0 0 0 3px rgba(196,98,45,0.2)",
                            }} />
                            <div>
                                <div style={{ fontWeight: 700, color: "#2C2C2C", fontSize: "0.95rem", marginBottom: "0.2rem" }}>{item.hito}</div>
                                <div style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: "4rem", background: "#2D6A4F", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.9rem", fontWeight: 900, color: "white", marginBottom: "1rem" }}>
                    ¿Tu empresa cumple con la Ley 1581?
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto 2rem" }}>
                    Haz el diagnóstico gratuito y descubre en minutos qué riesgos legales enfrenta tu pyme.
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => navigate("/pag/diagnostico")}
                        style={{
                            background: "#E9C46A", color: "#2C2C2C",
                            padding: "0.9rem 2.25rem", borderRadius: 100,
                            fontWeight: 700, fontSize: "1rem",
                            border: "none", cursor: "pointer", fontFamily: "inherit",
                        }}
                    >
                        🔍 Hacer diagnóstico gratis
                    </button>
                    <button
                        onClick={handleVerPlan}
                        style={{
                            background: "rgba(255,255,255,0.15)", color: "white",
                            padding: "0.9rem 2.25rem", borderRadius: 100,
                            fontWeight: 600, fontSize: "1rem",
                            border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        🗺️ Ver mi plan de acción
                    </button>
                </div>
            </section>
        </>
    )
}
