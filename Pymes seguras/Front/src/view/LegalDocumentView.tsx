import { Link } from "react-router-dom"
import type { LegalDocument } from "../content/legalDocuments"

export default function LegalDocumentView({ document }: { document: LegalDocument }) {
    return (
        <div className="min-h-screen px-5 py-10" style={{ background: "#F4EDE4" }}>
            <article
                className="mx-auto w-full max-w-2xl rounded-2xl px-6 py-8 md:px-10 md:py-10"
                style={{ background: "#fff", border: "1px solid #e8ddd2" }}
            >
                <Link to="/auth/register" className="text-sm font-semibold no-underline" style={{ color: "#C4622D" }}>
                    Volver al registro
                </Link>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wider" style={{ color: "#2D6A4F" }}>
                    {document.kicker}
                </p>
                <h1 className="font-serif mt-2 text-3xl font-black leading-tight" style={{ color: "#2C2C2C" }}>
                    {document.title}
                </h1>
                <p className="mt-2 text-sm" style={{ color: "#666" }}>
                    Versión del {document.updated}
                </p>
                <div className="mt-8 flex flex-col gap-6">
                    {document.sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-base font-bold" style={{ color: "#2C2C2C" }}>
                                {section.title}
                            </h2>
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph} className="mt-2 text-sm leading-relaxed" style={{ color: "#444" }}>
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    ))}
                </div>
            </article>
        </div>
    )
}
