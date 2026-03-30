import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = 'default' 
}: StatsCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    success: {
      iconBg: 'bg-leaf/10',
      iconColor: 'text-leaf'
    },
    warning: {
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500'
    },
    info: {
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-500'
    }
  };

  const styles = variantStyles[variant];

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", styles.iconBg)}>
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
