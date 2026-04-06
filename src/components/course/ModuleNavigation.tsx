import { cn } from "@/lib/utils";
import { Module, ModuleCompletion } from "@/hooks/useModules";
import { CheckCircle, Circle, PlayCircle, Lock, Clock, Users, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModuleNavigationProps {
  modules: Module[];
  completions: ModuleCompletion[];
  currentModuleId: string;
  onModuleSelect: (moduleId: string) => void;
}

export function ModuleNavigation({
  modules,
  completions,
  currentModuleId,
  onModuleSelect,
}: ModuleNavigationProps) {
  const getModuleStatus = (moduleId: string) => {
    const completion = completions.find(c => c.module_id === moduleId);
    return completion?.status || 'not_started';
  };

  const isInstructorModuleComplete = (moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    const completion = completions.find(c => c.module_id === moduleId);
    
    if (!module?.requires_instructor_approval) return getModuleStatus(moduleId) === 'completed';
    
    return completion?.instructor_approved === true;
  };

  const isModuleAccessible = (index: number) => {
    if (index === 0) return true;
    const prevModule = modules[index - 1];
    const prevModuleId = prevModule?.id;
    
    // Check if previous module requires instructor approval
    if (prevModule?.requires_instructor_approval) {
      return isInstructorModuleComplete(prevModuleId);
    }
    
    const prevStatus = getModuleStatus(prevModuleId);
    return prevStatus === 'completed';
  };

  const getStatusIcon = (moduleId: string, index: number) => {
    const module = modules.find(m => m.id === moduleId);
    const status = getModuleStatus(moduleId);
    const accessible = isModuleAccessible(index);

    // For instructor-led modules
    if (module?.requires_instructor_approval) {
      if (isInstructorModuleComplete(moduleId)) {
        return <CheckCircle className="h-5 w-5 text-leaf" />;
      }
      if (status === 'in_progress') {
        return <Users className="h-5 w-5 text-amber-500" />;
      }
      if (!accessible) {
        return <Lock className="h-5 w-5 text-muted-foreground/50" />;
      }
      return <Users className="h-5 w-5 text-muted-foreground" />;
    }

    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-leaf" />;
    }
    if (status === 'in_progress') {
      return <PlayCircle className="h-5 w-5 text-primary" />;
    }
    if (!accessible) {
      return <Lock className="h-5 w-5 text-muted-foreground/50" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const completedCount = modules.filter(m => {
    if (m.requires_instructor_approval) {
      return isInstructorModuleComplete(m.id);
    }
    return getModuleStatus(m.id) === 'completed';
  }).length;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-secondary/30">
        <h3 className="font-semibold text-foreground">Course Modules</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount} of {modules.length} completed
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
        <div className="p-2">
          {modules.map((module, index) => {
            const status = getModuleStatus(module.id);
            const accessible = isModuleAccessible(index);
            const isCurrent = module.id === currentModuleId;
            const isInstructorLed = module.requires_instructor_approval;
            const isMandatory = module.is_mandatory_for_certification;
            const completion = completions.find(c => c.module_id === module.id);
            const quizScore = module.has_quiz && status === 'completed' && completion?.quiz_score != null
              ? completion.quiz_score
              : null;
            const quizPassed = quizScore !== null && quizScore >= module.quiz_pass_mark;

            return (
              <button
                key={module.id}
                onClick={() => accessible && onModuleSelect(module.id)}
                disabled={!accessible}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-200 mb-1",
                  "flex items-start gap-3",
                  isCurrent && "bg-primary/10 border border-primary/20",
                  !isCurrent && accessible && "hover:bg-secondary/50",
                  !accessible && "opacity-50 cursor-not-allowed",
                  isInstructorLed && isCurrent && "bg-amber-500/10 border-amber-500/20"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(module.id, index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm line-clamp-2",
                    isCurrent ? "text-primary" : "text-foreground",
                    isInstructorLed && isCurrent && "text-amber-600"
                  )}>
                    {index + 1}. {module.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(module.duration_minutes)}
                    </span>
                    {module.has_quiz && (
                      <span className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">• Quiz</span>
                        {quizScore !== null && (
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0 rounded-full",
                            quizPassed
                              ? "bg-leaf/15 text-leaf"
                              : "bg-amber-500/15 text-amber-600"
                          )}>
                            {quizScore}%
                          </span>
                        )}
                      </span>
                    )}
                    {isInstructorLed && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        In-Person
                      </span>
                    )}
                    {isMandatory && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Required
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
