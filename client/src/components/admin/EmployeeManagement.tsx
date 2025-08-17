import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Building, 
  User, 
  Calendar, 
  DollarSign,
  Phone,
  Mail,
  Shield,
  Users,
  Search,
  Filter,
  Download
} from "lucide-react";

interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  terminationDate?: string;
  isActive: boolean;
  phoneNumber?: string;
  skills: string[];
  certifications: string[];
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export default function EmployeeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    firstName: "",
    lastName: "",
    department: "",
    position: "",
    salary: "",
    hireDate: "",
    phoneNumber: "",
    skills: "",
    certifications: ""
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/admin/employees"],
  });

  // Fetch roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await apiRequest('POST', '/api/admin/employees', employeeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      setIsAddDialogOpen(false);
      setNewEmployee({
        email: "",
        firstName: "",
        lastName: "",
        department: "",
        position: "",
        salary: "",
        hireDate: "",
        phoneNumber: "",
        skills: "",
        certifications: ""
      });
      toast({
        title: "Employee Added",
        description: "New employee has been successfully added",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    }
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/admin/employees/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  });

  // Deactivate employee mutation
  const deactivateEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await apiRequest('PATCH', `/api/admin/employees/${employeeId}`, {
        isActive: false,
        terminationDate: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      toast({
        title: "Employee Deactivated",
        description: "Employee has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate employee",
        variant: "destructive",
      });
    }
  });

  const handleAddEmployee = () => {
    const employeeData = {
      ...newEmployee,
      salary: parseFloat(newEmployee.salary),
      skills: newEmployee.skills.split(',').map(s => s.trim()).filter(s => s),
      certifications: newEmployee.certifications.split(',').map(c => c.trim()).filter(c => c)
    };
    addEmployeeMutation.mutate(employeeData);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your team and organizational structure</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="add-employee-button">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee record and set up their account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                    data-testid="employee-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                    data-testid="employee-last-name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="employee-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    data-testid="employee-department"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                    data-testid="employee-position"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: e.target.value }))}
                    data-testid="employee-salary"
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
                    data-testid="employee-hire-date"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={newEmployee.phoneNumber}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  data-testid="employee-phone"
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={newEmployee.skills}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Node.js, Python"
                  data-testid="employee-skills"
                />
              </div>
              <div>
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Input
                  id="certifications"
                  value={newEmployee.certifications}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="AWS Certified, Scrum Master"
                  data-testid="employee-certifications"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddEmployee}
                  disabled={addEmployeeMutation.isPending}
                  className="flex-1"
                  data-testid="save-employee-button"
                >
                  {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  data-testid="cancel-employee-button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="employee-search"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48" data-testid="department-filter">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2" data-testid="export-employees">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid gap-6">
        {employeesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employees found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || departmentFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Add your first employee to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.user.firstName} {employee.user.lastName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{employee.position}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {employee.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {employee.user.email}
                          </span>
                          {employee.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {employee.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEmployee(employee)}
                        data-testid={`edit-employee-${employee.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {employee.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateEmployeeMutation.mutate(employee.id)}
                          data-testid={`deactivate-employee-${employee.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Employee Details */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Employee ID:</span>
                        <p className="font-medium">{employee.employeeId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hire Date:</span>
                        <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Salary:</span>
                        <p className="font-medium">${employee.salary?.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {employee.skills?.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {employee.skills?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{employee.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}