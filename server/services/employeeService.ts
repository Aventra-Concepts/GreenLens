import { storage } from '../storage';
import { Employee, InsertEmployee } from '@shared/schema';
import { AdminAuthService } from './adminAuthService';

export interface EmployeeOnboardingData extends InsertEmployee {
  password: string;
  permissions: string[];
}

export interface EmployeeUpdate {
  department?: string;
  position?: string;
  roleId?: string;
  salary?: number;
  isActive?: boolean;
  managerId?: string;
  phoneNumber?: string;
  emergencyContact?: any;
  skills?: string[];
  certifications?: string[];
}

export class EmployeeService {
  /**
   * Onboard new employee with user account creation
   */
  static async onboardEmployee(data: EmployeeOnboardingData, createdBy: string): Promise<Employee> {
    try {
      // Create user account first
      const user = await storage.createUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        isAdmin: data.permissions.includes('admin'),
        isActive: true,
        emailVerified: true
      });

      // Create employee record
      const employee = await storage.createEmployee({
        ...data,
        userId: user.id,
        employeeId: await this.generateEmployeeId(),
        hireDate: new Date(),
        isActive: true
      });

      // Create role if permissions are provided
      if (data.permissions.length > 0) {
        await storage.createAdminRole({
          name: `${data.position}_${employee.id}`,
          description: `Role for ${data.firstName} ${data.lastName}`,
          permissions: data.permissions
        });
      }

      // Log the onboarding action
      await AdminAuthService.logAdminAction(
        createdBy,
        'employee_onboarded',
        {
          employeeId: employee.id,
          employeeName: `${data.firstName} ${data.lastName}`,
          department: data.department,
          position: data.position
        }
      );

      return employee;
    } catch (error) {
      console.error('Employee onboarding error:', error);
      throw new Error('Failed to onboard employee');
    }
  }

  /**
   * Update employee information
   */
  static async updateEmployee(
    employeeId: string, 
    updates: EmployeeUpdate, 
    updatedBy: string
  ): Promise<Employee> {
    const employee = await storage.updateEmployee(employeeId, updates);

    // Log the update action
    await AdminAuthService.logAdminAction(
      updatedBy,
      'employee_updated',
      {
        employeeId,
        updates,
        updatedFields: Object.keys(updates)
      }
    );

    return employee;
  }

  /**
   * Terminate employee
   */
  static async terminateEmployee(
    employeeId: string, 
    terminationDate: Date, 
    reason: string,
    terminatedBy: string
  ): Promise<void> {
    const employee = await storage.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update employee record
    await storage.updateEmployee(employeeId, {
      terminationDate,
      isActive: false
    });

    // Deactivate user account
    await storage.updateUserActiveStatus(employee.userId, false);

    // Revoke all admin sessions
    await storage.revokeAllUserAdminSessions(employee.userId);

    // Log termination
    await AdminAuthService.logAdminAction(
      terminatedBy,
      'employee_terminated',
      {
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        reason,
        terminationDate
      }
    );
  }

  /**
   * Get employee hierarchy (reporting structure)
   */
  static async getEmployeeHierarchy(): Promise<any> {
    const employees = await storage.getAllEmployees();
    return this.buildHierarchy(employees);
  }

  /**
   * Get employee performance metrics
   */
  static async getEmployeeMetrics(employeeId: string, dateRange: { start: Date; end: Date }) {
    return await storage.getEmployeeAnalytics(employeeId, dateRange);
  }

  /**
   * Assign role to employee
   */
  static async assignRole(
    employeeId: string, 
    roleId: string, 
    assignedBy: string
  ): Promise<void> {
    await storage.updateEmployee(employeeId, { roleId });

    const role = await storage.getAdminRole(roleId);
    await AdminAuthService.logAdminAction(
      assignedBy,
      'role_assigned',
      {
        employeeId,
        roleId,
        roleName: role?.name,
        permissions: role?.permissions
      }
    );
  }

  /**
   * Generate unique employee ID
   */
  private static async generateEmployeeId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await storage.getEmployeeCount();
    return `EMP${year}${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Build employee hierarchy tree
   */
  private static buildHierarchy(employees: Employee[]): any {
    const employeeMap = new Map();
    const hierarchy: any[] = [];

    // Create map of employees
    employees.forEach(emp => {
      employeeMap.set(emp.id, { ...emp, children: [] });
    });

    // Build hierarchy
    employees.forEach(emp => {
      if (emp.managerId && employeeMap.has(emp.managerId)) {
        employeeMap.get(emp.managerId).children.push(employeeMap.get(emp.id));
      } else {
        hierarchy.push(employeeMap.get(emp.id));
      }
    });

    return hierarchy;
  }

  /**
   * Get department statistics
   */
  static async getDepartmentStats(): Promise<any> {
    const employees = await storage.getAllEmployees();
    const stats: any = {};

    employees.forEach(emp => {
      if (!stats[emp.department]) {
        stats[emp.department] = {
          total: 0,
          active: 0,
          terminated: 0,
          positions: new Set()
        };
      }

      stats[emp.department].total++;
      if (emp.isActive) {
        stats[emp.department].active++;
      } else {
        stats[emp.department].terminated++;
      }
      stats[emp.department].positions.add(emp.position);
    });

    // Convert sets to arrays
    Object.keys(stats).forEach(dept => {
      stats[dept].positions = Array.from(stats[dept].positions);
    });

    return stats;
  }
}