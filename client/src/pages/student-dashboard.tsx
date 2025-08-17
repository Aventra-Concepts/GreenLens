import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Calendar, 
  Download, 
  BookOpen, 
  Trophy, 
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  studentId: string;
  major: string;
  enrollmentDate: string;
  expectedGraduation: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  totalSavings: number;
  ebooksPurchased: number;
  gpaScore?: number;
  academicYear: string;
}

interface StudentPurchase {
  id: string;
  ebookTitle: string;
  originalPrice: number;
  finalPrice: number;
  studentDiscount: number;
  purchaseDate: string;
  downloadUrl: string;
  authorName: string;
}

interface ConversionStatus {
  daysUntilConversion: number;
  conversionDate: string;
  eligibleForExtension: boolean;
  reason: 'graduation' | 'time_limit' | 'none';
}

export default function StudentDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch student profile
  const { data: studentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/student/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/student/profile");
      return response.json();
    }
  });

  // Fetch student purchases
  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["/api/student/purchases"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/student/purchases");
      return response.json();
    }
  });

  // Fetch conversion status
  const { data: conversionStatus } = useQuery({
    queryKey: ["/api/student/conversion-status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/student/conversion-status");
      return response.json();
    }
  });

  // Request extension mutation
  const requestExtensionMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiRequest("POST", "/api/student/request-extension", { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Extension Requested",
        description: "Your extension request has been submitted for admin review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/conversion-status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit extension request.",
        variant: "destructive",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<StudentProfile>) => {
      const response = await apiRequest("PUT", "/api/student/profile", updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTimeProgress = () => {
    if (!studentProfile) return 0;
    
    const enrollmentDate = new Date(studentProfile.enrollmentDate);
    const now = new Date();
    const threeYearsFromEnrollment = new Date(enrollmentDate);
    threeYearsFromEnrollment.setFullYear(threeYearsFromEnrollment.getFullYear() + 3);
    
    const totalTime = threeYearsFromEnrollment.getTime() - enrollmentDate.getTime();
    const elapsedTime = now.getTime() - enrollmentDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {studentProfile?.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {studentProfile?.university} • {studentProfile?.major}
              </p>
            </div>
            <div className="ml-auto">
              {getStatusBadge(studentProfile?.verificationStatus || 'pending')}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger data-testid="tab-overview" value="overview">Overview</TabsTrigger>
            <TabsTrigger data-testid="tab-purchases" value="purchases">My E-books</TabsTrigger>
            <TabsTrigger data-testid="tab-savings" value="savings">Savings</TabsTrigger>
            <TabsTrigger data-testid="tab-profile" value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(studentProfile?.totalSavings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">10% student discount</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">E-books Purchased</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentProfile?.ebooksPurchased || 0}</div>
                  <p className="text-xs text-muted-foreground">Digital library</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentProfile?.academicYear || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Current year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <User className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    {studentProfile?.isActive ? 'Active Student' : 'Inactive'}
                  </div>
                  <p className="text-xs text-muted-foreground">Account status</p>
                </CardContent>
              </Card>
            </div>

            {/* Student Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Student Status Timeline
                </CardTitle>
                <CardDescription>
                  Track your enrollment progress and upcoming conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time as student</span>
                    <span>{Math.round(calculateTimeProgress())}% of 3-year limit</span>
                  </div>
                  <Progress value={calculateTimeProgress()} className="w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Enrolled:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(studentProfile?.enrollmentDate || '')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Expected Graduation:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(studentProfile?.expectedGraduation || '')}
                    </p>
                  </div>
                </div>

                {conversionStatus && conversionStatus.daysUntilConversion > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        Upcoming Conversion Notice
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                      Your student status will be converted to a regular user account in {conversionStatus.daysUntilConversion} days 
                      ({formatDate(conversionStatus.conversionDate)}).
                    </p>
                    {conversionStatus.eligibleForExtension && (
                      <Button
                        data-testid="button-request-extension"
                        onClick={() => requestExtensionMutation.mutate("Need more time to complete studies")}
                        disabled={requestExtensionMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="bg-white dark:bg-gray-800"
                      >
                        Request 1-Year Extension
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My E-book Library
                </CardTitle>
                <CardDescription>
                  Access your purchased e-books and download them anytime
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchasesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
                  </div>
                ) : purchases?.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No e-books yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start building your digital library with our comprehensive gardening guides.
                    </p>
                    <Button data-testid="button-browse-ebooks" onClick={() => window.location.href = '/shop'}>
                      Browse E-books
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases?.map((purchase: StudentPurchase) => (
                      <div key={purchase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {purchase.ebookTitle}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              by {purchase.authorName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Purchased on {formatDate(purchase.purchaseDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="line-through text-gray-500">{formatCurrency(purchase.originalPrice)}</span>
                              <span className="ml-2 font-semibold text-green-600">{formatCurrency(purchase.finalPrice)}</span>
                            </div>
                            <div className="text-xs text-green-600">
                              Saved {formatCurrency(purchase.studentDiscount)}
                            </div>
                            <Button
                              data-testid={`button-download-${purchase.id}`}
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(purchase.downloadUrl, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
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

          {/* Savings Tab */}
          <TabsContent value="savings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Student Savings Summary
                </CardTitle>
                <CardDescription>
                  Track the money you've saved with your student discount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatCurrency(studentProfile?.totalSavings || 0)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">10%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Discount Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {studentProfile?.ebooksPurchased || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Books Purchased</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Student Benefits
                    </span>
                  </div>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• 10% automatic discount on all e-book purchases</li>
                    <li>• Verified student status ensures eligibility</li>
                    <li>• Savings tracked and displayed in your dashboard</li>
                    <li>• Available until graduation or 3-year limit</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Profile
                </CardTitle>
                <CardDescription>
                  View and update your academic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{studentProfile?.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{studentProfile?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{studentProfile?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{studentProfile?.studentId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">University</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{studentProfile?.university}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Major</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{studentProfile?.major}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Enrollment Date</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(studentProfile?.enrollmentDate || '')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Graduation</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(studentProfile?.expectedGraduation || '')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Verification Status</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current verification status of your student account
                      </p>
                    </div>
                    {getStatusBadge(studentProfile?.verificationStatus || 'pending')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}