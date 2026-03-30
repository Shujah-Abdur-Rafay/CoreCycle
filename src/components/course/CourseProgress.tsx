import { Progress } from "@/components/ui/progress";
import { ModuleCompletion, Module } from "@/hooks/useModules";
import { CheckCircle, Clock, Award } from "lucide-react";

interface CourseProgressProps {
  modules: Module[];
  completions: ModuleCompletion[];
  courseDuration: number;
}

export function CourseProgress({
  modules,
  completions,
  courseDuration,
}: CourseProgressProps) {
  const completedCount = completions.filter(c => c.status === 'completed').length;
  const progressPercentage = modules.length > 0 
    ? Math.round((completedCount / modules.length) * 100) 
    : 0;
  
  const totalTimeSpent = completions.reduce((acc, c) => acc + (c.time_spent_minutes || 0), 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Your Progress</h3>
        <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
      </div>

      <Progress value={progressPercentage} className="h-3" />

      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-leaf mb-1">
            <CheckCircle className="h-4 w-4" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {completedCount}/{modules.length}
          </p>
          <p className="text-xs text-muted-foreground">Modules</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatTime(totalTimeSpent)}
          </p>
          <p className="text-xs text-muted-foreground">Time Spent</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Award className="h-4 w-4" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {progressPercentage === 100 ? '🎉' : `${100 - progressPercentage}%`}
          </p>
          <p className="text-xs text-muted-foreground">
            {progressPercentage === 100 ? 'Complete!' : 'Remaining'}
          </p>
        </div>
      </div>
    </div>
  );
}
