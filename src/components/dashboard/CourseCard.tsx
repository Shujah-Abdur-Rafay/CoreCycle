import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Enrollment } from "@/hooks/useEnrollments";
import { 
  Clock, 
  PlayCircle, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface CourseCardProps {
  enrollment: Enrollment;
}

export function CourseCard({ enrollment }: CourseCardProps) {
  const { course, status, progress_percentage, time_spent_minutes } = enrollment;

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-leaf/10 text-leaf border-leaf/20">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-leaf" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-leaf/20 relative">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-30">🌿</div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          {course.title}
        </h3>
        
        {course.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.short_description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{course.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {getStatusIcon()}
              <span>{progress_percentage}%</span>
            </div>
          </div>

          <Progress value={progress_percentage} className="h-2" />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {time_spent_minutes > 0 
                ? `${time_spent_minutes} min spent` 
                : 'Not started'}
            </span>
            <Link to={`/course/${course.id}`}>
              <Button variant="ghost" size="sm">
                {status === 'completed' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
