import { cn } from "@/lib/utils";

type StatusType = "present" | "absent" | "late" | "excused" | "violation" | "normal" | "important" | "urgent";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusStyles = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
    excused: "bg-blue-100 text-blue-800",
    violation: "bg-red-100 text-red-800",
    normal: "bg-blue-100 text-blue-800",
    important: "bg-yellow-100 text-yellow-800",
    urgent: "bg-red-100 text-red-800"
  };

  return (
    <span
      className={cn(
        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
