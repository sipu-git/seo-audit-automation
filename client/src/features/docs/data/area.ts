import { Activity, BookOpen, Layers3 } from "lucide-react";

export const areas = [
  {
    title: "Client dashboard",
    href: "/",
    audience: "For website owners",
    description:
      "Submit an audit, track jobs, and open the completed report. Recent client audits are kept in this browser’s local storage.",
    icon: Layers3,
  },
  {
    title: "Admin portal",
    href: "/admin",
    audience: "For internal operations",
    description:
      "Monitor the shared audit records, review queue activity, search or filter jobs, inspect scores, and trigger a manual audit.",
    icon: Activity,
  },
  {
    title: "Project guide",
    href: "/docs",
    audience: "For everyone",
    description:
      "Understand how the product fits together, what each module owns, how to start it, and where to look when a job is delayed.",
    icon: BookOpen,
  },
];