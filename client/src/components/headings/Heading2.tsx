interface Heading2Props {
    text: string;
    className?: string;
    // children: React.ReactNode;
}
export function Heading2({ text, className }: Heading2Props) {
    return (
        <h2 className={`text-sm font-normal text-[#787777] tracking-tight text-[var(--ink)] ${className}`}>
            {text}
            {/* {children} */}
        </h2>
    );
}