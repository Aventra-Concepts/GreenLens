import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  UserPlus, 
  Users, 
  Building, 
  TrendingUp, 
  Activity,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from "lucide-react";

interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  isActive: boolean;
  salary?: number;
  phoneNumber?: string;
  managerId?: string;
  managerName?: string;
}

interface OnboardingForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  position: string;
  salary: string;
  phoneNumber: string;
  managerId: string;
  permissions: string[];
}

export default function EmployeeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [onboardingForm, setOnboardingForm] = useState<OnboardingForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "",
    position: "",
    salary: "",
    phoneNumber: "",
    managerId: "",
    permissions: []
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/admin/employees"],
  });

  // Fetch department stats
  const { data: departmentStats } = useQuery({
    queryKey: ["/api/admin/employees/department-stats"],
  });

  // Fetch employee hierarchy
  const { data: hierarchy } = useQuery({
    queryKey: ["/api/admin/employees/hierarchy"],
  });

  // Onboard employee mutation
  const onboardMutation = useMutation({
    mutationFn: async (data: OnboardingForm) => {
      const response = await apiRequest('POST', '/api/admin/employees/onboard', {
        ...data,
        salary: parseFloat(data.salary) || undefined
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      setShowOnboarding(false);
      setOnboardingForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        department: "",
        position: "",
        salary: "",
        phoneNumber: "",
        managerId: "",
        permissions: []
      });
      toast({
        title: "Employee Onboarded",
        description: "New employee has been successfully onboarded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Onboarding Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest('PUT', `/api/admin/employees/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated",
      });
    },
  });

  // Terminate employee mutation
  const terminateMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/admin/employees/${id}/terminate`, {
        terminationDate: new Date().toISOString(),
        reason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Employee Terminated",
        description: "Employee has been terminated",
      });
    },
  });

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onboardMutation.mutate(onboardingForm);
  };

  const handleInputChange = (field: keyof OnboardingForm, value: string | string[]) => {
    setOnboardingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const departments = ["Engineering", "Marketing", "Sales", "Support", "HR", "Finance", "Operations"];
  const positions = ["Manager", "Senior Developer", "Developer", "Analyst", "Specialist", "Coordinator"];
  const permissions = ["admin", "moderator", "analytics", "user_management", "content_management"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-gray-600">Manage employees, roles, and organizational structure</p>
        </div>
        <Button
          onClick={() => setShowOnboarding(true)}
          className="flex items-center gap-2"
          data-testid="add-employee-button"
        >
          <UserPlus className="w-4 h-4" />
          Onboard Employee
        </Button>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Employee List */}
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                Manage employee accounts and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48" />
                        <div className="h-3 bg-gray-200 rounded w-32" />
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      data-testid={`employee-${employee.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <Badge variant={employee.isActive ? "default" : "secondary"}>
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {employee.email}
                              </span>
                              {employee.phoneNumber && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {employee.phoneNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span>{employee.position} • {employee.department}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Joined {new Date(employee.hireDate).toLocaleDateString()}
                              </span>
                              {employee.salary && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {employee.salary.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {employee.managerName && (
                              <div className="text-xs text-gray-500">
                                Reports to: {employee.managerName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployee(employee)}
                          data-testid={`edit-employee-${employee.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateMutation.mutate({ 
                            id: employee.id, 
                            reason: "Administrative termination" 
                          })}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`terminate-employee-${employee.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Overview */}
        <TabsContent value="departments">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats ? Object.entries(departmentStats).map(([dept, stats]: [string, any]) => (
              <Card key={dept}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {dept}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Employees:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className="font-semibold text-green-600">{stats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terminated:</span>
                      <span className="font-semibold text-red-600">{stats.terminated}</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">Positions:</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.positions.map((position: string) => (
                          <Badge key={position} variant="outline" className="text-xs">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                Loading department statistics...
              </div>
            )}
          </div>
        </TabsContent>

        {/* Organizational Hierarchy */}
        <TabsContent value="hierarchy">
          <Card>
            <CardHeader>
              <CardTitle>Organizational Hierarchy</CardTitle>
              <CardDescription>
                View reporting structure and management levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Organizational hierarchy visualization coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Employee analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Performance tracking coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Employee Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>Employee Onboarding</CardTitle>
              <CardDescription>
                Add a new employee and set up their account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={onboardingForm.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      data-testid="employee-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={onboardingForm.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      data-testid="employee-last-name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={onboardingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    data-testid="employee-email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={onboardingForm.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    data-testid="employee-password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={onboardingForm.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger data-testid="employee-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={onboardingForm.position}
                      onValueChange={(value) => handleInputChange("position", value)}
                    >
                      <SelectTrigger data-testid="employee-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Salary (optional)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={onboardingForm.salary}
                      onChange={(e) => handleInputChange("salary", e.target.value)}
                      placeholder="50000"
                      data-testid="employee-salary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                    <Input
                      id="phoneNumber"
                      value={onboardingForm.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      data-testid="employee-phone"
                    />
                  </div>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {permissions.map((permission) => (
                      <label key={permission} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onboardingForm.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange("permissions", [...onboardingForm.permissions, permission]);
                            } else {
                              handleInputChange("permissions", onboardingForm.permissions.filter(p => p !== permission));
                            }
                          }}
                          data-testid={`permission-${permission}`}
                        />
                        <Badge variant="outline">{permission}</Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOnboarding(false)}
                    data-testid="cancel-onboarding"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={onboardMutation.isPending}
                    data-testid="submit-onboarding"
                  >
                    {onboardMutation.isPending ? "Onboarding..." : "Onboard Employee"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}