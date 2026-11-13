interface Heading1Props {
    text: string;
    className?: string;
    children: React.ReactNode;
}

export function Heading1({ text, className, children }: Heading1Props) {
    return (
        <h1 className={`text-2xl font-semibold tracking-tight text-[var(--ink)] ${className}`}>
            {text}
            {children}
        </h1>
    );
}