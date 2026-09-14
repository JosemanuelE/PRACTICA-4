type ErrorMessageProps = {
    children: React.ReactNode
}

export default function ErrorMessage({children} : ErrorMessageProps) {
    return (
        <p className="bg-red-50 text-red-500 text-sm uppercase font-semibold text-center">{children}</p>
    )
}