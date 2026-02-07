import { CircleDashed, Clock, CheckCircle2, Circle, LucideIcon } from "lucide-react";

export function getColumnIcon(columnTitle: string): LucideIcon {
  const title = columnTitle.toLowerCase();
  
  if (title.includes("todo") || title.includes("backlog")) {
    return CircleDashed;
  }
  
  if (title.includes("doing") || title.includes("progress") || title.includes("in progress")) {
    return Clock;
  }
  
  if (title.includes("done") || title.includes("complete")) {
    return CheckCircle2;
  }
  
  // Default icon
  return Circle;
}

export function getColumnIconColor(columnTitle: string): string {
  const title = columnTitle.toLowerCase();
  
  if (title.includes("todo") || title.includes("backlog")) {
    return "text-muted-foreground";
  }
  
  if (title.includes("doing") || title.includes("progress") || title.includes("in progress")) {
    return "text-primary";
  }
  
  if (title.includes("done") || title.includes("complete")) {
    return "text-success";
  }
  
  return "text-muted-foreground";
}
