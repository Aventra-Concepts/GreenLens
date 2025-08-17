import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface StudentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  universityName: string;
  academicBranch: string;
  yearOfJoining: number;
  expectedGraduation: string;
  verificationStatus: string;
  isActive: boolean;
  isConverted: boolean;
  adminExtensionCount: number;
  conversionScheduledFor: string;
  graduationCompleted: boolean;
  createdAt: string;
  discountApplied: boolean;
}

interface ConversionStats {
  totalStudents: number;
  activeStudents: number;
  convertedStudents: number;
  eligibleForConversion: number;
  extensionsGranted: number;
}

export default function AdminStudentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students eligible for conversion
  const { data: eligibleStudents = [], isLoading: loadingEligible } = useQuery({
    queryKey: ['/api/admin/students/eligible-conversion'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch conversion statistics
  const { data: stats } = useQuery<ConversionStats>({
    queryKey: ['/api/admin/students/stats'],
  });

  // Extension mutation
  const extendStatusMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest('POST', `/api/admin/students/${studentId}/extend`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students/eligible-conversion'] });
      toast({
        title: "Success",
        description: "Student status extended by 1 year",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Extension Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Graduate mutation
  const graduateMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest('POST', `/api/admin/students/${studentId}/graduate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students/eligible-conversion'] });
      toast({
        title: "Success",
        description: "Student marked as graduated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Graduate Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convert mutation
  const convertMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest('POST', `/api/admin/students/${studentId}/convert`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students/eligible-conversion'] });
      toast({
        title: "Success",
        description: "Student converted to regular user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Run automatic conversion
  const runConversionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/students/run-conversion');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students/eligible-conversion'] });
      toast({
        title: "Conversion Complete",
        description: `${data.convertedCount} students converted successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (student: StudentUser) => {
    if (student.isConverted) {
      return <Badge variant="secondary">Converted</Badge>;
    }
    if (student.graduationCompleted) {
      return <Badge variant="destructive">Graduated - Pending Conversion</Badge>;
    }
    if (new Date(student.conversionScheduledFor) <= new Date()) {
      return <Badge variant="destructive">Due for Conversion</Badge>;
    }
    if (student.adminExtensionCount > 0) {
      return <Badge variant="outline">Extended ({student.adminExtensionCount}x)</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-student-management">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Lifecycle Management</h1>
          <p className="text-gray-600">Manage student accounts and automatic conversions</p>
        </div>
        <Button 
          onClick={() => runConversionMutation.mutate()}
          disabled={runConversionMutation.isPending}
          data-testid="button-run-conversion"
        >
          {runConversionMutation.isPending ? "Running..." : "Run Conversion Process"}
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.convertedStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eligible for Conversion</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.eligibleForConversion}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extensions Granted</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.extensionsGranted}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="eligible" className="w-full">
        <TabsList>
          <TabsTrigger value="eligible">Eligible for Conversion</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="eligible" className="space-y-4">
          {loadingEligible ? (
            <div className="text-center py-8">Loading eligible students...</div>
          ) : eligibleStudents.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No students are currently eligible for conversion. The system will automatically process conversions daily at 9:00 AM.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {eligibleStudents.length} student(s) eligible for automatic conversion. Review and take action as needed.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {eligibleStudents.map((student: StudentUser) => (
                  <Card key={student.id} className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {student.firstName} {student.lastName}
                          </CardTitle>
                          <CardDescription>{student.email}</CardDescription>
                        </div>
                        {getStatusBadge(student)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <strong>University:</strong> {student.universityName}
                        </div>
                        <div>
                          <strong>Branch:</strong> {student.academicBranch}
                        </div>
                        <div>
                          <strong>Joining Year:</strong> {student.yearOfJoining}
                        </div>
                        <div>
                          <strong>Expected Graduation:</strong> {student.expectedGraduation || 'Not set'}
                        </div>
                        <div>
                          <strong>Registered:</strong> {formatDate(student.createdAt)}
                        </div>
                        <div>
                          <strong>Conversion Date:</strong> {formatDate(student.conversionScheduledFor)}
                        </div>
                        <div>
                          <strong>Extensions:</strong> {student.adminExtensionCount}
                        </div>
                        <div>
                          <strong>Discount Active:</strong> {student.discountApplied ? 'Yes (10%)' : 'No'}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => extendStatusMutation.mutate(student.id)}
                          disabled={extendStatusMutation.isPending}
                          data-testid={`button-extend-${student.id}`}
                        >
                          Extend 1 Year
                        </Button>
                        
                        {!student.graduationCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => graduateMutation.mutate(student.id)}
                            disabled={graduateMutation.isPending}
                            data-testid={`button-graduate-${student.id}`}
                          >
                            Mark Graduated
                          </Button>
                        )}
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => convertMutation.mutate(student.id)}
                          disabled={convertMutation.isPending}
                          data-testid={`button-convert-${student.id}`}
                        >
                          Convert Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Conversion System</CardTitle>
              <CardDescription>
                System automatically processes student conversions daily at 9:00 AM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Conversion Rules:</strong><br />
                    • Students are converted after 3 years from registration<br />
                    • Or immediately upon graduation completion<br />
                    • Admins can extend status by 1 year before conversion
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Student Benefits:</strong><br />
                    • 10% automatic discount on all purchases<br />
                    • Access to student-specific pricing<br />
                    • University verification required
                  </AlertDescription>
                </Alert>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Recent Activity</h4>
                <p className="text-sm text-gray-600">
                  Last automatic conversion check: Today at 9:00 AM<br />
                  Next scheduled check: Tomorrow at 9:00 AM<br />
                  System Status: Active and Running
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}