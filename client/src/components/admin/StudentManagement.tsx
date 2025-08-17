import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  GraduationCap,
  Calendar,
  FileText,
  Search,
  Filter,
  UserPlus,
  Settings
} from "lucide-react";

interface StudentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  universityName: string;
  degreeProgram: string;
  yearOfStudy: number;
  verificationStatus: string;
  submittedAt: string;
  verifiedAt?: string;
  adminNotes?: string;
  conversionScheduledFor?: string;
  isActive: boolean;
  isConverted: boolean;
}

interface ConversionStats {
  totalStudents: number;
  activeStudents: number;
  convertedStudents: number;
  eligibleForConversion: number;
  extensionsGranted: number;
}

export default function StudentManagement() {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    university: ''
  });
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch students with filters
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/admin/students", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.university) params.append('university', filters.university);
      
      const response = await apiRequest("GET", `/api/admin/students?${params}`);
      return response.json();
    }
  });

  // Fetch conversion statistics
  const { data: stats } = useQuery<ConversionStats>({
    queryKey: ["/api/admin/students/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/students/stats");
      return response.json();
    }
  });

  // Fetch students eligible for conversion
  const { data: eligibleStudents } = useQuery({
    queryKey: ["/api/admin/students/eligible-conversion"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/students/eligible-conversion");
      return response.json();
    }
  });

  // Update verification status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ studentId, status, notes }: { studentId: string; status: string; notes?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/students/${studentId}/status`, {
        verificationStatus: status,
        adminNotes: notes
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Student verification status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students/stats"] });
      setSelectedStudent(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update student status.",
        variant: "destructive",
      });
    }
  });

  // Extend student status mutation
  const extendStatusMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest("POST", `/api/admin/students/${studentId}/extend`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Extended",
        description: "Student status has been extended by 1 year.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Extension Failed",
        description: error.message || "Failed to extend student status.",
        variant: "destructive",
      });
    }
  });

  // Convert student mutation
  const convertStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest("POST", `/api/admin/students/${studentId}/convert`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student Converted",
        description: "Student has been successfully converted to a regular user.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students/eligible-conversion"] });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert student.",
        variant: "destructive",
      });
    }
  });

  // Mark as graduated mutation
  const graduateMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest("POST", `/api/admin/students/${studentId}/graduate`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student Graduated",
        description: "Student has been marked as graduated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to mark student as graduated.",
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="container-student-management">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-student-management">Student Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage student verifications, conversions, and lifecycle
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card data-testid="card-total-students">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Students</p>
                  <p className="text-xl font-bold" data-testid="text-total-students">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-students">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Active</p>
                  <p className="text-xl font-bold" data-testid="text-active-students">{stats.activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-converted-students">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Converted</p>
                  <p className="text-xl font-bold" data-testid="text-converted-students">{stats.convertedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-eligible-conversion">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Eligible</p>
                  <p className="text-xl font-bold" data-testid="text-eligible-conversion">{stats.eligibleForConversion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-extensions-granted">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Extensions</p>
                  <p className="text-xl font-bold" data-testid="text-extensions-granted">{stats.extensionsGranted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>
          <TabsTrigger value="conversions" data-testid="tab-conversions">Conversions</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Filters */}
          <Card data-testid="card-filters">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search Students</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or student ID"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                      data-testid="input-search-students"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>University</Label>
                  <Input
                    placeholder="Filter by university"
                    value={filters.university}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                    data-testid="input-university-filter"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card data-testid="card-students-list">
            <CardHeader>
              <CardTitle>Student Applications</CardTitle>
              <CardDescription>
                Review and manage student verification applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : students?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300" data-testid="text-no-students">
                    No student applications found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students?.map((student: StudentUser) => (
                    <div 
                      key={student.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      data-testid={`student-item-${student.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold" data-testid={`student-name-${student.id}`}>
                              {student.firstName} {student.lastName}
                            </h4>
                            <Badge className={getStatusColor(student.verificationStatus)}>
                              {getStatusIcon(student.verificationStatus)}
                              <span className="ml-1" data-testid={`student-status-${student.id}`}>
                                {student.verificationStatus.replace('_', ' ').toUpperCase()}
                              </span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span data-testid={`student-email-${student.id}`}>{student.email}</span>
                            <span data-testid={`student-university-${student.id}`}>{student.universityName}</span>
                            <span data-testid={`student-submitted-${student.id}`}>
                              Submitted: {new Date(student.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {student.adminNotes && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2" data-testid={`student-notes-${student.id}`}>
                              <strong>Notes:</strong> {student.adminNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedStudent(student)}
                                data-testid={`button-review-${student.id}`}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Student Application</DialogTitle>
                                <DialogDescription>
                                  {selectedStudent?.firstName} {selectedStudent?.lastName} - {selectedStudent?.universityName}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedStudent && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label className="font-medium">Email:</Label>
                                      <p data-testid="review-email">{selectedStudent.email}</p>
                                    </div>
                                    <div>
                                      <Label className="font-medium">University:</Label>
                                      <p data-testid="review-university">{selectedStudent.universityName}</p>
                                    </div>
                                    <div>
                                      <Label className="font-medium">Degree:</Label>
                                      <p data-testid="review-degree">{selectedStudent.degreeProgram}</p>
                                    </div>
                                    <div>
                                      <Label className="font-medium">Year:</Label>
                                      <p data-testid="review-year">{selectedStudent.yearOfStudy}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Admin Notes</Label>
                                    <Textarea
                                      placeholder="Add notes about this application..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      data-testid="textarea-review-notes"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateStatusMutation.mutate({
                                        studentId: selectedStudent.id,
                                        status: 'verified',
                                        notes: reviewNotes
                                      })}
                                      disabled={updateStatusMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid="button-approve"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => updateStatusMutation.mutate({
                                        studentId: selectedStudent.id,
                                        status: 'rejected',
                                        notes: reviewNotes
                                      })}
                                      disabled={updateStatusMutation.isPending}
                                      variant="destructive"
                                      data-testid="button-reject"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => updateStatusMutation.mutate({
                                        studentId: selectedStudent.id,
                                        status: 'under_review',
                                        notes: reviewNotes
                                      })}
                                      disabled={updateStatusMutation.isPending}
                                      variant="outline"
                                      data-testid="button-under-review"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Under Review
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {student.verificationStatus === 'verified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => extendStatusMutation.mutate(student.id)}
                              disabled={extendStatusMutation.isPending}
                              data-testid={`button-extend-${student.id}`}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Extend
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          <Card data-testid="card-eligible-students">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Students Eligible for Conversion
              </CardTitle>
              <CardDescription>
                Students who have completed their education or exceeded the 3-year limit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleStudents?.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300" data-testid="text-no-eligible">
                    No students are currently eligible for conversion.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eligibleStudents?.map((student: StudentUser) => (
                    <div 
                      key={student.id} 
                      className="border rounded-lg p-4"
                      data-testid={`eligible-student-${student.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold" data-testid={`eligible-name-${student.id}`}>
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {student.universityName} - {student.degreeProgram}
                          </p>
                          {student.conversionScheduledFor && (
                            <p className="text-sm text-orange-600 dark:text-orange-400" data-testid={`conversion-date-${student.id}`}>
                              Conversion scheduled: {new Date(student.conversionScheduledFor).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => graduateMutation.mutate(student.id)}
                            disabled={graduateMutation.isPending}
                            variant="outline"
                            size="sm"
                            data-testid={`button-graduate-${student.id}`}
                          >
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Mark Graduated
                          </Button>
                          <Button
                            onClick={() => extendStatusMutation.mutate(student.id)}
                            disabled={extendStatusMutation.isPending}
                            variant="outline"
                            size="sm"
                            data-testid={`button-extend-eligible-${student.id}`}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Extend 1 Year
                          </Button>
                          <Button
                            onClick={() => convertStudentMutation.mutate(student.id)}
                            disabled={convertStudentMutation.isPending}
                            size="sm"
                            data-testid={`button-convert-${student.id}`}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Convert Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-verification-stats">
              <CardHeader>
                <CardTitle>Verification Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Applications</span>
                      <span className="font-bold" data-testid="stat-total-applications">{stats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Students</span>
                      <span className="font-bold" data-testid="stat-active-percentage">
                        {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate</span>
                      <span className="font-bold" data-testid="stat-conversion-rate">
                        {stats.totalStudents > 0 ? Math.round((stats.convertedStudents / stats.totalStudents) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-extension-stats">
              <CardHeader>
                <CardTitle>Extension Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Extensions Granted</span>
                      <span className="font-bold" data-testid="stat-extensions-total">{stats.extensionsGranted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eligible for Conversion</span>
                      <span className="font-bold" data-testid="stat-eligible-total">{stats.eligibleForConversion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Extension Rate</span>
                      <span className="font-bold" data-testid="stat-extension-rate">
                        {stats.activeStudents > 0 ? Math.round((stats.extensionsGranted / stats.activeStudents) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}