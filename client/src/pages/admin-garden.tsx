import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  Leaf,
  Calendar,
  TrendingUp,
  Shield,
  Brain,
  Trophy,
  User,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Activity,
  Share2,
  Heart,
  Award,
  Target,
  Star,
  BarChart3,
  RefreshCw,
  Eye,
  ExternalLink,
  Crown,
  Gift
} from "lucide-react";

interface AdminGardenUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  createdAt: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionPlanId?: string;
  totalPlants: number;
  totalIdentifications: number;
  lastActive: string;
  gardenLevel: number;
  experiencePoints: number;
  premium?: boolean;
  plantsThisMonth?: number;
  healthyPlants?: number;
  plantsNeedingCare?: number;
  achievements?: string[];
}

interface PlantData {
  id: string;
  species: string;
  primaryCommonName: string;
  confidence: string;
  createdAt: string;
  userId: string;
}

interface GardenAnalytics {
  totalUsers: number;
  totalPlants: number;
  premiumUsers: number;
  monthlyGrowth: string;
}

interface UserGardenData {
  user: AdminGardenUser;
  totalPlants: number;
  healthPredictions: {
    overallHealth: string;
    diseaseRisk: string;
  };
  achievements: {
    level: number;
    progress: number;
    badges: number;
    goals: number;
    points: number;
  };
  plants: PlantData[];
}

export default function AdminGardenPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState('all');

  // Fetch all garden users for admin overview
  const { data: gardenUsers = [], isLoading: usersLoading } = useQuery<AdminGardenUser[]>({
    queryKey: ['/api/admin/garden-users', filterBy],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch specific user's garden data
  const { data: userGardenData, isLoading: gardenLoading } = useQuery<UserGardenData>({
    queryKey: ['/api/admin/garden-user-data', selectedUser],
    enabled: !!selectedUser,
  });

  // Fetch garden analytics
  const { data: gardenAnalytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery<GardenAnalytics>({
    queryKey: ['/api/admin/garden-analytics'],
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache data
  });

  const refreshData = useMutation({
    mutationFn: async () => {
      // Force refetch analytics and users immediately
      await Promise.all([
        refetchAnalytics(),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/garden-users'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/garden-analytics'] })
      ]);
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Data Refreshed",
        description: "Garden dashboard data has been updated.",
      });
    },
  });

  const filteredUsers = gardenUsers.filter((user: AdminGardenUser) => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch; // Server-side filtering handles user type filtering
  });

  // Debug logging
  console.log('Garden users fetched:', gardenUsers.length);
  console.log('Filtered users:', filteredUsers.length);
  console.log('Filter by:', filterBy);
  console.log('Search term:', searchTerm);

  if (usersLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20 p-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading admin garden dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Garden Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and monitor user gardens across the platform
              </p>
            </div>
          </div>
          <Button
            onClick={() => refreshData.mutate()}
            disabled={refreshData.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshData.isPending ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{gardenAnalytics?.totalUsers || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Active garden users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Plants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{gardenAnalytics?.totalPlants || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Identified plants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{gardenAnalytics?.premiumUsers || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{gardenAnalytics?.monthlyGrowth || '0%'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">User growth rate</p>
            </CardContent>
          </Card>
        </div>

        {/* User Garden Dashboards Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                User Garden Dashboards
              </CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                    <SelectItem value="free">Free Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Access and manage all user garden dashboards - both free and premium subscribers
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Plants</TableHead>
                    <TableHead>Garden Level</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No users found</p>
                        <p className="text-sm text-gray-400">Try changing your filter or search term</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user: AdminGardenUser) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileImageUrl || ''} />
                              <AvatarFallback className="text-xs">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.subscriptionStatus === 'active' && (
                              <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            {user.subscriptionStatus === 'trialing' && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                <Gift className="h-3 w-3 mr-1" />
                                Trial
                              </Badge>
                            )}
                            {(!user.subscriptionStatus || user.subscriptionStatus === 'free') && (
                              <Badge variant="outline" className="text-xs">
                                Free
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{user.totalPlants || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Level {user.gardenLevel || 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(user.id)}
                                  className="text-xs flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View Garden</span>
                                  {user.subscriptionStatus === 'active' && (
                                    <Badge className="text-[10px] bg-yellow-400 text-yellow-900 px-1 py-0 h-4">Premium</Badge>
                                  )}
                                  {(!user.subscriptionStatus || user.subscriptionStatus === 'free') && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Free</Badge>
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-green-600" />
                                    {user.firstName}'s Garden Dashboard
                                  </DialogTitle>
                                </DialogHeader>
                                <UserGardenDashboard userId={user.id} />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/admin/user-garden/${user.id}`, '_blank')}
                              className="text-xs flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Full View</span>
                              {user.subscriptionStatus === 'active' && (
                                <Badge className="text-[10px] bg-yellow-400 text-yellow-900 px-1 py-0 h-4">Premium</Badge>
                              )}
                              {(!user.subscriptionStatus || user.subscriptionStatus === 'free') && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Free</Badge>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Showing {filteredUsers.length} of {gardenUsers.length} users</span>
                <span>
                  {gardenUsers.filter((u: AdminGardenUser) => u.subscriptionStatus === 'active').length} Premium • {' '}
                  {gardenUsers.filter((u: AdminGardenUser) => !u.subscriptionStatus || u.subscriptionStatus === 'free').length} Free
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// UserGardenDashboard Component for Modal View
function UserGardenDashboard({ userId }: { userId: string }) {
  const { data: userGardenData, isLoading: gardenLoading } = useQuery<UserGardenData>({
    queryKey: ['/api/admin/garden-user-data', userId],
    enabled: !!userId,
  });

  if (gardenLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Loading user garden data...</p>
      </div>
    );
  }

  if (!userGardenData) {
    return (
      <div className="text-center py-8">
        <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No garden data found for this user</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Garden Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Plants</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{userGardenData.totalPlants || 0}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Garden Level</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{userGardenData.achievements?.level || 1}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-600">Experience</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{userGardenData.achievements?.points || 0}</p>
        </div>
      </div>

      {/* Health Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-green-600" />
            Health Predictions
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall Health</span>
              <Badge className="bg-green-100 text-green-800">
                {userGardenData.healthPredictions?.overallHealth || 'Good'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disease Risk</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {userGardenData.healthPredictions?.diseaseRisk || 'Low'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-600" />
            Achievements
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Badges Earned</span>
              <span className="font-bold">{userGardenData.achievements?.badges || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Goals Completed</span>
              <span className="font-bold">{userGardenData.achievements?.goals || 0}</span>
            </div>
            <Progress value={userGardenData.achievements?.progress || 0} className="w-full" />
          </div>
        </div>
      </div>

      {/* Recent Plants */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          Recent Plant Identifications
        </h3>
        {userGardenData.plants && userGardenData.plants.length > 0 ? (
          <div className="space-y-3">
            {userGardenData.plants.slice(0, 5).map((plant: PlantData) => (
              <div key={plant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{plant.primaryCommonName || plant.species}</p>
                  <p className="text-sm text-gray-600">Confidence: {plant.confidence}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(plant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No plants identified yet</p>
        )}
      </div>
    </div>
  );
}