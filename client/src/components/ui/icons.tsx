import {AlertTriangle,ArrowUpRight,BarChart3,Check,ChevronDown, Clock3,Download,ExternalLink,FileText,Globe2,LayoutDashboard,
  Menu,PanelLeft,Plus,RefreshCw,Search,Settings,Sparkles,X,type LucideIcon,type LucideProps,
} from "lucide-react";

type IconName = "grid" | "globe" | "file" | "chart" | "settings" | "search" | "plus" | "arrow" | "check" | "clock" | "alert" | "spark" | "menu" | "panel" | "refresh" | "external" | "close" | "chevron" | "download";

const iconByName: Record<IconName, LucideIcon> = {
  grid: LayoutDashboard,
  globe: Globe2,
  file: FileText,
  chart: BarChart3,
  settings: Settings,
  search: Search,
  plus: Plus,
  arrow: ArrowUpRight,
  check: Check,
  clock: Clock3,
  alert: AlertTriangle,
  spark: Sparkles,
  menu: Menu,
  panel: PanelLeft,
  refresh: RefreshCw,
  external: ExternalLink,
  close: X,
  chevron: ChevronDown,
  download: Download,
};

export function Icon({ name, ...props }: LucideProps & { name: IconName }) {
  const Component = iconByName[name];
  return <Component aria-hidden="true" {...props} />;
}
