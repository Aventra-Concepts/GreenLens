import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  Download,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle,
  User
} from "lucide-react";
import { Link } from "wouter";

interface StudentDashboardData {
  profile: {
    id: string;
    studentId: string;
    universityName: string;
    degreeProgram: string;
    yearOfStudy: number;
    verificationStatus: string;
    discountPercentage: string;
    submittedAt: string;
    verifiedAt?: string;
    expiresAt?: string;
  };
  purchasedEbooks: Array<{
    id: string;
    title: string;
    originalPrice: number;
    discountedPrice: number;
    purchasedAt: string;
    downloadUrl: string;
  }>;
  totalSavings: number;
  conversionInfo?: {
    scheduledFor: string;
    daysRemaining: number;
    isEligible: boolean;
  };
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery<StudentDashboardData>({
    queryKey: ["/api/student/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/student/dashboard");
      return response.json();
    },
    enabled: !!user
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="container-no-auth">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to access your student dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="container-loading">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!dashboardData?.profile) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="container-no-profile">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Student Dashboard
            </CardTitle>
            <CardDescription>
              You haven't submitted a student verification application yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student-verification">
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-start-verification">
                Start Student Verification
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, purchasedEbooks, totalSavings, conversionInfo } = dashboardData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="container-student-dashboard">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2" data-testid="heading-dashboard">
          Student Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300" data-testid="text-welcome">
          Welcome back, {user.firstName}! Here's your student account overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-verification-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(profile.verificationStatus)}
              <Badge className={getStatusColor(profile.verificationStatus)} data-testid="badge-status">
                {profile.verificationStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-discount-rate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Student Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-green-600" data-testid="text-discount-percentage">
                {profile.discountPercentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-savings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600" data-testid="text-total-savings">
                ${totalSavings.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-purchased-ebooks">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              E-books Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold" data-testid="text-ebooks-count">
                {purchasedEbooks.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" data-testid="tabs-dashboard">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="ebooks" data-testid="tab-ebooks">My E-books</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="conversion" data-testid="tab-conversion">Account Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Academic Progress */}
          <Card data-testid="card-academic-progress">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Year</Label>
                  <p className="text-lg font-semibold" data-testid="text-current-year">
                    {profile.yearOfStudy} of {profile.degreeProgram}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">University</Label>
                  <p className="text-lg font-semibold" data-testid="text-university">
                    {profile.universityName}
                  </p>
                </div>
              </div>
              
              {/* Progress bar for year of study */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((profile.yearOfStudy / 4) * 100)}%</span>
                </div>
                <Progress value={(profile.yearOfStudy / 4) * 100} className="h-2" data-testid="progress-academic" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.verifiedAt && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium" data-testid="text-verified-date">
                        Student verification approved
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(profile.verifiedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium" data-testid="text-application-submitted">
                      Application submitted
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(profile.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ebooks" className="space-y-6">
          <Card data-testid="card-ebooks-list">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My E-books ({purchasedEbooks.length})
              </CardTitle>
              <CardDescription>
                All your purchased e-books with student discount applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchasedEbooks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4" data-testid="text-no-ebooks">
                    You haven't purchased any e-books yet.
                  </p>
                  <Link href="/shop">
                    <Button data-testid="button-browse-ebooks">Browse E-books</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchasedEbooks.map((ebook) => (
                    <div 
                      key={ebook.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`ebook-item-${ebook.id}`}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`ebook-title-${ebook.id}`}>
                          {ebook.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <span>
                            Purchased: {new Date(ebook.purchasedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="line-through">${ebook.originalPrice}</span>
                            <span className="text-green-600 font-semibold">
                              ${ebook.discountedPrice}
                            </span>
                            <Badge variant="outline" className="text-green-600">
                              Saved ${(ebook.originalPrice - ebook.discountedPrice).toFixed(2)}
                            </Badge>
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(ebook.downloadUrl, '_blank')}
                        data-testid={`button-download-${ebook.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card data-testid="card-profile-details">
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
              <CardDescription>
                Your academic and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Student ID
                  </Label>
                  <p className="font-semibold" data-testid="text-student-id">{profile.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    University
                  </Label>
                  <p className="font-semibold" data-testid="text-profile-university">{profile.universityName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Degree Program
                  </Label>
                  <p className="font-semibold" data-testid="text-degree-program">{profile.degreeProgram}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Year of Study
                  </Label>
                  <p className="font-semibold" data-testid="text-year-of-study">{profile.yearOfStudy}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/student-verification">
                  <Button variant="outline" data-testid="button-update-profile">
                    Update Profile Information
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card data-testid="card-conversion-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Status & Conversion
              </CardTitle>
              <CardDescription>
                Information about your student account status and upcoming conversion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conversionInfo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Conversion Scheduled
                      </h4>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300" data-testid="text-conversion-date">
                      Your student account will be converted to a regular account on{' '}
                      {new Date(conversionInfo.scheduledFor).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1" data-testid="text-days-remaining">
                      ({conversionInfo.daysRemaining} days remaining)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Graduation Status
                      </Label>
                      <p className="font-semibold" data-testid="text-graduation-status">
                        {conversionInfo.isEligible ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Account Type After Conversion
                      </Label>
                      <p className="font-semibold" data-testid="text-post-conversion-type">Regular User</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Active Student Account
                    </h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300" data-testid="text-active-status">
                    Your student account is active and in good standing.
                  </p>
                </div>
              )}
              
              {profile.expiresAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Student Status Expires
                  </Label>
                  <p className="font-semibold" data-testid="text-expires-at">
                    {new Date(profile.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}