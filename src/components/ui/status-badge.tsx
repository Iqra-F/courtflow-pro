import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  type?: 'case' | 'filing' | 'hearing' | 'priority';
  className?: string;
}

export function StatusBadge({ status, type = 'case', className }: StatusBadgeProps) {
  const getStatusVariant = () => {
    if (type === 'priority') {
      const variants = {
        LOW: "bg-muted text-muted-foreground",
        MEDIUM: "bg-warning text-warning-foreground",
        HIGH: "bg-accent text-accent-foreground",
        URGENT: "bg-destructive text-destructive-foreground"
      };
      return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground";
    }

    const variants = {
      SUBMITTED: "bg-status-submitted text-foreground",
      UNDER_REVIEW: "bg-status-under-review text-white",
      SCHEDULED: "bg-status-scheduled text-white",
      ACCEPTED: "bg-status-accepted text-white",
      REJECTED: "bg-status-rejected text-white",
      HELD: "bg-success text-success-foreground",
      CANCELLED: "bg-muted text-muted-foreground",
      RESCHEDULED: "bg-warning text-warning-foreground"
    };
    
    return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground";
  };

  return (
    <Badge className={cn(getStatusVariant(), className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
}