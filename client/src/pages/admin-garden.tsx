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
  RefreshCw
} from "lucide-react";

interface AdminGardenUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  createdAt: string;
  subscriptionStatus?: string;
  totalPlants: number;
  totalIdentifications: number;
  lastActive: string;
  gardenLevel: number;
  experiencePoints: number;
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
  const { data: gardenAnalytics, isLoading: analyticsLoading } = useQuery<GardenAnalytics>({
    queryKey: ['/api/admin/garden-analytics'],
  });

  const refreshData = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/garden-users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/garden-analytics'] });
      if (selectedUser) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/garden-user-data', selectedUser] });
      }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Garden Users
              </CardTitle>
              <div className="space-y-3">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger>
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
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-3 bg-gray-50 border-b text-sm text-gray-600">
                Showing {filteredUsers.length} users {filterBy !== 'all' ? `(${filterBy})` : ''}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No users found</p>
                    <p className="text-sm">Try changing your filter or search term</p>
                  </div>
                ) : null}
                {(filteredUsers as AdminGardenUser[]).map((user: AdminGardenUser) => (
                  <div
                    key={user.id}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedUser === user.id ? 'bg-green-50 border-green-200' : ''
                    }`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImageUrl || ''} />
                        <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.totalPlants} plants
                          </Badge>
                          {user.subscriptionStatus === 'active' && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Premium
                            </Badge>
                          )}
                          {user.subscriptionStatus === 'trialing' && (
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              Trial
                            </Badge>
                          )}
                          {(!user.subscriptionStatus || user.subscriptionStatus === 'free') && (
                            <Badge variant="outline" className="text-xs">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected User Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedUser ? 'User Garden Details' : 'Select a User'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedUser ? (
                <div className="text-center py-12">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a user from the list to view their garden details</p>
                </div>
              ) : gardenLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p>Loading user garden data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* User Info Section */}
                  {userGardenData?.user && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">User Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="font-medium">{new Date(userGardenData.user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Subscription</p>
                          <Badge className={userGardenData.user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {userGardenData.user.subscriptionStatus || 'Free'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Garden Level</p>
                          <p className="font-medium">Level {userGardenData.user.gardenLevel || 1}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Experience Points</p>
                          <p className="font-medium">{userGardenData.user.experiencePoints || 0} XP</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Garden Features Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Health Predictions */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                          <Brain className="h-4 w-4" />
                          AI Health Predictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Overall Health:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {userGardenData?.healthPredictions?.overallHealth || 'Good'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Disease Risk:</span>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {userGardenData?.healthPredictions?.diseaseRisk || 'Low'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Based on {userGardenData?.totalPlants || 0} plants analyzed
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievement System */}
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
                          <Trophy className="h-4 w-4" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Level:</span>
                          <span className="font-bold text-yellow-600">
                            {userGardenData?.achievements?.level || 1}
                          </span>
                        </div>
                        <Progress value={userGardenData?.achievements?.progress || 65} className="h-2" />
                        <div className="grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <Trophy className="h-3 w-3 mx-auto text-gold-500" />
                            <span>{userGardenData?.achievements?.badges || 0}</span>
                          </div>
                          <div>
                            <Target className="h-3 w-3 mx-auto text-blue-500" />
                            <span>{userGardenData?.achievements?.goals || 0}</span>
                          </div>
                          <div>
                            <Star className="h-3 w-3 mx-auto text-purple-500" />
                            <span>{userGardenData?.achievements?.points || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Plants List */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      User's Plants ({userGardenData?.plants?.length || 0})
                    </h3>
                    {userGardenData?.plants && userGardenData.plants.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {userGardenData.plants.map((plant: PlantData, index: number) => (
                          <Card key={plant.id || index} className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {plant.primaryCommonName || 'Unknown Plant'}
                                </p>
                                <p className="text-xs text-gray-500 italic">
                                  {plant.species || 'Species unknown'}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-xs">
                                  {plant.confidence || '85'}%
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Leaf className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No plants identified yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}