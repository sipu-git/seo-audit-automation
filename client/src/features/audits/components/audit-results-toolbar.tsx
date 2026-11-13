import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuditResultsToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
        <Input
          aria-label="Search audits"
          placeholder="Search website, location, or job ID"
          className="pl-9"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger aria-label="Filter audits by status" className="w-full sm:w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="QUEUED">Queued</SelectItem>
          <SelectItem value="PROCESSING">In progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
