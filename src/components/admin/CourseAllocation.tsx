import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCourseAllocations } from '@/hooks/useCourseAllocations';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import { toast } from 'sonner';
import { sendCourseAllocationEmail } from '@/lib/emailWorkflows';
import { Loader2, Plus, Trash2, Users, User, Building2, BookOpen, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function CourseAllocation() {
  const { allocations, users, smes, loading, allocateCourse, removeAllocation } = useCourseAllocations();
  const { courses } = useAdminCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allocationType, setAllocationType] = useState<'user' | 'sme'>('user');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'sme'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAllocate = async () => {
    if (!selectedCourse || !selectedTarget) {
      toast.error('Please select a course and target');
      return;
    }

    setIsSubmitting(true);
    const { error } = await allocateCourse(
      selectedCourse,
      allocationType,
      selectedTarget,
      expiresAt || undefined
    );

    if (error) {
      if (error.message?.includes('duplicate')) {
        toast.error('This course is already allocated to this target');
      } else {
        toast.error('Failed to allocate course');
      }
    } else {
      toast.success('Course allocated successfully');
      // Send email notification if allocating to a user
      if (allocationType === 'user') {
        const targetUser = users.find(u => u.user_id === selectedTarget);
        const course = courses.find(c => c.id === selectedCourse);
        if (targetUser?.email && course) {
          sendCourseAllocationEmail({
            email: targetUser.email,
            userName: targetUser.full_name || targetUser.email,
            courseId: course.id,
            courseTitle: course.title,
            courseDescription: course.description || undefined,
            allocatedBy: 'Admin',
            dueDate: expiresAt || undefined,
          }).catch(console.error);
        }
      }
      setIsDialogOpen(false);
      resetForm();
    }
    setIsSubmitting(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await removeAllocation(id);
    if (error) {
      toast.error('Failed to remove allocation');
    } else {
      toast.success('Allocation removed');
    }
  };

  const resetForm = () => {
    setSelectedCourse('');
    setSelectedTarget('');
    setExpiresAt('');
    setAllocationType('user');
  };

  const filteredAllocations = allocations.filter(a => {
    const matchesSearch = 
      a.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sme_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || a.allocation_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Course Allocations</h2>
          <p className="text-muted-foreground">Assign courses to individual users or SMEs</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="forest">
              <Plus className="h-4 w-4 mr-2" />
              Allocate Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Allocate Course</DialogTitle>
              <DialogDescription>
                Assign a course to a user or SME organization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <Tabs value={allocationType} onValueChange={(v) => {
                setAllocationType(v as 'user' | 'sme');
                setSelectedTarget('');
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user">
                    <User className="h-4 w-4 mr-2" />
                    User
                  </TabsTrigger>
                  <TabsTrigger value="sme">
                    <Building2 className="h-4 w-4 mr-2" />
                    SME
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {allocationType === 'user' ? (
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name || user.email || 'Unknown User'}
                          {user.company_name && ` (${user.company_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>SME Organization</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an SME" />
                    </SelectTrigger>
                    <SelectContent>
                      {smes.map(sme => (
                        <SelectItem key={sme.sme_id} value={sme.sme_id}>
                          {sme.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="forest"
                  className="flex-1"
                  onClick={handleAllocate}
                  disabled={isSubmitting || !selectedCourse || !selectedTarget}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Allocate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allocations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">Users Only</SelectItem>
                <SelectItem value="sme">SMEs Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No allocations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Allocated To</TableHead>
                    <TableHead>Allocated On</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">
                        {allocation.course?.title || 'Unknown Course'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={allocation.allocation_type === 'user' ? 'default' : 'secondary'}>
                          {allocation.allocation_type === 'user' ? (
                            <><User className="h-3 w-3 mr-1" /> User</>
                          ) : (
                            <><Building2 className="h-3 w-3 mr-1" /> SME</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {allocation.allocation_type === 'user' ? (
                          <span>{allocation.profile?.full_name || allocation.profile?.email || 'Unknown'}</span>
                        ) : (
                          <span>{allocation.sme_id}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(allocation.allocated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {allocation.expires_at ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(allocation.expires_at), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(allocation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
