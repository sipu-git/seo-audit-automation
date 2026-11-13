export function DocsToc() {
  const links = [
    { href: "#workflow", label: "Workflow" },
    { href: "#dashboards", label: "Dashboards" },
    { href: "#modules", label: "Modules" },
    { href: "#api", label: "API" },
    { href: "#setup", label: "Local setup" },
    { href: "#data-sources", label: "Data sources" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav
      className="sticky top-[68px] z-20 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)]/90 p-2 shadow-sm backdrop-blur-md"
      aria-label="Table of contents"
    >
      <span className="px-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        Jump to
      </span>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--green-soft)] hover:text-[var(--green-dark)]"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

