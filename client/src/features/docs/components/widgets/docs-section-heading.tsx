import { Badge } from "@/components/ui/badge";

export function DocsSectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 pb-2">
      <Badge
        variant="secondary"
        className="w-fit bg-[var(--green-soft)] text-[10px] font-bold tracking-wider text-[var(--green-dark)] uppercase hover:bg-[var(--green-soft)]"
      >
        {eyebrow}
      </Badge>
      <h2 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
        {title}
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

