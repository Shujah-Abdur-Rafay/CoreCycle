import { Info, Lightbulb, AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  info: {
    icon: Info,
    classes: "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300",
    iconClasses: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    defaultTitle: "Note",
  },
  tip: {
    icon: Lightbulb,
    classes: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300",
    iconClasses: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    defaultTitle: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300",
    iconClasses: "bg-red-500/10 text-red-600 dark:text-red-400",
    defaultTitle: "Warning",
  },
  important: {
    icon: Star,
    classes: "border-primary/30 bg-primary/5 text-foreground",
    iconClasses: "bg-primary/10 text-primary",
    defaultTitle: "Important",
  },
};

interface CalloutBlockProps {
  variant: keyof typeof variants;
  title?: string;
  body: string;
}

export function CalloutBlock({ variant, title, body }: CalloutBlockProps) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <div className={cn("my-4 rounded-lg border-l-4 border p-4 flex gap-3", v.classes)}>
      <div className={cn("flex-shrink-0 rounded-md p-2 h-fit", v.iconClasses)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm mb-1">{title || v.defaultTitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
