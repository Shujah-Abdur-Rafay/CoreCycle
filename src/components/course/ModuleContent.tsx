import { useState } from "react";
import { Module, ModuleCompletion } from "@/hooks/useModules";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  PlayCircle, 
  Users, 
  AlertTriangle,
  Lock,
  UserCheck
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ModuleContentProps {
  module: Module;
  completion?: ModuleCompletion;
  status: 'not_started' | 'in_progress' | 'completed';
  onComplete: () => void;
  onStartQuiz?: () => void;
  onConfirmAttendance?: (instructorName: string) => Promise<any>;
  onApproveInstructorModule?: () => Promise<any>;
}

export function ModuleContent({
  module,
  completion,
  status,
  onComplete,
  onStartQuiz,
  onConfirmAttendance,
  onApproveInstructorModule,
}: ModuleContentProps) {
  const [instructorName, setInstructorName] = useState("");
  const [approving, setApproving] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour ${mins} minutes` : `${hours} hour`;
  };

  const getVideoEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`;
    }
    
    // Handle Vimeo URLs
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Return as-is if already an embed URL or unknown format
    return url;
  };

  const handleConfirmAttendance = async () => {
    if (!instructorName.trim()) {
      toast.error("Please enter the instructor's name");
      return;
    }
    
    if (!onConfirmAttendance) return;
    
    setApproving(true);
    try {
      await onConfirmAttendance(instructorName.trim());
      toast.success("Attendance confirmed successfully!");
    } catch (error) {
      toast.error("Failed to confirm attendance");
    } finally {
      setApproving(false);
    }
  };

  const handleApproveModule = async () => {
    if (!onApproveInstructorModule) return;
    
    setApproving(true);
    try {
      await onApproveInstructorModule();
      toast.success("Module approved and completed!");
    } catch (error) {
      toast.error("Failed to approve module");
    } finally {
      setApproving(false);
    }
  };

  const isInstructorLed = module.requires_instructor_approval;
  const attendanceConfirmed = completion?.attendance_confirmed;
  const instructorApproved = completion?.instructor_approved;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(module.duration_minutes)}
          </Badge>
          {module.has_quiz && (
            <Badge variant="outline">Quiz Required</Badge>
          )}
          {isInstructorLed && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
              <Users className="h-3 w-3 mr-1" />
              Instructor-Led
            </Badge>
          )}
          {module.is_mandatory_for_certification && (
            <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Mandatory
            </Badge>
          )}
          {status === 'completed' && instructorApproved && (
            <Badge className="bg-leaf/10 text-leaf">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          {status === 'completed' && !isInstructorLed && (
            <Badge className="bg-leaf/10 text-leaf">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {module.title}
        </h1>

        {module.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {module.description}
          </p>
        )}
      </div>

      {/* Video Player */}
      {module.video_url && (
        <Card className="overflow-hidden">
          <div className="aspect-video bg-secondary">
            <iframe
              src={getVideoEmbedUrl(module.video_url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={module.title}
            />
          </div>
        </Card>
      )}

      {/* Module Content */}
      {module.content && (
        <Card>
          <CardContent className="p-6 lg:p-8">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:font-display prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: module.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Instructor-Led Module Approval Section */}
      {isInstructorLed && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Instructor Verification Required
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This module requires physical attendance and instructor confirmation. 
                    Complete the steps below with your instructor present.
                  </p>
                </div>
              </div>

              {/* Step 1: Attendance Confirmation */}
              <div className={`p-4 rounded-lg border ${attendanceConfirmed ? 'bg-leaf/5 border-leaf/30' : 'bg-muted/50 border-border'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {attendanceConfirmed ? (
                    <CheckCircle className="h-5 w-5 text-leaf" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs font-bold text-muted-foreground">1</div>
                  )}
                  <h4 className="font-medium text-foreground">Attendance Confirmation</h4>
                </div>
                
                {attendanceConfirmed ? (
                  <div className="ml-8 text-sm text-muted-foreground">
                    <p>✓ Attendance confirmed by <strong>{completion?.instructor_name}</strong></p>
                    <p className="text-xs mt-1">
                      Confirmed at: {new Date(completion?.attendance_confirmed_at || '').toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="ml-8 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Have your instructor enter their name to confirm your attendance:
                    </p>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor="instructor-name" className="text-sm">Instructor Name</Label>
                        <Input
                          id="instructor-name"
                          value={instructorName}
                          onChange={(e) => setInstructorName(e.target.value)}
                          placeholder="Enter instructor's full name"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleConfirmAttendance}
                        disabled={!instructorName.trim() || approving}
                        variant="outline"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Instructor Approval */}
              <div className={`p-4 rounded-lg border ${instructorApproved ? 'bg-leaf/5 border-leaf/30' : attendanceConfirmed ? 'bg-muted/50 border-border' : 'bg-muted/20 border-border opacity-60'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {instructorApproved ? (
                    <CheckCircle className="h-5 w-5 text-leaf" />
                  ) : (
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${attendanceConfirmed ? 'border-muted-foreground text-muted-foreground' : 'border-muted text-muted'}`}>2</div>
                  )}
                  <h4 className="font-medium text-foreground">Instructor Approval</h4>
                  {!attendanceConfirmed && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                
                {instructorApproved ? (
                  <div className="ml-8 text-sm text-muted-foreground">
                    <p>✓ Module approved and completed</p>
                    <p className="text-xs mt-1">
                      Approved at: {new Date(completion?.instructor_approved_at || '').toLocaleString()}
                    </p>
                  </div>
                ) : attendanceConfirmed ? (
                  <div className="ml-8 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Once all activities are completed, the instructor can approve this module:
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="forest" disabled={approving}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete & Approve Module
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Module Approval</AlertDialogTitle>
                          <AlertDialogDescription>
                            By approving this module, you confirm that the learner has:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Attended the full session</li>
                              <li>Participated in all activities</li>
                              <li>Completed and submitted their action planning worksheet</li>
                            </ul>
                            <p className="mt-3 font-medium text-foreground">
                              This action cannot be undone.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleApproveModule}>
                            Approve & Complete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <div className="ml-8 text-sm text-muted-foreground">
                    <p>Complete Step 1 first to unlock instructor approval.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standard Actions (non-instructor-led modules) */}
      {!isInstructorLed && (
        <Card className="bg-secondary/30 border-secondary">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {status === 'completed' 
                    ? 'Module Completed!' 
                    : module.has_quiz 
                      ? 'Ready to test your knowledge?' 
                      : 'Finished reviewing this module?'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {status === 'completed'
                    ? 'You can review this module anytime or continue to the next one.'
                    : module.has_quiz
                      ? `Complete the quiz to finish this module. Pass mark: ${module.quiz_pass_mark}%`
                      : 'Mark this module as complete to unlock the next one.'}
                </p>
              </div>

              {status !== 'completed' && (
                module.has_quiz && onStartQuiz ? (
                  <Button variant="forest" size="lg" onClick={onStartQuiz}>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Take Quiz
                  </Button>
                ) : (
                  <Button variant="forest" size="lg" onClick={onComplete}>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Mark Complete
                  </Button>
                )
              )}

              {status === 'completed' && (
                <Button variant="outline" size="lg" onClick={onComplete}>
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructor-led completed state */}
      {isInstructorLed && instructorApproved && (
        <Card className="bg-leaf/5 border-leaf/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-leaf" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Session Completed!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your attendance has been verified and this module is complete.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="lg" onClick={onComplete}>
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
